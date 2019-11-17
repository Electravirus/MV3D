import mv3d from './mv3d.js';
import { FRONTSIDE, BACKSIDE, DOUBLESIDE, Vector2 } from './mod_babylon.js';
import { makeColor, relativeNumber, booleanString } from './util.js';

Object.assign(mv3d,{
	tilesetConfigurations:{},
	mapConfigurations:{},
	loadMapSettings(){
		//tileset
		this.tilesetConfigurations={};
		const lines = this.readConfigurationBlocks($gameMap.tileset().note);
		const readLines = /^\s*([abcde]\d?\s*,\s*\d+\s*,\s*\d+)\s*:(.*)$/gmi;
		let match;
		while(match = readLines.exec(lines)){
			const key = match[1];
			const conf = this.readConfigurationFunctions(match[2],this.tilesetConfigurationFunctions);
			const tileId=this.constructTileId(...key.split(','));
			if(tileId in this.tilesetConfigurations){
				Object.assign(this.tilesetConfigurations[tileId],conf);
			}else{
				this.tilesetConfigurations[tileId]=conf;
			}
		}
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
				functionset[key](conf,...match[2].split(','));
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
    },
    

	tilesetConfigurationFunctions:{
		height(conf,n){ conf.height=Number(n); },
		fringe(conf,n){ conf.fringe=Number(n); },
		float(conf,n){ conf.float=Number(n); },
		texture(conf,img,x,y){
			const tileId = mv3d.constructTileId(img,x,y)
			conf.sideId = conf.topId = tileId;
		},
		top(conf,img,x,y){ conf.topId=mv3d.constructTileId(img,x,y); },
		side(conf,img,x,y){ conf.sideId=mv3d.constructTileId(img,x,y); },
		inside(conf,img,x,y){ conf.insideId=mv3d.constructTileId(img,x,y); },
		offset(conf,x,y){
			conf.offsetSide = conf.offsetTop = new Vector2(Number(x),Number(y));
		},
		offsettop(conf,x,y){
			conf.offsetTop = new Vector2(Number(x),Number(y));
		},
		offsetside(conf,x,y){
			conf.offsetSide = new Vector2(Number(x),Number(y));
		},
		offsetinside(conf,x,y){
			conf.offsetInside = new Vector2(Number(x),Number(y));
		},
		rect(conf,img,x,y,w,h){
			this.recttop(conf,img,x,y,w,h);
			this.rectside(conf,img,x,y,w,h);
		},
		recttop(conf,img,x,y,w,h){
			conf.topId = mv3d.constructTileId(img,0,0);
			conf.rectTop = new PIXI.Rectangle(x,y,w,h);
			conf.rectTop.setN = mv3d.getSetNumber(conf.topId);
		},
		rectside(conf,img,x,y,w,h){
			conf.sideId = mv3d.constructTileId(img,0,0);
			conf.rectSide = new PIXI.Rectangle(x,y,w,h);
			conf.rectSide.setN = mv3d.getSetNumber(conf.sideId);
		},
		rectinside(conf,img,x,y,w,h){
			conf.insideId = mv3d.constructTileId(img,0,0);
			conf.rectInside = new PIXI.Rectangle(x,y,w,h);
			conf.rectInside.setN = mv3d.getSetNumber(conf.insideId);
		},
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
		height(conf,n){
			conf.height=Number(n);
		},
		z(conf,n){ conf.z=Number(n); },
		x(conf,n){ conf.x=Number(n); },
		y(conf,n){ conf.y=Number(n); },
		side(conf,name){ conf.side=mv3d.configurationSides[name.toLowerCase()]; },
		scale(conf,x,y){ conf.scale = new Vector2(Number(x),Number(y)); },
		rot(conf,n){ conf.rot=Number(n); },
		bush(conf,bool){ conf.bush = bool.toLowerCase()=='true'; },
		shadow(conf,bool){ conf.shadow = bool.toLowerCase()=='true'; },
		shadowscale(conf,n){ conf.shadowScale = Number(n); },
		shape(conf,name){
			conf.shape=mv3d.configurationShapes[name.toUpperCase()];
		},
		pos(conf,x,y){
			conf.pos={x:x,y:y};
		},
		light(){ this.lamp(...arguments); },
		lamp(conf,color='ffffff',intensity=1,distance=mv3d.LIGHT_DIST){
			conf.lamp={color:makeColor(color).toNumber(),intensity:Number(intensity),distance:Number(distance)};
		},
		flashlight(conf,color='ffffff',intensity=1,distance=mv3d.LIGHT_DIST,angle=mv3d.LIGHT_ANGLE){
			conf.flashlight={color:makeColor(color).toNumber(),intensity:Number(intensity),distance:Number(distance),angle:Number(angle)};
		},
		flashlightpitch(conf,deg='90'){ conf.flashlightPitch=Number(deg); },
		flashlightyaw(conf,deg='+0'){ conf.flashlightYaw=deg; },
		lightheight(conf,n=1){ conf.lightHeight = Number(n); },
		lightoffset(conf,x=0,y=0){ conf.lightOffset = {x:+x,y:+y}; },
		alphatest(conf,n=1){ conf.alphaTest = Number(n); }
	},
	mapConfigurationFunctions:{
		light(conf,color){
			conf.light={color:makeColor(color).toNumber()};
		},
		fog(conf,color,near,far){
			if(!conf.fog){ conf.fog={}; }
			color=makeColor(color).toNumber(); near=Number(near); far=Number(far);
			if(!Number.isNaN(color)){ conf.fog.color=color; }
			if(!Number.isNaN(near)){ conf.fog.near=near; }
			if(!Number.isNaN(far)){ conf.fog.far=far; }
		},
		yaw(conf,n){this.camerayaw(conf,n);},
		pitch(conf,n){this.camerapitch(conf,n);},
		camerayaw(conf,n){ conf.cameraYaw=Number(n); },
		camerapitch(conf,n){ conf.cameraPitch=Number(n); },
		dist(conf,n){ this.cameradist(conf,n); },
		cameradist(conf,n){ conf.cameraDist=Number(n); },
		height(conf,n){ this.cameraheight(conf,n); },
		cameraheight(conf,n){ conf.cameraHeight=Number(n); },
		mode(conf,mode){ this.cameramode(conf,mode); },
		cameramode(conf,mode){ conf.cameraMode=mode; },
		edge(conf,bool){ conf.edge = booleanString(bool); },
		ceiling(conf,img,x,y,height=mv3d.CEILING_HEIGHT){
			conf.ceiling = mv3d.constructTileId(img,x,y);
			conf.ceilingHeight = height;
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