import mv3d from './mv3d.js';
import { Texture, StandardMaterial, Color3, Color4 } from 'babylonjs';
import { tileWidth, tileHeight, unround } from './util.js';

Object.assign(mv3d,{

	animatedTextures:[],
	textureCache:{},
	materialCache:{},

	async createTexture(url){
		const textureUrl = await this.getTextureUrl(url);
		const texture = new BABYLON.Texture(textureUrl,mv3d.scene,!mv3d.MIPMAP,true,BABYLON.Texture.NEAREST_SAMPLINGMODE);
		return texture;
	},

	async getTextureUrl(url){
		const bitmap = ImageManager.loadNormalBitmap(encodeURI(url));
		if(Decrypter.hasEncryptedImages){
			await mv3d.waitBitmapLoaded(bitmap);
			return bitmap.canvas.toDataURL();
		}else{
			return bitmap._image.src;
		}
	},

	waitTextureLoaded(texture){return new Promise((resolve,reject)=>{
		if(texture.isReady()){ resolve(); }
		texture.onLoadObservable.addOnce(()=>{
			resolve(texture);
		});
	})},

	waitBitmapLoaded(bitmap){
		return new Promise(resolve=>bitmap.addLoadListener(()=>resolve(bitmap)));
	},

	async getCachedTilesetTexture(setN,animX=0,animY=0,options={}){
		const key = `TS:${setN}|${animX},${animY}${this.getExtraBit2(options)}`;
		if(key in this.textureCache){
			return this.textureCache[key];
		}
		const tsName = $gameMap.tileset().tilesetNames[setN];
		if(!tsName){
			return await this.getErrorTexture();
		}
		//const textureSrc=`img/tilesets/${tsName}.png`;
		const textureSrc=ImageManager.loadTileset(tsName)._url;
		const texture = await this.createTexture(textureSrc);
		texture.hasAlpha=true;
		this.textureCache[key]=texture;

		await this.waitTextureLoaded(texture);

		if(this.textureCache[key]!==texture){ return await this.getErrorTexture(); }
		texture.updateSamplingMode(1);
		//texture.wrapU = Texture.CLAMP_ADDRESSMODE;
		//texture.wrapV = Texture.CLAMP_ADDRESSMODE;
		if(options.cropTexture){
			const ct = options.cropTexture;
			texture.crop(ct.x,ct.y,ct.width,ct.height,true);
		}
		if(animX||animY){
			const { width, height } = texture.getBaseSize();
			texture.frameData = options.cropTexture || {x:0,y:0,width,height};
			texture.animX = animX;
			texture.animY = animY;
			this.animatedTextures.push(texture);
		}
		return texture;
		
	},

	async getErrorTexture(){
		if(this.errorTexture){ return this.errorTexture; }
		this.errorTexture = await this.createTexture(`${mv3d.MV3D_FOLDER}/errorTexture.png`);
		this.errorTexture.isError=true;
		this.errorTexture.dispose=()=>{};
		return this.errorTexture;
	},

	async getBushAlphaTexture(){
		if(this.bushAlphaTexture){ return this.bushAlphaTexture; }
		this.getBushAlphaTexture.getting=true;
		this.bushAlphaTexture = await this.createTexture(`${mv3d.MV3D_FOLDER}/bushAlpha.png`);
		this.bushAlphaTexture.getAlphaFromRGB=true;
		this.bushAlphaTexture.dispose=()=>{};
		this.getBushAlphaTexture.getting=false;
		return this.bushAlphaTexture;
	},
	getBushAlphaTextureSync(){
		if(this.bushAlphaTexture){ return this.bushAlphaTexture; }
		if(!this.getBushAlphaTexture.getting){
			this.getBushAlphaTexture();
		}
		return null;
	},

	async getCachedTilesetMaterial(setN,animX=0,animY=0,options={}){
		this.processMaterialOptions(options);
		const key = `TS:${setN}|${animX},${animY}|${this.getExtraBit(options)}${this.getExtraBit2(options)}`;
		if(key in this.materialCache){
			return this.materialCache[key];
		}
		const texture = await this.getCachedTilesetTexture(setN,animX,animY,options);
		const material = new StandardMaterial(key, this.scene);
		material.diffuseTexture=texture;
		if(options.transparent){
			material.opacityTexture=texture;
			material.alpha=options.alpha;
		}
		if(options.through){
			material.mv3d_through=true;
		}
		material.mv3d_noShadow=!options.shadow;
		material.alphaCutOff = mv3d.ALPHA_CUTOFF;
		material.ambientColor.set(1,1,1);
		material.mv3d_glowColor=options.glow;
		material.emissiveColor.copyFrom(options.glow);
		material.specularColor.set(0,0,0);
		material.backFaceCulling=options.backfaceCulling;
		material.twoSidedLighting=options.twosided;
		material.maxSimultaneousLights=this.LIGHT_LIMIT;
		this.materialCache[key]=material;
		return material;
	},

	async getCachedTilesetMaterialForTile(tileConf,side){
		const setN = mv3d.getSetNumber(tileConf[`${side}_id`]);
		const options = mv3d.getMaterialOptions(tileConf,side);
		const animData = mv3d.getTileAnimationData(tileConf,side);
		//console.log(options);
		return await mv3d.getCachedTilesetMaterial(setN,animData.animX,animData.animY,options);
	},

	getMaterialOptions(conf,side){
		const options={};
		if ('cropTexture' in conf){ options.cropTexture=conf.cropTexture; }
		if ('pass' in conf){ options.through=conf.pass===this.enumPassage.THROUGH; }
		if ('alpha' in conf){ options.alpha=conf.alpha; }
		if ('glow' in conf){ options.glow=conf.glow; }
		if ('shadow' in conf){ options.shadow=conf.shadow; }
		if(side){
			if(`${side}_alpha` in conf){ options.alpha=conf[`${side}_alpha`]; }
			if(`${side}_glow` in conf){ options.glow=conf[`${side}_glow`]; }
			if(`${side}_shadow` in conf){ options.shadow=conf[`${side}_shadow`]; }
		}
		if(conf.isCeiling){
			options.backfaceCulling=conf.backfaceCulling;
			options.through = conf.skylight;
		}
		if(conf.twosided){ options.backfaceCulling=false;options.twosided=true; }
		if('alpha' in options){ options.transparent=true; }
		return options;
	},

	processMaterialOptions(options){
		if('alpha' in options){
			options.alpha = Math.round(options.alpha*7)/7;
			if(options.alph<1){
				options.transparent=true;
			}
		}else{ options.alpha=1; }
		if('glow' in options){
			options.glow.r = unround(options.glow.r,255);
			options.glow.g = unround(options.glow.g,255);
			options.glow.b = unround(options.glow.b,255);
			options.glow.a = unround(options.glow.a,7);
		}else{ options.glow=new Color4(0,0,0,0); }
		if(!('shadow' in options)){options.shadow=true;}
		if(!('backfaceCulling' in options)){ options.backfaceCulling = mv3d.BACKFACE_CULLING; }
	},

	getExtraBit(options){
		let extra = 0;
		extra|=Boolean(options.transparent)<<0;
		extra|=7-options.alpha*7<<1;
		extra|=(!options.shadow)<<4;
		extra|=options.glow.a*7<<5;
		extra|=options.glow.toNumber()<<8;
		//out of bits.
		let string = extra.toString(36);
		extra = 0;
		extra|=Boolean(options.through)<<0;
		extra|=(!options.backfaceCulling)<<1;
		extra|=Boolean(options.twosided)<<2;
		string += ','+extra.toString(36);
		return string;
	},

	getExtraBit2(options){
		let string = '';
		if(options.cropTexture){
			const ct=options.cropTexture
			string += `|crop:${ct.x},${ct.y},${ct.width},${ct.height}`;
		}
		return string;
	},

	// animations

	lastAnimUpdate:0,
	animXFrame:0,
	animYFrame:0,
	animDirection:1,
	updateAnimations(){
		if( performance.now()-this.lastAnimUpdate <= this.ANIM_DELAY){ return; }
		this.lastAnimUpdate=performance.now();

		if(this.animXFrame<=0){
			this.animDirection=1;
		}else if(this.animXFrame>=2){
			this.animDirection=-1;
		}
		this.animXFrame += this.animDirection;
		this.animYFrame=(this.animYFrame+1)%3;
		for (const texture of this.animatedTextures){
			texture.crop(
				texture.frameData.x+texture.animX*this.animXFrame*tileWidth(),
				texture.frameData.y+texture.animY*this.animYFrame*tileHeight(),
				texture.frameData.width,
				texture.frameData.height,
				true
			);
		}
	},

});