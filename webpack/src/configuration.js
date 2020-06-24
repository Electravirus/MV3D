import mv3d from './mv3d.js';
import { Vector2, Color3, Color4 } from 'babylonjs';
import { FRONTSIDE, BACKSIDE, DOUBLESIDE } from './mod_babylon.js';
import { makeColor, relativeNumber, booleanString, falseString, booleanNumber, sleep, tileSize, tileWidth, tileHeight, deprecated } from './util.js';
import { Blender } from './blenders.js';

class ConfigurationFunction{
	constructor(parameters,func){
		this.groups = parameters.match(/\[?[^[\]|]+\]?/g);
		this.labels={};
		for(let i=0;i<this.groups.length;++i){
			while(this.groups[i]&&this.groups[i][0]==='['){
				this.labels[this.groups[i].slice(1,-1)]=i;
				this.groups.splice(i,1);
			}
			if( i > this.groups.length ){ break; }
			this.groups[i]=this.groups[i].split(',').map(s=>s.trim());
		}
		this.func=func;
	}
	run(conf,rawparams){
		const r=/([,|]+)? *(?:(\w+) *: *)?([^,|\r\n]+)/g
		let match;
		let i=0;
		let gi=0;
		const params={};
		for(let _gi=0;_gi<this.groups.length;++_gi){
			params[`group${_gi+1}`]=[];
		}
		while(match=r.exec(rawparams)){
			if(match[1])for(const delimiter of match[1]){
				if(delimiter===','){ ++i; }
				if(delimiter==='|'||i>=this.groups[gi].length){
					i=0; ++gi;
				}
			}
			if(match[2]){
				if(match[2] in this.labels){
					gi=this.labels[match[2]];
				}else{
					let foundMatch=false;
					grouploop:for(let _gi=0;_gi<this.groups.length;++_gi) for(let _i=0;_i<this.groups[_gi].length;++_i){
						if(this.groups[_gi][_i]===match[2]){
							foundMatch=true;
							gi=_gi; i=_i;
							break grouploop;
						}
					}
					if(!foundMatch){ break; }
				}
			}
			if(gi>this.groups.length){ break; }
			params[this.groups[gi][i]]=params[`group${gi+1}`][i]=match[3].trim();
		}
		this.func(conf,params);
	}
}
mv3d.ConfigurationFunction=ConfigurationFunction;

function TextureConfigurator(name,extraParams='',apply){
	const paramlist = `img,x,y,w,h|${extraParams}|alpha|glow[anim]animx,animy`;
	return new ConfigurationFunction(paramlist,function(conf,params){
		switch(params.group1.length){
		case 5:{
			const [img,x,y,w,h] = params.group1;
			readTextureConfigurations(name,conf,img,x,y,w,h);
			break;}
		case 4:{
			const [x,y,w,h] = params.group1;
			readTextureConfigurations(name,conf,null,x,y,w,h);
			break;}
		case 3:{
			const [img,x,y] = params.group1;
			readTextureConfigurations(name,conf,img,x,y,'1','1');
			break;}
		case 2:{
			const [x,y] = params.group1;
			readTextureConfigurations(name,conf,null,x,y,'1','1');
			break;}
		case 1:{
			const [img] = params.group1;
			readTextureConfigurations(name,conf,img,0,0,'100%','100%');
			//conf[`${name}_img`]=img;
			//conf[`${name}_id`] = 1;
			//conf[`${name}_rect`] = new PIXI.Rectangle(x,y,w,h);
			break;}
		}
		if(params.animx&&params.animy){
			conf[`${name}_animData`]={ animX:Number(params.animx), animY:Number(params.animy) };
		}
		if(params.alpha){
			conf[`${name}_alpha`]=Number(params.alpha);
		}
		if(params.glow){
			if(isNaN(params.glow)){
				conf[`${name}_glow`] = makeColor(params.glow);
			}else{
				conf[`${name}_glow`] = new Color4(Number(params.glow),Number(params.glow),Number(params.glow),1);
			}
		}
		if(apply){
			apply.call(this,conf,params);
		}
	});
}

