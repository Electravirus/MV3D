import mv3d from './mv3d.js';
import { Texture, StandardMaterial, Color3, Color4 } from './mod_babylon.js';
import { tileWidth, tileHeight, unround } from './util.js';

Object.assign(mv3d,{

	animatedTextures:[],
	textureCache:{},
	materialCache:{},

	createTexture(url){return new Promise((resolve,reject)=>{
		const bitmap = ImageManager.loadNormalBitmap(encodeURI(url));
		if(Decrypter.hasEncryptedImages){
			bitmap.addLoadListener(()=>{
				const texture = new BABYLON.DynamicTexture('dt',{width:bitmap.width,height:bitmap.height},!mv3d.MIPMAP,BABYLON.Texture.NEAREST_SAMPLINGMODE);
				texture.updateSamplingMode(1);
				texture.getContext().drawImage(bitmap.canvas,0,0);
				texture.update();
				resolve(texture);
			});
		}else{
			const texture = new BABYLON.Texture(bitmap._image.src,mv3d.scene,!mv3d.MIPMAP,true,BABYLON.Texture.NEAREST_SAMPLINGMODE);
			resolve(texture);
		}

	})},

	waitTextureLoaded(texture){return new Promise((resolve,reject)=>{
		if(texture.isReady()){ resolve(); }
		texture.onLoadObservable.addOnce(()=>{
			resolve();
		});
	})},

	waitBitmapLoaded(bitmap){
		return new Promise(resolve=>bitmap.addLoadListener(resolve));
	},

	async getCachedTilesetTexture(setN,animX=0,animY=0){
		const key = `TS:${setN}|${animX},${animY}`;
		if(key in this.textureCache){
			return this.textureCache[key];
		}
		const tsName = $gameMap.tileset().tilesetNames[setN];
		if(!tsName){
			return await this.getErrorTexture();
		}
		const textureSrc=`img/tilesets/${tsName}.png`;
		const texture = await this.createTexture(textureSrc);
		texture.hasAlpha=true;
		this.textureCache[key]=texture;

		await this.waitTextureLoaded(texture);

		if(this.textureCache[key]!==texture){ return await this.getErrorTexture(); }
		texture.updateSamplingMode(1);
		if(animX||animY){
			const { width, height } = texture.getBaseSize();
			texture.frameData={x:0,y:0,w:width,h:height};
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
		const key = `TS:${setN}|${animX},${animY}|${this.getExtraBit(options)}`;
		if(key in this.materialCache){
			return this.materialCache[key];
		}
		const texture = await this.getCachedTilesetTexture(setN,animX,animY);
		const material = new StandardMaterial(key, this.scene);
		material.diffuseTexture=texture;
		if(options.transparent){
			material.opacityTexture=texture;
			material.alpha=options.alpha;
		}
		material.mv3d_noShadow=!options.shadow;
		material.alphaCutOff = mv3d.ALPHA_CUTOFF;
		material.ambientColor.set(1,1,1);
		material.mv3d_glowColor=options.glow;
		material.emissiveColor.copyFrom(options.glow);
		material.specularColor.set(0,0,0);
		if(!isNaN(this.LIGHT_LIMIT)){ material.maxSimultaneousLights=this.LIGHT_LIMIT; }
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
		}else{ options.glow=new Color4(0,0,0,0); }
		if(!('shadow' in options)){options.shadow=true;}
	},

	getExtraBit(options){
		let extra = 0;
		extra|=Boolean(options.transparent)<<0;
		extra|=7-options.alpha*7<<1;
		extra|=(!options.shadow)<<4;
		// 3 empty bits available here
		extra|=options.glow.toNumber()<<8;
		return extra.toString(36);
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
				texture.frameData.w,
				texture.frameData.h,
				true
			);
		}
	},

});