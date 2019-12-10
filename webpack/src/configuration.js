import mv3d from './mv3d.js';
import { FRONTSIDE, BACKSIDE, DOUBLESIDE, Vector2 } from './mod_babylon.js';
import { makeColor, relativeNumber, booleanString, falseString } from './util.js';

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
		const r=/([,|])?(?:(\w+):)?([^,|\r\n]+)/g
		let match;
		let i=0;
		let gi=0;
		const params={};
		for(let _gi=0;_gi<this.groups.length;++_gi){
			params[`group${_gi+1}`]=[];
		}
		while(match=r.exec(rawparams)){
			if(match[1]==='|'||i>=this.groups[gi].length){
				i=0; ++gi;
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
			++i;
		}
		this.func(conf,params);
	}
}

function TextureConfigurator(name,extraParams=''){
	const paramlist = `img,x,y,w,h|${extraParams}|alpha|glow[anim]animx,animy`;
	return new ConfigurationFunction(paramlist,function(conf,params){
		if(params.group1.length===5){
			const [img,x,y,w,h] = params.group1;
			conf[`${name}_id`] = mv3d.constructTileId(img,0,0);
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
			conf[`${name}_glow`]=Number(params.glow);
		}
	});
}

Object.assign(mv3d,{
	tilesetConfigurations:{},
	loadTilesetSettings(){
		//tileset
		this.tilesetConfigurations={};
		const lines = this.readConfigurationBlocks($gameMap.tileset().note);
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
        
		if('fog' in mapconf){
			const fog = mapconf.fog;
			if('color' in fog){ this.blendFogColor.setValue(fog.color,0); }
			if('near' in fog){ this.blendFogNear.setValue(fog.near,0); }
			if('far' in fog){ this.blendFogFar.setValue(fog.far,0); }
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
		return conf;
	},

	readConfigurationBlocks(note){
		const findBlocks = /<MV3D>([\s\S]*?)<\/MV3D>/gi;
		let contents = '';
		let match;
		while(match = findBlocks.exec(note)){
			contents += match[1]+'\n';
		}
		return contents;
	},

	readConfigurationTags(note){
		const findTags = /<MV3D:([\s\S]*?)>/gi;
		let contents='';
		let match;
		while(match = findTags.exec(note)){
			contents+=match[1]+'\n';
		}
		return contents;
	},

	readConfigurationFunctions(line,functionset=mv3d.configurationFunctions,conf={}){
		const readConfigurations = /(\w+)\((.*?)\)/g
		let match;
		while(match = readConfigurations.exec(line)){
			const key = match[1].toLowerCase();
			if(key in functionset){
				//functionset[key](conf, ...match[2].split('|').map(s=>s?s.split(','):[]) );
				if(functionset[key] instanceof ConfigurationFunction){
					functionset[key].run(conf,match[2]);
				}else{
					functionset[key](conf, ...match[2].split(','));
				}
			}
		}
		return conf;
	},

	configurationSides:{
		front:FRONTSIDE,
		back:BACKSIDE,
		double:DOUBLESIDE,
	},
	configurationShapes:{
		FLAT:1,
		TREE:2,
		SPRITE:3,
		FENCE:4,
		CROSS:5,
		XCROSS:6,
		SLOPE:7,
    },
    

	tilesetConfigurationFunctions:{
		height(conf,n){ conf.height=Number(n); },
		depth(conf,n){ conf.depth=Number(n); },
		fringe(conf,n){ conf.fringe=Number(n); },
		float(conf,n){ conf.float=Number(n); },
		slope(conf,n=1){
			conf.shape=mv3d.configurationShapes.SLOPE;
			conf.slopeHeight=Number(n);
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
			conf.shape=mv3d.configurationShapes[name.toUpperCase()];
		},
		alpha(conf,n){
			conf.transparent=true;
			conf.alpha=Number(n);
		},
		glow(conf,n){ conf.glow=Number(n); },
	},
	eventConfigurationFunctions:{
		height(conf,n){ conf.height=Number(n); },
		z(conf,n){ conf.z=Number(n); },
		x(conf,n){ conf.x=Number(n); },
		y(conf,n){ conf.y=Number(n); },
		scale(conf,x,y=x){ conf.scale = new Vector2(Number(x),Number(y)); },
		rot(conf,n){ conf.rot=Number(n); },
		bush(conf,bool){ conf.bush = booleanString(bool); },
		shadow(conf,n,dist){
			conf.shadow = Number(falseString(n));
			if(dist!=null){ conf.shadowDist=Number(dist); }
		},
		shape(conf,name){
			conf.shape=mv3d.configurationShapes[name.toUpperCase()];
		},
		pos(conf,x,y){
			conf.pos={x:x,y:y};
		},
		lamp:new ConfigurationFunction('color,intensity,range',function(conf,params){
			const {color='white',intensity=1,range=mv3d.LIGHT_DIST} = params;
			conf.lamp={color:makeColor(color).toNumber(),intensity:Number(intensity),distance:Number(range)};
		}),
		flashlight:new ConfigurationFunction('color,intensity,range,angle|yaw,pitch',function(conf,params){
			const {color='white',intensity=1,range=mv3d.LIGHT_DIST,angle=mv3d.LIGHT_ANGLE} = params;
			conf.flashlight={color:makeColor(color).toNumber(),intensity:Number(intensity),distance:Number(range),angle:Number(angle)};
			if(params.yaw){ conf.flashlightYaw=params.yaw; }
			if(params.pitch){ conf.flashlightPitch=Number(params.pitch); }
		}),
		flashlightpitch(conf,deg='90'){ conf.flashlightPitch=Number(deg); },
		flashlightyaw(conf,deg='+0'){ conf.flashlightYaw=deg; },
		lightheight(conf,n=1){ conf.lightHeight = Number(n); },
		lightoffset(conf,x=0,y=0){ conf.lightOffset = {x:+x,y:+y}; },
		alpha(conf,n){
			conf.alpha=Number(n);
		},
		dirfix(conf,b){
			conf.dirfix=booleanString(b);
		}
	},
	mapConfigurationFunctions:{
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
		ceiling:TextureConfigurator('ceiling','height'),
		edge(conf,b){
			conf.edge=booleanString(b);
		},
		disable(conf){
			conf.disabled=true;
		}
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
Game_Event.prototype.initialize = function() {
	_event_init.apply(this,arguments);
	if(mv3d.mapLoaded){
		mv3d.createCharacterFor(this);
	}
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
};