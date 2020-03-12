import mv3d from './mv3d.js';
import { FRONTSIDE, BACKSIDE, DOUBLESIDE, Vector2, Color3, Color4 } from './mod_babylon.js';
import { makeColor, relativeNumber, booleanString, falseString, booleanNumber, sleep } from './util.js';

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

function TextureConfigurator(name,extraParams=''){
	const paramlist = `img,x,y,w,h|${extraParams}|alpha|glow[anim]animx,animy`;
	return new ConfigurationFunction(paramlist,function(conf,params){
		if(params.group1.length===5){
			const [img,x,y,w,h] = params.group1;
			conf[`${name}_id`] = mv3d.constructTileId(img,1,0);
			conf[`${name}_rect`] = new PIXI.Rectangle(x,y,w,h);
		}else if(params.group1.length===3){
			const [img,x,y] = params.group1;
			conf[`${name}_id`] = mv3d.constructTileId(img,x,y);
		}else if(params.group1.length===2){
			const [x,y] = params.group1;
			conf[`${name}_offset`] = new Vector2(Number(x),Number(y));
		}
		if(params.animx&&params.animy){
			conf[`${name}_animData`]={ animX:Number(params.animx), animY:Number(params.animy) };
		}
		if(params.height){
			conf[`${name}_height`]=Number(params.height);
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
	});
}

Object.assign(mv3d,{
	tilesetConfigurations:{},
	loadTilesetSettings(){
		//tileset
		this.tilesetConfigurations={};
		const lines = this.readConfigurationBlocks($gameMap.tileset().note)
		+'\n'+this.readConfigurationBlocks($dataMap.note,'mv3d-tiles');
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
				if(!(tileId in this.tilesetConfigurations)){
					this.tilesetConfigurations[tileId]={};
				}
				Object.assign(this.tilesetConfigurations[tileId],conf);
			}

		}
	},
	mapConfigurations:{},
	loadMapSettings(){
		//map
		const mapconf=this.mapConfigurations={};
		this.readConfigurationFunctions(
			this.readConfigurationBlocks($dataMap.note),
			this.mapConfigurationFunctions,
			mapconf,
		);
		this._REGION_DATA_MAP={};
		const regionBlocks=this.readConfigurationBlocks($dataMap.note,'mv3d-regions');
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
		if($gameMap.parallaxName()){
			mv3d.scene.clearColor.set(...mv3d.blendFogColor.currentComponents(),0);
		}else{
			mv3d.scene.clearColor.set(...mv3d.blendFogColor.currentComponents(),1);
		}

		this.callFeatures('applyMapSettings',mapconf);
	},
    

	getMapConfig(key,dfault){
		if(key in this.mapConfigurations){
			return this.mapConfigurations[key];
		}
		return dfault;
	},

	getCeilingConfig(){
		let conf={};
		for (const key in this.mapConfigurations){
			if(key.startsWith('ceiling_')){
				conf[key.replace('ceiling_','bottom_')]=this.mapConfigurations[key];
			}
		}
		conf.bottom_id = this.getMapConfig('ceiling_id',0);
		conf.height = this.getMapConfig('ceiling_height',this.CEILING_HEIGHT);
		conf.skylight = this.getMapConfig('ceiling_skylight',false);
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
		SPRITE:3,
		FENCE:4,
		WALL:4,
		CROSS:5,
		XCROSS:6,
		SLOPE:7,
	},
	enumPassage:{
		WALL:0,
		FLOOR:1,
		THROUGH:2,
	},
    

	tilesetConfigurationFunctions:{
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
		texture:Object.assign(TextureConfigurator('hybrid'),{
			func(conf,params){
				mv3d.tilesetConfigurationFunctions.top.func(conf,params);
				mv3d.tilesetConfigurationFunctions.side.func(conf,params);
			}
		}),
		shape(conf,name){
			conf.shape=mv3d.enumShapes[name.toUpperCase()];
			if(conf.shape===mv3d.enumShapes.SLOPE && !('slopeHeight' in conf)){ conf.slopeHeight=1; }
		},
		alpha(conf,n){
			conf.transparent=true;
			conf.alpha=Number(n);
		},
		glow(conf,n){
			if(isNaN(n)){
				conf.glow = makeColor(n);
			}else{
				conf.glow = new Color4(Number(n),Number(n),Number(n),1);
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
	},
	eventConfigurationFunctions:{
		height(conf,n){ conf.height=Number(n); },
		z(conf,n){ conf.z=Number(n); },
		x(conf,n){ conf.x=Number(n); },
		y(conf,n){ conf.y=Number(n); },
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
		pos(conf,x,y){
			conf.pos={x:x,y:y};
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
		lightheight(conf,n=1){ this.lampheight(conf,n); this.flashlightheight(conf,n); },
		lightoffset(conf,x=0,y=0){ this.lampoffset(conf,x,y); this.flashlightoffset(conf,x,y); },
		lampheight(conf,n=1){ conf.lampHeight = Number(n); },
		lampoffset(conf,x=0,y=0){ conf.lampOffset = {x:+x,y:+y}; },
		flashlightheight(conf,n=1){ conf.flashlightHeight = Number(n); },
		flashlightoffset(conf,x=0,y=0){ conf.flashlightOffset = {x:+x,y:+y}; },
		alpha(conf,n){
			conf.alpha=Number(n);
		},
		glow(conf,n){
			if(isNaN(n)){
				conf.glow = makeColor(n);
			}else{
				conf.glow = new Color4(Number(n),Number(n),Number(n),1);
			}
		},
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
			}else{
				conf.platform=false;
				conf.collide=false;
			}
		},
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
		ceiling:TextureConfigurator('ceiling','height,skylight'),
		edge(conf,b){
			conf.edge=booleanString(b);
		},
		disable(conf,b=true){
			conf.disabled=booleanString(b);
		},
		enable(conf,b=true){
			conf.disabled=!booleanString(b);
		},
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
		this.locate(
			relativeNumber(event.x,config.pos.x),
			relativeNumber(event.y,config.pos.y),
		);
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