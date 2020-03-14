import mv3d from './mv3d.js';
import { hexNumber,booleanString,falseString, makeColor } from './util.js';
import { Vector2, Texture, ORTHOGRAPHIC_CAMERA } from './mod_babylon.js';

let pluginName = 'mv3d';
if(!PluginManager._scripts.includes("mv3d")){
	if(PluginManager._scripts.includes("mv3d-babylon")){ pluginName='mv3d-babylon'; }
}

const parameters = PluginManager.parameters(pluginName);
export default parameters;

Object.assign(mv3d,{
	CAMERA_MODE:"PERSPECTIVE",
	ORTHOGRAPHIC_DIST:100,
	MV3D_FOLDER:"img/MV3D",

	ANIM_DELAY:Number(parameters.animDelay),
	ALPHA_CUTOFF:Math.max(0.01,parameters.alphatest),

	EDGE_FIX: Number(parameters.edgefix),
	ANTIALIASING: booleanString(parameters.antialiasing),
	FOV:Number(parameters.fov),

	WALL_HEIGHT:Number(parameters.wallHeight),
	TABLE_HEIGHT:Number(parameters.tableHeight),
	FRINGE_HEIGHT:Number(parameters.fringeHeight),
	CEILING_HEIGHT:Number(parameters.ceilingHeight),
	LAYER_DIST:Number(parameters.layerDist),

	ENABLED_DEFAULT: booleanString(parameters.enabledDefault),
	EVENTS_UPDATE_NEAR: booleanString(parameters.eventsUpdateNear),

	UNLOAD_CELLS: booleanString(parameters.unloadCells),
	CELL_SIZE: Number(parameters.cellSize),
	RENDER_DIST: Number(parameters.renderDist),
	MIPMAP:booleanString(parameters.mipmap),
	MIPMAP_OPTION:booleanString(parameters.mipmapOption),

	STAIR_THRESH: Number(parameters.stairThresh),
	WALK_OFF_EDGE:booleanString(parameters.walkOffEdge),
	WALK_ON_EVENTS:booleanString(parameters.walkOnEvents),
	GRAVITY:Number(parameters.gravity),

	FOG_COLOR: makeColor(parameters.fogColor).toNumber(),
	FOG_NEAR: Number(parameters.fogNear),
	FOG_FAR: Number(parameters.fogFar), 
	//AMBIENT_COLOR: makeColor(parameters.ambientColor).toNumber(),

	LIGHT_LIMIT: Number(parameters.lightLimit),
	LIGHT_HEIGHT: 0.5,
	LAMP_HEIGHT: 0.5,
	FLASHLIGHT_HEIGHT: 0.25,
	LIGHT_DECAY: 1,
	LIGHT_DIST: 3,
	LIGHT_ANGLE: 60,
	FLASHLIGHT_EXTRA_ANGLE: 10,
	FLASHLIGHT_INTENSITY_MULTIPLIER: 2,

	REGION_DATA:{},
	_REGION_DATA:{},
	_REGION_DATA_MAP:{},
	TTAG_DATA:{},

	EVENT_HEIGHT:Number(parameters.eventHeight),
	//VEHICLE_BUSH:booleanString(parameters.vehicleBush),
	BOAT_SETTINGS:JSON.parse(parameters.boatSettings),
	SHIP_SETTINGS:JSON.parse(parameters.shipSettings),
	AIRSHIP_SETTINGS:JSON.parse(parameters.airshipSettings),

	ALLOW_GLIDE: booleanString(parameters.allowGlide),

	SPRITE_OFFSET:Number(parameters.spriteOffset)/2,

	ENABLE_3D_OPTIONS:{disable:0,enable:1,submenu:2}[parameters['3dMenu'].toLowerCase()],

	TEXTURE_SHADOW: parameters.shadowTexture||'shadow',
	TEXTURE_BUSHALPHA: parameters.alphaMask||'bushAlpha',
	TEXTURE_ERROR: parameters.errorTexture||'errorTexture',

	DIR8MOVE: booleanString(parameters.dir8Movement),
	DIR8SMART: parameters.dir8Movement.includes("Smart"),
	DIR8_2D: !parameters.dir8Movement.includes("3D"),
	TURN_INCREMENT: Number(parameters.turnIncrement),
	WASD: booleanString(parameters.WASD),

	KEYBOARD_PITCH: booleanString(parameters.keyboardPitch),
	KEYBOARD_TURN: falseString(parameters.keyboardTurn),
	KEYBOARD_STRAFE: falseString(parameters.keyboardStrafe),

	YAW_SPEED: Number(parameters.yawSpeed)||90,
	PITCH_SPEED: Number(parameters.pitchSpeed)||90,

	TRIGGER_INFINITE: !booleanString(parameters.heightTrigger),

	setupParameters(){
		this.REGION_DATA=new Proxy(this._REGION_DATA,{
			get:(target,key)=>{
				if(key in this._REGION_DATA_MAP){ return this._REGION_DATA_MAP[key]; }
				if(key in this._REGION_DATA){ return this._REGION_DATA[key]; }
			},
			set:(target,key,value)=>{
				target[key]=value;
			},
			has:(target,key)=>{
				return key in this._REGION_DATA_MAP || key in this._REGION_DATA;
			},
		});
		for (let entry of JSON.parse(parameters.regions)){
			entry=JSON.parse(entry);
			const regionData = this.readConfigurationFunctions(entry.conf,this.tilesetConfigurationFunctions)
			this._REGION_DATA[entry.regionId]=regionData;
			
		}
		for (let entry of JSON.parse(parameters.ttags)){
			entry=JSON.parse(entry);
			this.TTAG_DATA[entry.terrainTag]=this.readConfigurationFunctions(entry.conf,this.tilesetConfigurationFunctions);
		}

		this.EVENT_CHAR_SETTINGS = this.readConfigurationFunctions(
			parameters.eventCharDefaults,
			this.eventConfigurationFunctions,
		);
		this.EVENT_OBJ_SETTINGS = this.readConfigurationFunctions(
			parameters.eventObjDefaults,
			this.eventConfigurationFunctions,
		);
		this.EVENT_TILE_SETTINGS = this.readConfigurationFunctions(
			parameters.eventTileDefaults,
			this.eventConfigurationFunctions,
		);

		this.BOAT_SETTINGS.big=booleanString(this.BOAT_SETTINGS.big);
		this.SHIP_SETTINGS.big=booleanString(this.SHIP_SETTINGS.big);
		this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height);
		this.AIRSHIP_SETTINGS.big=booleanString(this.AIRSHIP_SETTINGS.big);
		this.AIRSHIP_SETTINGS.bushLanding=booleanString(this.AIRSHIP_SETTINGS.bushLanding);

		this.BOAT_SETTINGS.conf = this.readConfigurationFunctions(
			this.BOAT_SETTINGS.conf,
			this.eventConfigurationFunctions,
		);
		this.SHIP_SETTINGS.conf = this.readConfigurationFunctions(
			this.SHIP_SETTINGS.conf,
			this.eventConfigurationFunctions,
		);
		this.AIRSHIP_SETTINGS.conf = this.readConfigurationFunctions(
			this.AIRSHIP_SETTINGS.conf,
			this.eventConfigurationFunctions,
		);

		//Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL=0;
	},

	updateParameters(){
		this.updateRenderDist();
		this.callFeatures('updateParameters');
	},
	updateRenderDist(){
		if(this.camera.mode===ORTHOGRAPHIC_CAMERA){
			this.camera.maxZ=this.renderDist;
			this.camera.minZ=-this.renderDist;
		}else{
			this.camera.maxZ=this.renderDist;
			this.camera.minZ=0.1;
		}
	},
});

Object.defineProperties(mv3d,{
	AMBIENT_COLOR:{
		get(){ return mv3d.featureEnabled('dynamicShadows')?0x888888:0xffffff; }
	},
	renderDist:{
		get(){ return Math.min(this.RENDER_DIST, mv3d.blendFogFar.currentValue()+7.5); }
	},
});