function readTextureConfigurations(name,conf,img,xstr,ystr,wstr='1',hstr='1'){
	const validImg = mv3d.validTilesheetName(img);
	if(validImg){ img=img.toUpperCase(); }
	conf[`${name}_img`]=img;
	conf[`${name}_changed`]=true;
	let hasPixelValue=false;
	let hasPercentValue=false;
	const coords=[xstr,ystr,wstr,hstr].map(str=>{
		const coord = interpretTextureCoodinate(str);
		if(coord.isPixelValue){ hasPixelValue=true; }
		if(coord.percentValue){ hasPercentValue=true; }
		return coord;
	});
	coords.forEach(coord=>{
		if(hasPixelValue){ coord.usePixelValue(); }
	});
	let [xcoord,ycoord,wcoord,hcoord]=coords;
	let [x,y,w,h] = coords.map(coord=>coord.collapseValue());
	if(hasPercentValue){
	}else if(hasPixelValue){
		if(validImg&&!xcoord.isOffsetValue&&!ycoord.isOffsetValue){
			conf[`${name}_id`] = mv3d.constructTileId(img,1,0);
			conf[`${name}_rect`] = new PIXI.Rectangle(x,y,w,h);
			return;
		}
	}else if(w===1&&h===1){
		if((!img||validImg)&&xcoord.isOffsetValue&&ycoord.isOffsetValue){
			conf[`${name}_offset`] = new Vector2(Number(x),Number(y));
			return;
		}
		if(validImg&&!xcoord.isOffsetValue&&!ycoord.isOffsetValue){
			conf[`${name}_id`] = mv3d.constructTileId(img,x,y);
			return;
		}
	}
	wcoord.usePixelValue(); hcoord.usePixelValue();
	const textureCoords = {x:xcoord,y:ycoord,w:wcoord.collapseValue(),h:hcoord.collapseValue()};
	if(hasPercentValue){
		textureCoords.percentRect = new PIXI.Rectangle(xcoord.percentValue,ycoord.percentValue,wcoord.percentValue,hcoord.percentValue);
	}
	conf[`${name}_texture`] = textureCoords;
}

mv3d.finalizeTextureRect = function(rect,width,height){
	let {x,y,width:w,height:h} = rect;
	if(rect.percentRect){
		const pr = rect.percentRect;
		x+=pr.x*width; 
		y+=pr.y*height;
		w+=pr.width*width;
		h+=pr.height*height;
	}
	return new PIXI.Rectangle(x,y,w,h);
}

function interpretTextureCoodinate(nstr){
	const r = /(\+?-?)(\d+\.\d*|\d*\.?\d+)(px?|t|%)?/g;
	const coord = new TextureCoordinate();
	let match;
	while(match=r.exec(nstr)){
		const isRelative = Boolean(match[1]);
		const isNegative = match[1].includes('-');
		let unit = (match[3]||'t')[0];
		let num = Number(match[2]);
		if(isNegative){ num*=-1; }
		if(unit==='t'&&num%1||!match[3]&&match[2].includes('.')){ num=num*tileSize(); unit='p'; }
		if(unit==='t'){
			if(isRelative) coord.offsetTileValue(num);
			else coord.setTileValue(num);
		}else if(unit==='p'){
			if(isRelative) coord.offsetPixelValue(num);
			else coord.setPixelValue(num);
		}else if(unit==='%'){
			if(isRelative) coord.offsetPercentValue(num);
			else coord.setPercentValue(num);
		}
	}
	return coord;
}

class TextureCoordinate{
	constructor(){
		this.isPixelValue=false;
		this.baseValue=null;
		this.offsetValue=0;
		this.percentValue=0;
	}
	usePixelValue(){
		if(this.isPixelValue){ return; }
		this.isPixelValue=true;
		if(this.baseValue!=null){ this.baseValue*=tileSize(); }
		this.offsetValue*=tileSize();
	}
	setTileValue(v){
		if(this.isPixelValue){
			this.setPixelValue(v*tileSize());
			return;
		}
		this.baseValue=v;
	}
	setPixelValue(v){
		this.usePixelValue();
		this.baseValue=v;
	}
	offsetTileValue(v){
		if(this.isPixelValue){
			this.offsetPixelValue(v*tileSize());
			return;
		}
		this.offsetValue+=v;
	}
	offsetPixelValue(v){
		this.usePixelValue();
		this.offsetValue+=v;
	}
	setPercentValue(v){
		this.usePixelValue();
		if(this.baseValue===null){ this.baseValue=0; }
		this.percentValue=v/100;
	}
	offsetPercentValue(v){
		this.usePixelValue();
		this.percentValue+=v/100
	}
	collapseValue(){
		return (this.baseValue||0)+this.offsetValue;
	}
	get isOffsetValue(){
		return this.baseValue==null;
	}
}

