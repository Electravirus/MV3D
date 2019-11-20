import mv3d from './mv3d.js';
import { hexNumber,booleanString,falseString, makeColor } from './util.js';
import { Vector2 } from './mod_babylon.js';

const parameters = PluginManager.parameters('mv3d-babylon');
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

	CELL_SIZE:10,
	RENDER_DIST: Number(parameters.renderDist),

	FOG_COLOR: makeColor(parameters.fogColor).toNumber(),
	FOG_NEAR: Number(parameters.fogNear),
	FOG_FAR: Number(parameters.fogFar), 
	AMBIENT_COLOR: makeColor(parameters.ambientColor).toNumber(),


	LIGHT_HEIGHT: 0.5,
	LIGHT_DECAY: 1,
	LIGHT_DIST: 3,
	LIGHT_ANGLE: 45,

	CHARACTER_SHADOWS:booleanString(parameters.characterShadows),
	SHADOW_SCALE:Number(parameters.shadowScale),
	SHADOW_DIST:Number(parameters.shadowDist),

	KEYBOARD_PITCH: booleanString(parameters.keyboardPitch),
	KEYBOARD_TURN: booleanString(parameters.keyboardTurn),
	KEYBOARD_STRAFE: booleanString(parameters.keyboardStrafe),

	REGION_DATA:{},
	TTAG_DATA:{},

	EVENT_HEIGHT:Number(parameters.eventHeight),
	VEHICLE_BUSH:booleanString(parameters.vehicleBush),
	BOAT_SETTINGS:JSON.parse(parameters.boatSettings),
	SHIP_SETTINGS:JSON.parse(parameters.shipSettings),
	AIRSHIP_SETTINGS:JSON.parse(parameters.airshipSettings),


	setupParameters(){
		for (let entry of JSON.parse(parameters.regions)){
			entry=JSON.parse(entry);
			const regionData = this.readConfigurationFunctions(entry.conf,this.tilesetConfigurationFunctions)
			this.REGION_DATA[entry.regionId]=regionData;
			if ('height' in regionData){
				regionData.regionHeight = regionData.height;
				delete regionData.height;
			}
		}
		for (let entry of JSON.parse(parameters.ttags)){
			entry=JSON.parse(entry);
			this.TTAG_DATA[entry.terrainTag]=this.readConfigurationFunctions(entry.conf,this.tilesetConfigurationFunctions);
		}

		this.BOAT_SETTINGS.scale=Number(this.BOAT_SETTINGS.scale);
		this.BOAT_SETTINGS.zoff=Number(this.BOAT_SETTINGS.zoff);
		this.BOAT_SETTINGS.big=booleanString(this.BOAT_SETTINGS.big);
		this.SHIP_SETTINGS.scale=Number(this.SHIP_SETTINGS.scale);
		this.SHIP_SETTINGS.zoff=Number(this.SHIP_SETTINGS.zoff);
		this.SHIP_SETTINGS.big=booleanString(this.SHIP_SETTINGS.big);
		this.AIRSHIP_SETTINGS.scale=Number(this.AIRSHIP_SETTINGS.scale);
		this.AIRSHIP_SETTINGS.height=Number(this.AIRSHIP_SETTINGS.height);
		this.AIRSHIP_SETTINGS.shadowScale=Number(this.AIRSHIP_SETTINGS.shadowScale);
		this.AIRSHIP_SETTINGS.shadowDist=Number(this.AIRSHIP_SETTINGS.shadowDist);
		this.AIRSHIP_SETTINGS.big=booleanString(this.AIRSHIP_SETTINGS.big);
		this.AIRSHIP_SETTINGS.bushLanding=booleanString(this.AIRSHIP_SETTINGS.bushLanding);


		this.EVENT_SHAPE=this.configurationShapes[parameters.eventShape.toUpperCase()];
	},
});