Object.assign(mv3d,{
	tilesetConfigurations:{},
	loadTilesetSettings(){
		//tileset
		this.tilesetConfigurations={};
		const lines = this.readConfigurationBlocks($gameMap.tileset().note)
		+'\n'+this.readConfigurationBlocks(this.getDataMap().note,'mv3d-tiles');
		//const readLines = /^\s*([abcde]\d?\s*,\s*\d+\s*,\s*\d+)\s*:(.*)$/gmi;
		const readLines = /^\s*([abcde]\d?)\s*,\s*(\d+(?:-\d+)?)\s*,\s*(\d+(?:-\d+)?)\s*:(.*)$/gmi;
		let match;
		while(match = readLines.exec(lines)){
			const conf = this.readConfigurationFunctions(match[4],this.tilesetConfigurationFunctions);
			const range1 = match[2].split('-').map(s=>Number(s));
			const range2 = match[3].split('-').map(s=>Number(s));
			for(let kx=range1[0];kx<=range1[range1.length-1];++kx)
			for(let ky=range2[0];ky<=range2[range2.length-1];++ky){
				const key = `${match[1]},${kx},${ky}`;
				const tileId=this.constructTileId(...key.split(','));
				const appliedConf=mv3d.applyTextureConfigs(Object.assign({},conf),match[1],kx,ky);
				if(!(tileId in this.tilesetConfigurations)){
					this.tilesetConfigurations[tileId]={};
				}
				Object.assign(this.tilesetConfigurations[tileId],appliedConf);
			}

		}
	},
	mapConfigurations:{},
	loadMapSettings(){
		const dataMap = this.getDataMap();
		//map
		const mapconf=this.mapConfigurations=JSON.parse(JSON.stringify(this.MAP_DEFAULTS));
		this.readConfigurationFunctions(
			this.readConfigurationBlocks(dataMap.note),
			this.mapConfigurationFunctions,
			mapconf,
		);
		this._REGION_DATA_MAP={};
		const regionBlocks=this.readConfigurationBlocks(dataMap.note,'mv3d-regions');
		if(regionBlocks){
			const readLines = /^\s*(\d+)\s*:(.*)$/gm;
			let match;
			while(match = readLines.exec(regionBlocks)){
				if(!(match[1] in this._REGION_DATA_MAP)){
					if(match[1] in this._REGION_DATA){
						this._REGION_DATA_MAP[match[1]]=JSON.parse(JSON.stringify(this._REGION_DATA[match[1]]));
					}else{
						this._REGION_DATA_MAP[match[1]]={};
					}
				}
				this.readConfigurationFunctions(
					match[2],
					mv3d.tilesetConfigurationFunctions,
					this._REGION_DATA_MAP[match[1]],
				);
			}
		}
		for (const id in this._REGION_DATA_MAP){
			this.applyTextureConfigs(this._REGION_DATA_MAP[id],'B',0,0);
			this.collapseCeilingOffsets(this._REGION_DATA_MAP[id]);
		}
	},
	applyMapSettings(){
		const mapconf = this.mapConfigurations;
		if('fog' in mapconf){
			const fog = mapconf.fog;
			if('color' in fog){ this.blendFogColor.setValue(fog.color,0); }
			if('near' in fog){ this.blendFogNear.setValue(fog.near,0); }
			if('far' in fog){ this.blendFogFar.setValue(fog.far,0); }
			this.blendFogColor.update();
		}
		if('light' in mapconf){
			this.blendAmbientColor.setValue(mapconf.light.color,0);
			//this.blendLightIntensity.setValue(mapconf.light.intensity,0);
		}
		if('cameraDist' in mapconf){
			this.blendCameraDist.setValue(mapconf.cameraDist,0);
		}
		if ('cameraHeight' in mapconf){
			this.blendCameraHeight.setValue(mapconf.cameraHeight,0);
		}
		if('cameraMode' in mapconf){
			this.cameraMode=mapconf.cameraMode;
		}
		if('cameraPitch' in mapconf){
			this.blendCameraPitch.setValue(mapconf.cameraPitch,0);
		}
		if('cameraYaw' in mapconf){
			this.blendCameraYaw.setValue(mapconf.cameraYaw,0);
		}

		this.callFeatures('applyMapSettings',mapconf);
	},

	beforeMapLoad(newmap){
		if(newmap){
			if($gameVariables.mv3d){ delete $gameVariables.mv3d.disabled; }
			delete $gamePlayer._mv3d_z;
		}
		this.callFeatures('beforeMapLoad',newmap);
	},

	afterMapLoad(newmap){
		Blender.reset();

		mv3d.updateClearColor();

		this.callFeatures('afterMapLoad',newmap);
	},
    

	getMapConfig(key,dfault){
		return this.getConfig(this.mapConfigurations,key,dfault);
	},

	getConfig(conf,key,dfault){
		if(key in conf){
			return conf[key];
		}
		return dfault;
	},

	getCeilingConfig(tileConf={}){
		let conf={};
		const reassign=entry=>{
			const [key,value] = entry;
			if(key.startsWith('ceiling_')){
				conf[key.replace('ceiling_','bottom_')]=value;
			}
		}
		Object.entries(this.mapConfigurations).forEach(reassign);
		Object.entries(tileConf).forEach(reassign);
		const getConfig=(key,dfault)=>{
			return this.getConfig(tileConf,key,this.getMapConfig(key,dfault));
		};
		conf.bottom_id = getConfig('ceiling_id',0);
		conf.height = getConfig('ceiling_height',this.CEILING_HEIGHT);
		conf.twosided = getConfig('ceiling_backface',true);
		conf.isCeiling = true;
		return conf;
	},

	readConfigurationBlocksAndTags(note,tag='mv3d'){
		return this.readConfigurationBlocks(note,tag)+this.readConfigurationTags(note,tag);
	},

	readConfigurationBlocks(note,tag='mv3d'){
		const findBlocks = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`,'gi');
		let contents = '';
		let match;
		while(match = findBlocks.exec(note)){
			contents += match[1]+'\n';
		}
		return contents;
	},

	readConfigurationTags(note,tag='mv3d'){
		const findTags = new RegExp(`<${tag}:([\\s\\S]*?)>`,'gi');
		let contents='';
		let match;
		while(match = findTags.exec(note)){
			contents+=match[1]+'\n';
		}
		return contents;
	},

	readConfigurationFunctions(line,functionset=mv3d.tilesetConfigurationFunctions,conf={}){
		const readConfigurations = /(\w+)\((.*?)\)/g
		let match;
		while(match = readConfigurations.exec(line)){
			const key = match[1].toLowerCase();
			if(key in functionset){
				//functionset[key](conf, ...match[2].split('|').map(s=>s?s.split(','):[]) );
				if(functionset[key] instanceof ConfigurationFunction){
					functionset[key].run(conf,match[2]);
				}else{
					const args = match[2].split(',');
					if(args.length===1 && args[0]===''){ args.length=0; }
					functionset[key](conf, ...args);
				}
			}
		}
		return conf;
	},
	get configurationSides(){ return this.enumSides; },
	get configurationShapes(){ return this.enumShapes; },
	get configurationPassage(){ return this.enumPassage; },
	enumSides:{
		front:FRONTSIDE,
		back:BACKSIDE,
		double:DOUBLESIDE,
	},
	enumShapes:{
		FLAT:1,
		TREE:2,
		BOARD:2,
		BILLBOARD:2,
		CARDBOARD:2,
		SPRITE:3,
		FENCE:4,
		WALL:5,
		CROSS:6,
		XCROSS:7,
		'8CROSS':8,
		SLOPE:9,
		MESH:91,
		MODEL:92,
	},
	enumPassage:{
		WALL:0,
		FLOOR:1,
		THROUGH:2,
	},
	enumRenderGroups:{
		BACK:0,
		MAIN:1,
		FRONT:2,
	},
    

	tilesetConfigurationFunctions:{
		width(conf,n){ conf.width=Number(n); },
		height(conf,n){ conf.height=Number(n); },
		depth(conf,n){ conf.depth=Number(n); },
		fringe(conf,n){ conf.fringe=Number(n); },
		float(conf,n){ conf.float=Number(n); },
		slope(conf,n=1,d=null){
			conf.shape=mv3d.enumShapes.SLOPE;
			conf.slopeHeight=Number(n);
			if(d){ conf.slopeDirection=({n:2, s:8, e:4, w:6})[d.toLowerCase()[0]]; }
		},
		top:TextureConfigurator('top'),
		side:TextureConfigurator('side'),
		inside:TextureConfigurator('inside'),
		bottom:TextureConfigurator('bottom'),
		north:TextureConfigurator('north'),
		south:TextureConfigurator('south'),
		east:TextureConfigurator('east'),
		west:TextureConfigurator('west'),
		texture:Object.assign(TextureConfigurator('hybrid'),{
			func(conf,params){
				mv3d.tilesetConfigurationFunctions.top.func(conf,params);
				mv3d.tilesetConfigurationFunctions.side.func(conf,params);
			}
		}),
		get ceiling(){ return mv3d.mapConfigurationFunctions.ceiling; },
		shape(conf,name,data){
			conf.shape=mv3d.enumShapes[name.toUpperCase()];
			if(conf.shape===mv3d.enumShapes.SLOPE && data||!('slopeHeight' in conf)){ conf.slopeHeight=Number(data)||1; }
			if(data){
				if(conf.shape===mv3d.enumShapes.FENCE){ conf.fencePosts=booleanString(data); }
			}
		},
		alpha(conf,n){
			conf.transparent=true;
			conf.alpha=Number(n);
		},
		glow(conf,n,a=0){
			if(isNaN(n)){
				conf.glow = makeColor(n);
			}else{
				conf.glow = new Color4(Number(n),Number(n),Number(n),1);
			}
			conf.glow.a=booleanNumber(a);
		},
		ambient(conf,c){
			if(isNaN(c)){
				conf.ambient = makeColor(c);
			}else{
				conf.ambient = new Color3(Number(c),Number(c),Number(c));
			}
		},
		pass(conf,s=''){
			s=falseString(s.toLowerCase());
			if(!s || s[0]==='x'){
				conf.pass=mv3d.enumPassage.WALL;
			}else if(s[0]==='o'){
				conf.pass=mv3d.enumPassage.FLOOR;
			}else{
				conf.pass=mv3d.enumPassage.THROUGH;
			}
		},
		shadow(conf,b=true){
			conf.shadow=booleanString(b);
		},
		rot(conf,n){ conf.rot=Number(n); },
	},
	eventConfigurationFunctions:{
		height(conf,n){
			const height = Number(n);
			if(height<0){
				conf.zoff=height;
			}else{
				conf.height=height;
			}
			deprecated('event config height() is deprecated. Use elevation(), offset(), or zoff() instead.');
		},
		elevation(conf,n){ conf.height=Number(n); },
		z(conf,n){ conf.zlock=Number(n); },
		x(conf,n){ conf.xoff=Number(n); deprecated('event config x() is deprecated. Use offset() or xoff() instead.'); },
		y(conf,n){ conf.yoff=Number(n); deprecated('event config y() is deprecated. Use offset() or yoff() instead.'); },
		xoff(conf,n){ conf.xoff=Number(n); },
		yoff(conf,n){ conf.yoff=Number(n); },
		zoff(conf,n){ conf.zoff=Number(n); },
		offset:new ConfigurationFunction('x,y,z',function(conf,params){
			if(params.x)conf.xoff=Number(params.x);
			if(params.y)conf.yoff=Number(params.y);
			if(params.z)conf.zoff=Number(params.z);
		}),
		pos:new ConfigurationFunction('x,y,z',function(conf,params){
			if(!conf.pos){conf.pos={};}
			if(params.x){ conf.pos.x=params.x; }
			if(params.y){ conf.pos.y=params.y; }
			if(params.z){ conf.pos.z=params.z; }
		}),
		scale(conf,x,y=x){ conf.scale = new Vector2(Number(x),Number(y)); },
		rot(conf,n){ conf.rot=Number(n); },
		yaw(conf,n){ conf.yaw=Number(n); },
		pitch(conf,n){ conf.pitch=Number(n); },
		bush(conf,bool){ conf.bush = booleanString(bool); },
		shadow:new ConfigurationFunction('size,dist|3d',function(conf,params){
			let {size,dist,'3d':dyn} = params;
			if(dyn==null){ dyn=size!=null?size:true; }
			conf.dynShadow = dyn = booleanString(dyn);
			if(size!=null){ conf.shadow = booleanNumber(size); }
			if(dist!=null){ conf.shadowDist=Number(dist); }
		}),
		shape(conf,name){
			conf.shape=mv3d.enumShapes[name.toUpperCase()];
		},
		lamp:new ConfigurationFunction('color,intensity,range',function(conf,params){
			const {color='white',intensity=1,range=mv3d.LIGHT_DIST} = params;
			conf.lamp={color:makeColor(color).toNumber(),intensity:Number(intensity),distance:Number(range)};
		}),
		flashlight:new ConfigurationFunction('color,intensity,range,angle[dir]yaw,pitch',function(conf,params){
			const {color='white',intensity=1,range=mv3d.LIGHT_DIST,angle=mv3d.LIGHT_ANGLE} = params;
			conf.flashlight={color:makeColor(color).toNumber(),intensity:Number(intensity),distance:Number(range),angle:Number(angle)};
			if(params.yaw){ conf.flashlightYaw=params.yaw; }
			if(params.pitch){ conf.flashlightPitch=Number(params.pitch); }
		}),
		flashlightpitch(conf,deg='90'){ conf.flashlightPitch=Number(deg); },
		flashlightyaw(conf,deg='+0'){ conf.flashlightYaw=deg; },
		lightoffset:new ConfigurationFunction('x,y,z',function(conf,params){
			if(params.x){ conf.lampXoff = conf.flashlightXoff = +params.x; }
			if(params.y){ conf.lampYoff = conf.flashlightYoff = +params.y; }
			if(params.z){ conf.lampZoff = conf.flashlightZoff = +params.z; }
		}),
		lampoffset:new ConfigurationFunction('x,y,z',function(conf,params){
			if(params.x){ conf.lampXoff = +params.x; }
			if(params.y){ conf.lampYoff = +params.y; }
			if(params.z){ conf.lampZoff = +params.z; }
		}),
		flashlightoffset:new ConfigurationFunction('x,y,z',function(conf,params){
			if(params.x){ conf.flashlightXoff = +params.x; }
			if(params.y){ conf.flashlightYoff = +params.y; }
			if(params.z){ conf.flashlightZoff = +params.z; }
		}),
		lightheight(conf,n=1){
			deprecated('event lightHeight() is deprecated. Use lightOffset(z:) instead.');
			conf.lampZoff = conf.flashlightZoff = +n;
		},
		lampheight(conf,n=1){
			conf.lampZoff = Number(n);
			deprecated('event lampHeight() is deprecated. Use lampOffset(z:) instead.');
		},
		flashlightheight(conf,n=1){
			deprecated('event flashlightheight() is deprecated. Use flashlightOffset(z:) instead.');
			conf.flashlightZoff = Number(n);
		},
		
		alpha(conf,n){
			conf.alpha=Number(n);
		},
		glow(conf,n,a=0){
			if(isNaN(n)){
				conf.glow = makeColor(n);
			}else{
				conf.glow = new Color4(Number(n),Number(n),Number(n),1);
			}
			conf.glow.a=booleanNumber(a);
		},
		get ambient(){ return mv3d.tilesetConfigurationFunctions.ambient; },
		dirfix(conf,b){
			conf.dirfix=booleanString(b);
		},
		gravity(conf,b){
			conf.gravity=booleanNumber(b);
		},
		platform(conf,b){
			conf.platform=booleanString(b);
		},
		collide(conf,n){ conf.collide=booleanNumber(n); },
		trigger(conf,up,down=0){
			conf.trigger={
				up:Number(up),
				down:Number(down),
			}
		},
		pass(conf,s=''){
			s=falseString(s.toLowerCase());
			if(!s || s[0]==='x'){
				conf.platform=false;
				conf.collide=true;
			}else if(s[0]==='o'){
				conf.platform=true;
				if(conf.collide===false||conf.collide==null)conf.collide=true;
			}else{
				conf.platform=false;
				conf.collide=false;
			}
		},
		texture:(()=>{
			const configurator = TextureConfigurator('texture');
			return new ConfigurationFunction('img,x,y,w,h',(conf,params)=>{
				const img = (mv3d.validTilesheetName(params.img)?params.img.toUpperCase():params.img)||'B';
				let defaultTileId = `TILE_ID_${img}` in Tilemap ? Tilemap[`TILE_ID_${img}`] : 0;
				delete conf.texture_id;
				delete conf.texture_img;
				delete conf.texture_rect;
				delete conf.texture_offset;
				delete conf.texture_texture;
				configurator.func(conf,params);
				mv3d.applyTextureSideConfigs(conf,'texture',img||'B',0,0);
				mv3d._tileTextureOffset(conf,'texture',defaultTileId,defaultTileId);
				conf.texture_symbol=Symbol(`${img},${params.x},${params.y},${params.w},${params.h}`);
			});
		})(),
	},
	mapConfigurationFunctions:{
		get ambient(){ return this.light; },
		light(conf,color){
			if(color.toLowerCase()==='default'){ color=mv3d.AMBIENT_COLOR; }
			else{ color=makeColor(color).toNumber(); }
			conf.light={color:color};
		},
		fog:new ConfigurationFunction('color|near,far',function(conf,params){
			const {color,near,far} = params;
			if(!conf.fog){ conf.fog={}; }
			if(color){ conf.fog.color=makeColor(color).toNumber(); }
			if(near){ conf.fog.near=Number(near); }
			if(far){ conf.fog.far=Number(far); }
		}),
		camera:new ConfigurationFunction('yaw,pitch|dist|height|mode',function(conf,params){
			const {yaw,pitch,dist,height,mode}=params;
			if(yaw){ conf.cameraYaw=Number(yaw); }
			if(pitch){ conf.cameraPitch=Number(pitch) }
			if(dist){ conf.cameraDist=Number(dist); }
			if(height){ conf.cameraHeight=Number(height); }
			if(mode){ conf.cameraMode=mode; }
		}),
		ceiling:TextureConfigurator('ceiling','height,backface',function(conf,params){
			if(params.height){
				conf[`ceiling_height`]=Number(params.height);
			}
			if(params.backface){
				conf[`ceiling_backface`]=booleanString(params.backface);
			}
		}),
		edge(conf,b,data){
			b=b.toLowerCase();
			switch(b){
				case 'clamp':
					conf.edgeData=data==null?1:Number(data);
					conf.edge=b;
					break;
				default:
					conf.edge=booleanString(b);
			}
		},
		disable(conf,b=true){
			conf.disabled=booleanString(b);
		},
		enable(conf,b=true){
			conf.disabled=!booleanString(b);
		},
	},

	validTilesheetName(img){
		return /^(?:a[12345]|[bcde])$/i.test(img);
	},
	applyTextureConfigs(conf,img,tx,ty){
		for (const side of ['top','side','inside','bottom','north','south','east','west','ceiling']){
			this.applyTextureSideConfigs(conf,side,img,tx,ty);
		}
		return conf;
	},
	applyTextureSideConfigs(conf,side,img,tx,ty){
		let textureCoords = conf[`${side}_texture`];
		if(`${side}_img` in conf){ img=conf[`${side}_img`]; }
		//else{ conf[`${side}_img`]=img; }
		if(textureCoords){
			const {x:xcoord,y:ycoord,w,h}=textureCoords;
			if(!xcoord.isPixelValue){
				if(xcoord.isOffsetValue){ tx+=xcoord.offsetValue; }
				else{ tx=xcoord.collapseValue(); }
			}
			if(!ycoord.isPixelValue){
				if(ycoord.isOffsetValue){ ty+=ycoord.offsetValue; }
				else{ ty=ycoord.collapseValue(); }
			}
			let corner;
			const validImg=mv3d.validTilesheetName(img);
			if(validImg){
				let id=this.constructTileId(img,tx,ty);
				corner = mv3d.getTileCorner(id);
				corner.x*=tileWidth(); corner.y*=tileHeight();
			}else{
				corner={x:tx*tileWidth(),y:ty*tileHeight()};
			}
			if(xcoord.isPixelValue){
				if(xcoord.isOffsetValue){ corner.x+=xcoord.offsetValue; }
				else{ corner.x=xcoord.collapseValue(); }
			}
			if(ycoord.isPixelValue){
				if(ycoord.isOffsetValue){ corner.y+=ycoord.offsetValue; }
				else{ corner.y=ycoord.collapseValue(); }
			}
			
			const rect = new PIXI.Rectangle(corner.x,corner.y,w,h);
			if(textureCoords.percentRect){
				rect.percentRect=textureCoords.percentRect;
			}
			conf[`${side}_id`] = validImg?mv3d.constructTileId(img,1,0):1;
			conf[`${side}_rect`]=rect;
		}
	},
	collapseCeilingOffsets(conf){
		const img = conf.ceiling_img||'B';
		let defaultTileId = `TILE_ID_${img}` in Tilemap ? Tilemap[`TILE_ID_${img}`] : 0;
		this._tileTextureOffset(conf,'ceiling',defaultTileId,defaultTileId);
	},

});

// event config
const _event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function() {
	_event_setupPage.apply(this,arguments);
	if(this.mv3d_sprite){
		this.mv3d_needsConfigure=true;
		this.mv3d_sprite.eventConfigure();
	}
};

const _event_init = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = async function() {
	_event_init.apply(this,arguments);
	const event = this.event();
	let config = {};
	mv3d.readConfigurationFunctions(
		mv3d.readConfigurationTags(event.note),
		mv3d.eventConfigurationFunctions,
		config,
	);
	if('pos' in config){
		const pos = config.pos;
		if('x' in pos||'y' in pos){
			this.locate(
				relativeNumber(event.x,pos.x),
				relativeNumber(event.y,pos.y),
			);
		}
		if('z' in pos){
			this._mv3d_z = relativeNumber(mv3d.getWalkHeight(event.x,event.y),pos.z);
		}
	}
	if(!this.mv3d_blenders){
		this.mv3d_blenders={};
	}
	if('lamp' in config){
		this.mv3d_blenders.lampColor_r=config.lamp.color>>16;
		this.mv3d_blenders.lampColor_g=config.lamp.color>>8&0xff;
		this.mv3d_blenders.lampColor_b=config.lamp.color&0xff;
		this.mv3d_blenders.lampIntensity=config.lamp.intensity;
		this.mv3d_blenders.lampDistance=config.lamp.distance
	}
	if('flashlight' in config){
		this.mv3d_blenders.flashlightColor_r=config.flashlight.color>>16;
		this.mv3d_blenders.flashlightColor_g=config.flashlight.color>>8&0xff;
		this.mv3d_blenders.flashlightColor_b=config.flashlight.color&0xff;
		this.mv3d_blenders.flashlightIntensity=config.flashlight.intensity;
		this.mv3d_blenders.flashlightDistance=config.flashlight.distance;
		this.mv3d_blenders.flashlightAngle=config.flashlight.angle;
	}
	if('flashlightPitch' in config){
		this.mv3d_blenders.flashlightPitch=Number(config.flashlightPitch);
	}
	if('flashlightYaw' in config){
		this.mv3d_blenders.flashlightYaw=config.flashlightYaw;
	}
	this.mv3d_needsConfigure=true;

	await sleep();
	if(mv3d.mapLoaded){
		mv3d.createCharacterFor(this);
	}
};