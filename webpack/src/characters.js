import mv3d from './mv3d.js';
import { TransformNode, MeshBuilder, FRONTSIDE, Texture, StandardMaterial, Color3, Mesh, WORLDSPACE, Vector2, SpotLight, Vector3, PointLight, LOCALSPACE, DOUBLESIDE, Plane } from "./mod_babylon.js";
import { relativeNumber, ZAxis, YAxis, tileSize, degtorad, XAxis } from './util.js';
import { ColorBlender, Blender } from './blenders.js';

Object.assign(mv3d,{
	createCharacters(){
		const events = $gameMap.events();
		for (const event of events){
			this.createCharacterFor(event,0);
		}
		const vehicles = $gameMap.vehicles();
		for (const vehicle of vehicles){
			this.createCharacterFor(vehicle,1);
		}
		const followers = $gamePlayer.followers()._data;
		for (let f=followers.length-1; f>=0; --f){
			this.createCharacterFor(followers[f],29-f);
		}
		this.createCharacterFor($gamePlayer,30);
	},

	createCharacterFor(char,order){
		if(!char.mv3d_sprite){
			const sprite = new Character(char,order);
			Object.defineProperty(char,'mv3d_sprite',{
				value:sprite,
				configurable:true,
			});
			this.characters.push(sprite);
			return sprite;
		}
		return char.mv3d_sprite;
	},

	updateCharacters(){
		for(const char of this.characters){
			char.update();
		}
	},

	setupSpriteMeshes(){
		Sprite.Meshes = {};
		Sprite.Meshes.FLAT=Mesh.MergeMeshes([MeshBuilder.CreatePlane('sprite mesh',{ sideOrientation: DOUBLESIDE},mv3d.scene).rotate(XAxis,Math.PI/2,WORLDSPACE)]);
		Sprite.Meshes.SPRITE=Mesh.MergeMeshes([MeshBuilder.CreatePlane('sprite mesh',{sideOrientation: DOUBLESIDE},mv3d.scene).translate(YAxis,0.5,WORLDSPACE)]);
		Sprite.Meshes.CROSS=Mesh.MergeMeshes([
			Sprite.Meshes.SPRITE.clone(),
			Sprite.Meshes.SPRITE.clone().rotate(YAxis,Math.PI/2,WORLDSPACE),
		]);

		Sprite.Meshes.SHADOW=Sprite.Meshes.FLAT.clone('shadow mesh');
		const shadowTexture = new Texture(`${mv3d.MV3D_FOLDER}/shadow.png`);
		const shadowMaterial = new StandardMaterial('shadow material', mv3d.scene);
		shadowMaterial.diffuseTexture=shadowTexture;
		shadowMaterial.opacityTexture=shadowTexture;
		shadowMaterial.specularColor.set(0,0,0);
		Sprite.Meshes.SHADOW.material=shadowMaterial;
		
		for (const key in Sprite.Meshes){
			mv3d.scene.removeMesh(Sprite.Meshes[key]);
		}
	},
});


class Sprite extends TransformNode{
	constructor(){
		super('sprite',mv3d.scene);
		this.spriteOrigin = new TransformNode('sprite origin',mv3d.scene);
		this.spriteOrigin.parent=this;
		this.mesh = Sprite.Meshes.FLAT.clone();
		this.mesh.parent = this.spriteOrigin;
	}
	setMaterial(src){
		this.disposeMaterial();
		this.texture = new Texture(src,mv3d.scene);
		this.bitmap = this.texture._texture;
		this.texture.hasAlpha=true;
		this.texture.onLoadObservable.addOnce(()=>this.onTextureLoaded());
		this.material = new StandardMaterial('sprite material',mv3d.scene);
		this.material.diffuseTexture=this.texture;
		this.material.alphaCutOff = mv3d.ALPHA_CUTOFF;
		this.material.ambientColor.set(1,1,1);
		this.material.specularColor.set(0,0,0);
		if(!isNaN(this.LIGHT_LIMIT)){ this.material.maxSimultaneousLights=this.LIGHT_LIMIT; }
		this.mesh.material=this.material;
	}
	onTextureLoaded(){
		this.texture.updateSamplingMode(1);
	}
	disposeMaterial(){
		if(this.material){
			this.material.dispose();
			this.texture.dispose();
			this.material=null;
			this.texture=null;
			this.bitmap=null;
		}
	}
	dispose(...args){
		this.disposeMaterial();
		super.dispose(...args);
	}
}

const z_descriptor = {
	configurable: true,
	get(){ return this._mv3d_z; },
	set(v){
		this._mv3d_z=v;
		if(this.mv3d_sprite){ this.mv3d_sprite.position.y=v; }
	}
}
const z_descriptor2 = {
	configurable: true,
	get(){ return this.char._mv3d_z; },
	set(v){
		this.char._mv3d_z=v;
		this.position.y=v;
	}
}

class Character extends Sprite{
	constructor(char,order){
		super();
		this.order=order;
		this.mesh.order=this.order;
		this.mesh.character=this;
		this._character=this.char=char;
		this.charName='';
		this.charIndex=0;

		this.updateCharacter();
		this.updateShape();

		this.isVehicle = this.char instanceof Game_Vehicle;
		this.isBoat = this.isVehicle && this.char.isBoat();
		this.isShip = this.isVehicle && this.char.isShip();
		this.isAirship = this.isVehicle && this.char.isAirship();
		this.isEvent = this.char instanceof Game_Event;
		this.isPlayer = this.char instanceof Game_Player;
		this.isFollower = this.char instanceof Game_Follower;

		if(!('_mv3d_z' in this.char)){
			this.char._mv3d_z = mv3d.getWalkHeight(this.char.x,this.char.y);
		}
		Object.defineProperty(this.char,'z',z_descriptor);
		Object.defineProperty(this,'z',z_descriptor2);
		this.z=this.z;
		this.platformHeight = this.z;
		this.targetElevation = this.z;
		//this.elevation = 0;

		if(!this.char.mv3d_blenders){ this.char.mv3d_blenders={}; }
		//if(!this.char.mv3d_attr){ this.char.mv3d_attr={}; }

		//if(mv3d.CHARACTER_SHADOWS){
			//this.shadow = Sprite.Meshes.SHADOW.createInstance();
			this.shadow = Sprite.Meshes.SHADOW.clone();
			//this.shadow.parent=this.spriteOrigin;
			this.shadow.parent = this;
		//}

		this.blendElevation = this.makeBlender('elevation',0);

		this.lightOrigin = new TransformNode('light origin',mv3d.scene);
		this.lightOrigin.parent=this;
		this.setupLights();
		
		if(this.isEvent){
			this.eventConfigure();
		}else{
			this.initialConfigure();
			this.configureTexture();
		}
	}

	isTextureReady(){
		return Boolean(this.texture && this.texture.isReady());
	}

	setTileMaterial(){
		const setN = mv3d.getSetNumber(this._tileId);
		const tsName = $gameMap.tileset().tilesetNames[setN];
		if(tsName){
			const textureSrc=`img/tilesets/${tsName}.png`;
			this.setMaterial(textureSrc);
		}else{
			this.setMaterial("MV3D/errorTexture.png");
		}
	}

	onTextureLoaded(){
		super.onTextureLoaded();
		this.updateFrame();
		this.updateScale();
		this.configureTexture();
	}

	updateCharacter(){
		this._tilesetId = $gameMap.tilesetId();
		this._tileId = this._character.tileId();
		this._characterName = this._character.characterName();
		this._characterIndex = this._character.characterIndex();
		this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
		if(this._tileId>0){
			this.setTileMaterial(this._tileId);
		}else if(this._characterName){
			this.setMaterial(`img/characters/${this._characterName}.png`);
		}else{
			this.setEnabled(false);
			this.spriteWidth=1;
			this.spriteHeight=0;
		}
	}
	updateCharacterFrame(){
		this.px=this.characterPatternX();
		this.py=this.characterPatternY();
		if(!this.isTextureReady()){ return; }
		const pw = this.patternWidth();
		const ph = this.patternHeight();
		const sx = (this.characterBlockX() + this.px) * pw;
		const sy = (this.characterBlockY() + this.py) * ph;
		this.setFrame(sx,sy,pw,ph);
	}
	patternChanged(){
		return this.px!==this.characterPatternX() || this.py!==this.characterPatternY();
	}
	characterPatternY(){
		const dirfix = this.getConfig('dirfix', this.isEvent && this.char.isObjectCharacter());
		if(dirfix){
			return this.char.direction()/2-1;
		}
		let dir = mv3d.transformDirectionYaw(this.char.direction());
		return dir/2-1;
	}

	setFrame(x,y,w,h){
		if(!this.isTextureReady()){ return; }
		this.texture.crop(x,y,w,h);
	}

	updateScale(){
		if(!this.isTextureReady()){ return; }
		const configScale = this.getConfig('scale',new Vector2(1,1));
		this.spriteWidth=this.patternWidth()/tileSize() * configScale.x;
		this.spriteHeight=this.patternHeight()/tileSize() * configScale.y;
		const xscale = this.spriteWidth;
		const yscale = this.spriteHeight;

		this.mesh.scaling.set(xscale,yscale,yscale);
	}

	getDefaultConfigObject(){
		if(this.isVehicle){
			return mv3d[`${this.char._type.toUpperCase()}_SETTINGS`].conf;
		}
		if(this.char.isTile()){
			return mv3d.EVENT_TILE_SETTINGS;
		}else if(this.isEvent && this.char.isObjectCharacter()){
			return mv3d.EVENT_OBJ_SETTINGS;
		}else{
			return mv3d.EVENT_CHAR_SETTINGS;
		}
	}

	getConfig(key,dfault=undefined){
		if(this.settings_event_page && key in this.settings_event_page){
			return this.settings_event_page[key];
		}else if(this.settings_event && key in this.settings_event){
			return this.settings_event[key];
		}
		const EVENT_SETTINGS = this.getDefaultConfigObject();
		if(key in EVENT_SETTINGS){
			return EVENT_SETTINGS[key];
		}
		return dfault;
	}
	hasConfig(key){
		return this.settings_event_page && key in this.settings_event_page
		|| this.settings_event && key in this.settings_event
		|| key in this.getDefaultConfigObject();
	}

	eventConfigure(){
		if(!this.settings_event){
			this.settings_event={};
			const note = this.char.event().note;
			mv3d.readConfigurationFunctions(
				mv3d.readConfigurationTags(note),
				mv3d.eventConfigurationFunctions,
				this.settings_event,
			);

			this.initialConfigure();
		}
		this.settings_event_page={};
		const page = this.char.page();
		if(!page){ return; }
		let comments = '';
		for (const command of page.list){
			if(command.code===108||command.code===408){
				comments+=command.parameters[0];
			}
		}
		mv3d.readConfigurationFunctions(
			mv3d.readConfigurationTags(comments),
			mv3d.eventConfigurationFunctions,
			this.settings_event_page,
		);
		this.updateScale();
		this.updateShape();

		if(this.char.mv3d_needsConfigure){
			this.char.mv3d_needsConfigure=false;
		}else{ return; }

		this.pageConfigure();

		this.configureTexture();
	}

	initialConfigure(){
		this.configureHeight();
	}

	pageConfigure(){
		if('pos' in this.settings_event_page){
			const event=this.char.event();
			const pos = this.settings_event_page.pos;
			this.char.locate(
				relativeNumber(event.x,pos.x),
				relativeNumber(event.y,pos.y),
			);
		}
		this.setupEventLights();

		if('lamp' in this.settings_event_page){
			const lampConfig = this.getConfig('lamp');
			this.blendLampColor.setValue(lampConfig.color,0.5);
			this.blendLampIntensity.setValue(lampConfig.intensity,0.5);
			this.blendLampDistance.setValue(lampConfig.distance,0.5);
		}
		if('flashlight' in this.settings_event_page){
			const flashlightConfig = this.getConfig('flashlight');
			this.blendFlashlightColor.setValue(flashlightConfig.color,0.5);
			this.blendFlashlightIntensity.setValue(flashlightConfig.intensity,0.5);
			this.blendFlashlightDistance.setValue(flashlightConfig.distance,0.5);
			this.blendFlashlightAngle.setValue(flashlightConfig.angle,0.5);
			this.blendFlashlightPitch.setValue(this.getConfig('flashlightPitch',90),0.25);
			this.flashlightTargetYaw=this.getConfig('flashlightYaw','+0');
		}
		if('height' in this.settings_event_page || this.isAbove!==(this.char._priorityType===2)){
			this.configureHeight();
		}
	}

	configureTexture(){
		if(this.material){
			const glow = this.getConfig('glow',0);
			this.material.emissiveColor.set(glow,glow,glow);
		}
	}

	configureHeight(){
		this.isAbove = this.char._priorityType===2;
		let height = Math.max(0, this.getConfig('height',this.isAbove&&!this.hasConfig('z')?mv3d.EVENT_HEIGHT:0) );
		this.blendElevation.setValue(height,0);
		this.z = this.platformHeight + height;
	}

	setupMesh(){
		if(!this.mesh.mv3d_isSetup){
			mv3d.callFeatures('createCharMesh',this.mesh);
			this.mesh.parent = this.spriteOrigin;
			this.mesh.character=this;
			this.mesh.order=this.order;
			if(this.material){
				this.mesh.material=this.material;
			}
			this.mesh.mv3d_isSetup=true;
		}
		if(this.flashlight){
			this.flashlight.excludedMeshes.splice(0,Infinity);
			this.flashlight.excludedMeshes.push(this.mesh);
		}
	}

	setupEventLights(){
		const flashlightConfig = this.getConfig('flashlight');
		const lampConfig = this.getConfig('lamp');
		if(flashlightConfig && !this.flashlight){
			this.setupFlashlight();
		}
		if(lampConfig && !this.lamp){
			this.setupLamp();
		}
	}
	setupLights(){
		if('flashlightColor' in this.char.mv3d_blenders){
			this.setupFlashlight();
		}
		if('lampColor' in this.char.mv3d_blenders){
			this.setupLamp();
		}
	}

	setupFlashlight(){
		if(this.flashlight){ return; }
		const config = this.getConfig('flashlight',{
			color:0xffffff,
			intensity:1,
			distance:mv3d.LIGHT_DIST,
			angle:mv3d.LIGHT_ANGLE,
		});
		this.blendFlashlightColor = this.makeColorBlender('flashlightColor',config.color);
		this.blendFlashlightIntensity = this.makeBlender('flashlightIntensity',config.intensity);
		this.blendFlashlightDistance = this.makeBlender('flashlightDistance',config.distance);
		this.blendFlashlightAngle = this.makeBlender('flashlightAngle',config.angle);
		this.flashlight = new SpotLight('flashlight',Vector3.Zero(),Vector3.Zero(),
			degtorad(this.blendFlashlightAngle.targetValue()+mv3d.FLASHLIGHT_EXTRA_ANGLE),0,mv3d.scene);
		this.flashlight.renderPriority=2;
		this.updateFlashlightExp();
		this.flashlight.range = this.blendFlashlightDistance.targetValue();
		this.flashlight.intensity=this.blendFlashlightIntensity.targetValue();
		this.flashlight.diffuse.set(...this.blendFlashlightColor.targetComponents());
		//this.flashlight.projectionTexture = mv3d.getFlashlightTexture();
		this.flashlight.direction.y=-1;
		this.flashlightOrigin=new TransformNode('flashlight origin',mv3d.scene);
		this.flashlightOrigin.parent=this.lightOrigin;
		this.flashlight.parent=this.flashlightOrigin;
		this.blendFlashlightPitch = this.makeBlender('flashlightPitch',70);
		this.blendFlashlightYaw = this.makeBlender('flashlightYaw', 0);
		this.blendFlashlightYaw.cycle=360;
		this.flashlightTargetYaw=this.getConfig('flashlightYaw','+0');
		this.updateFlashlightDirection();
		this.setupMesh();
	}

	updateFlashlightExp(){
		this.flashlight.exponent = 64800*Math.pow(this.blendFlashlightAngle.targetValue(),-2);
	}

	setupLamp(){
		if(this.lamp){ return; }
		const config = this.getConfig('lamp',{
			color:0xffffff,
			intensity:1,
			distance:mv3d.LIGHT_DIST,
		});
		this.blendLampColor = this.makeColorBlender('lampColor',config.color);
		this.blendLampIntensity = this.makeBlender('lampIntensity',config.intensity);
		this.blendLampDistance = this.makeBlender('lampDistance',config.distance);
		this.lamp = new PointLight('lamp',Vector3.Zero(),mv3d.scene);
		this.lamp.renderPriority=1;
		this.lamp.diffuse.set(...this.blendLampColor.targetComponents());
		this.lamp.intensity=this.blendLampIntensity.targetValue();
		this.lamp.range=this.blendLampDistance.targetValue();
		this.lamp.parent=this.lightOrigin;
	}

	updateFlashlightDirection(){
		this.flashlightOrigin.yaw=this.blendFlashlightYaw.currentValue();
		this.flashlightOrigin.pitch=-this.blendFlashlightPitch.currentValue();
		this.flashlightOrigin.position.set(0,0,0);
		let flashlightOffset = Math.tan(degtorad(90-this.blendFlashlightAngle.currentValue()-Math.max(90,this.blendFlashlightPitch.currentValue())+90))*mv3d.LIGHT_HEIGHT;
		flashlightOffset = Math.max(0,Math.min(1,flashlightOffset));
		this.flashlight.range+=flashlightOffset;
		this.flashlightOrigin.translate(YAxis,flashlightOffset,LOCALSPACE);
	}

	updateLights(){
		if(this.flashlight){
			const flashlightYaw = 180+relativeNumber( mv3d.dirToYaw( this.char.direction() ), this.flashlightTargetYaw);
			if(flashlightYaw !== this.blendFlashlightYaw.targetValue()){
				this.blendFlashlightYaw.setValue(flashlightYaw,0.25);
			}
			if(this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()
			|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()
			|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()){
				this.flashlight.diffuse.set(...this.blendFlashlightColor.currentComponents());
				this.flashlight.intensity=this.blendFlashlightIntensity.currentValue();
				this.flashlight.range=this.blendFlashlightDistance.currentValue();
				this.flashlight.angle=degtorad(this.blendFlashlightAngle.currentValue()+mv3d.FLASHLIGHT_EXTRA_ANGLE);
				this.updateFlashlightExp();
				this.updateFlashlightDirection();
			}
		}
		if(this.lamp){
			if(this.blendLampColor.update()|this.blendLampIntensity.update()|this.blendLampDistance.update()){
				this.lamp.diffuse.set(...this.blendLampColor.currentComponents());
				this.lamp.intensity=this.blendLampIntensity.currentValue();
				this.lamp.range=this.blendLampDistance.currentValue();
			}
		}
	}

	makeBlender(key,dfault,clazz=Blender){
		if(key in this.char.mv3d_blenders){
			dfault = this.char.mv3d_blenders[key];
		}else{
			this.char.mv3d_blenders[key]=dfault;
		}
		const blender=new clazz(key,dfault);
		blender.storageLocation=()=>this.char.mv3d_blenders;
		return blender;
	}
	makeColorBlender(key,dfault){
		return this.makeBlender(key,dfault,ColorBlender);
	}

	hasBush(){
		return this.getConfig('bush',!(
			this.char.isTile() || this.isVehicle
			|| this.isEvent && this.char.isObjectCharacter()
		))&&!(this.blendElevation.currentValue()||this.falling);
	}

	getShape(){
		return this.getConfig('shape', mv3d.configurationShapes.SPRITE );
	}
	updateShape(){
		const newshape = this.getShape();
		if(this.shape === newshape){ return; }
		this.shape=newshape;
		//let backfaceCulling=true;
		let geometry = Sprite.Meshes.SPRITE;
		const shapes = mv3d.configurationShapes;
		switch(this.shape){
		case shapes.FLAT:
			geometry = Sprite.Meshes.FLAT;
			//if(this.char._priorityType===2||this.hasConfig('height')||this.hasConfig('z')){
			//	backfaceCulling=false;
			//}
			break;
		case shapes.XCROSS:
		case shapes.CROSS:
			geometry = Sprite.Meshes.CROSS;
			//backfaceCulling=false;
			break;
		case shapes.WALL:
		case shapes.FENCE:
			//backfaceCulling=false;
			break;
		}
		mv3d.callFeatures('destroyCharMesh',this.mesh);
		this.mesh.dispose();
		this.mesh=geometry.clone();
		//this.material.backfaceCulling=backfaceCulling;
		this.setupMesh();
		this.spriteOrigin.rotation.set(0,0,0);
	}

	update(){
		if(this.char._erased){
			this.dispose();
		}


		this.visible=this.char.mv_sprite.visible;
		if(typeof this.char.isVisible === 'function'){
			this.visible=this.visible&&this.char.isVisible();
		}
		this.disabled=!this.visible;
		if(this.char.isTransparent() || !this._characterName&&!this._tileId){
			this.visible=false;
		}
		if(!this._isEnabled){
			if(this.visible){ this.setEnabled(true); }
		}else{
			if(!this.visible){ this.setEnabled(false); }
		}


		if(this.isImageChanged()){
			this.updateCharacter();
		}
		if(this.patternChanged()){
			this.updateFrame();
		}

		if(this.material){
			this.updateNormal();
		}else{
			this.updateEmpty();
		}
		this.updateAnimations();
		//this.mesh.renderOutline=true;
		//this.mesh.outlineWidth=1;

	}

	updateNormal(){
		const shapes = mv3d.configurationShapes;
		if(this.shape===shapes.SPRITE){
			this.mesh.pitch = mv3d.blendCameraPitch.currentValue()-90;
			this.mesh.yaw = mv3d.blendCameraYaw.currentValue();
		}else if(this.shape===shapes.TREE){
			this.spriteOrigin.pitch=this.getConfig('pitch',0);
			this.mesh.yaw = mv3d.blendCameraYaw.currentValue();
		}else{
			this.mesh.yaw=this.getConfig('rot',0);
			this.spriteOrigin.pitch=this.getConfig('pitch',0);
			this.spriteOrigin.yaw=this.getConfig('yaw',0);
			if(this.shape===shapes.XCROSS){this.mesh.yaw+=45;}
		}

		if(this.char===$gamePlayer){
			this.mesh.visibility = +!mv3d.is1stPerson(true);
		}

		this.updateAlpha();

		this.updatePosition();
		this.updateElevation();
		if(this.shadow){ this.updateShadow(); }
		this.updateLights();
	}

	updateEmpty(){
		this.updatePosition();
		this.updateElevation();
		this.updateLights();
	}

	updateAlpha(){
		let hasAlpha=this.hasConfig('alpha')||this.char.opacity()<255;
		this.bush = Boolean(this.char.bushDepth());
		if(this.bush && this.hasBush()){
			hasAlpha=true;
			if(!this.material.opacityTexture){
				this.material.opacityTexture=mv3d.getBushAlphaTexture();
				this.material.useAlphaFromDiffuseTexture=true;
			}
		}else{
			if(this.material.opacityTexture){
				this.material.opacityTexture=null;
				this.material.useAlphaFromDiffuseTexture=false;
			}
		}
		if(hasAlpha){
			this.material.useAlphaFromDiffuseTexture=true;
			this.material.alpha=this.getConfig('alpha',1)*this.char.opacity()/255;
		}else{
			this.material.useAlphaFromDiffuseTexture=false;
			this.material.alpha=1;
		}
	}

	updatePosition(){
		const loopPos = mv3d.loopCoords(this.char._realX,this.char._realY);
		this.x = loopPos.x;
		this.y = loopPos.y;

		this.spriteOrigin.position.set(0,0,0);
		this.lightOrigin.position.set(0,0,0);
		if(this.shape===mv3d.configurationShapes.FLAT){
			this.spriteOrigin.z = mv3d.LAYER_DIST*4;
		}else if(this.shape===mv3d.configurationShapes.SPRITE){
			this.spriteOrigin.z = mv3d.LAYER_DIST*4 * (1-Math.max(0,Math.min(90,mv3d.blendCameraPitch.currentValue()))/90);
		}else{
			this.spriteOrigin.z = 0;
		}
		this.lightOrigin.z = this.getConfig('lightHeight',mv3d.LIGHT_HEIGHT);

		const billboardOffset = new Vector2(Math.sin(-mv3d.cameraNode.rotation.y),Math.cos(mv3d.cameraNode.rotation.y)).multiplyByFloats(mv3d.SPRITE_OFFSET,mv3d.SPRITE_OFFSET);
		const lightOffset = this.getConfig('lightOffset',null);
		if(this.shape===mv3d.configurationShapes.SPRITE){
			this.spriteOrigin.x=billboardOffset.x;
			this.spriteOrigin.y=billboardOffset.y;
			this.lightOrigin.x=billboardOffset.x;
			this.lightOrigin.y=billboardOffset.y;
		}else if(!lightOffset){
			this.lightOrigin.x=billboardOffset.x/2;
			this.lightOrigin.y=billboardOffset.y/2;
		}
		if(lightOffset){
			this.lightOrigin.x+=lightOffset.x;
			this.lightOrigin.y+=lightOffset.y;
		}

		this.spriteOrigin.x += this.getConfig('x',0);
		this.spriteOrigin.y += this.getConfig('y',0);
	}

	updateElevation(){
		this.blendElevation.update();
		this.falling=false;

		if(this.isPlayer){
			const vehicle = this.char.vehicle();
			if(vehicle){
			//if(vehicle&&vehicle._driving){
				this.z = vehicle.z;
			}
		}

		if(this.hasConfig('z')){
			this.spriteOrigin.z=0;
			this.z=this.getConfig('z',0);
			this.z += this.blendElevation.currentValue();
			return;
		}

		const height = this.getConfig('height',0);
		if(height<0){ this.spriteOrigin.z+=height; }
		
		const platform = mv3d.getPlatformForCharacter(this,this.char._realX,this.char._realY);
		this.platformHeight = platform.z2;
		this.platformChar = platform.char;
		this.targetElevation = this.platformHeight+this.blendElevation.currentValue();
		let gravity = this.getConfig('gravity',mv3d.GRAVITY)/60;

		this.hasFloat = this.isVehicle || (this.isPlayer||this.isFollower)&&$gamePlayer.vehicle();
		if(this.hasFloat){
			this.targetElevation += mv3d.getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY),this.z+this.spriteHeight);
		}

		if(this.isAirship && $gamePlayer.vehicle()===this.char){
			this.targetElevation += mv3d.loadData('airship_height',mv3d.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude();
		}

		if(this.char.isJumping()){
			let jumpProgress = 1-(this.char._jumpCount/(this.char._jumpPeak*2));
			let jumpHeight = Math.pow(jumpProgress-0.5,2)*-4+1;
			let jumpDiff = Math.abs(this.char.mv3d_jumpHeightEnd - this.char.mv3d_jumpHeightStart);
			this.z = this.char.mv3d_jumpHeightStart*(1-jumpProgress)
			+ this.char.mv3d_jumpHeightEnd*jumpProgress + jumpHeight*jumpDiff/2
			+this.char.jumpHeight()/tileSize();
		}else if(gravity){
			const gap = Math.abs(this.targetElevation-this.z);
			if(gap<gravity){ gravity=gap; }
			//if(this.z>this.targetElevation||this.z<this.platformHeight){
			if(this.z<this.platformHeight){
				this.z=this.platformHeight;
			}
			if(this.z>this.targetElevation){
				this.z-=gravity;
				if(mv3d.tileCollision(this,this.char._realX,this.char._realY,false,false)){
					this.z=this.platformHeight;
				}
			}else if(this.z<this.targetElevation){
				this.z+=gravity
				if(mv3d.tileCollision(this,this.char._realX,this.char._realY,false,false)){
					this.z-=gravity;
				}
			}
			this.falling=this.z>this.targetElevation;
		}
		return;
		
		/*
		let newElevation = this.platformHeight;
		if(this.isVehicle || (this.isPlayer||this.isFollower)&&$gamePlayer.vehicle()){
			newElevation += mv3d.getFloatHeight(Math.round(this.char._realX),Math.round(this.char._realY));
		}

		if(this.isAirship && $gamePlayer.vehicle()===this.char){
			if(!this.char._driving){
				this.elevation += (newElevation-this.elevation)/10;
			}if(newElevation>=this.elevation){
				const ascentSpeed = 100/Math.pow(1.5,mv3d.loadData('airship_ascentspeed',4));
				this.elevation += (newElevation-this.elevation)/ascentSpeed;
			}else{
				if(!mv3d.vehicleObstructed(this.char,this.char.x,this.char.y,true)){
					const descentSpeed = 100/Math.pow(1.5,mv3d.loadData('airship_descentspeed',2));
					this.elevation += (newElevation-this.elevation)/descentSpeed;
				}
			}
			this.z = this.elevation;
			this.z += mv3d.loadData('airship_height',mv3d.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude();
		}else{
			if(this.char.isJumping()){
				let jumpProgress = 1-(this.char._jumpCount/(this.char._jumpPeak*2));
				let jumpHeight = Math.pow(jumpProgress-0.5,2)*-4+1;
				let jumpDiff = Math.abs(this.char.mv3d_jumpHeightEnd - this.char.mv3d_jumpHeightStart);
				this.z = this.char.mv3d_jumpHeightStart*(1-jumpProgress)
				+ this.char.mv3d_jumpHeightEnd*jumpProgress + jumpHeight*jumpDiff/2
				+this.char.jumpHeight()/tileSize();
			}else{
				this.elevation=newElevation;
				this.z=this.elevation;
			}
			const height = this.getConfig('height',this.char._priorityType===2?mv3d.EVENT_HEIGHT:0);
			if(height>0){
				this.z += height;
			}else{
				this.spriteOrigin.z += height;
			}
			
		}

		if(this.hasConfig('z')){
			this.spriteOrigin.z=0;
			this.z=this.getConfig('z',0);
			//this.z += this.blendElevation.currentValue();
			return;
		}
		*/
	}

	updateShadow(){
		let shadowVisible = Boolean(this.getConfig('shadow', this.shape!=mv3d.configurationShapes.FLAT ));

		if(shadowVisible&&(this.isPlayer||this.isFollower)){
			const myIndex = mv3d.characters.indexOf(this);
			if(myIndex>=0)
			for (let i=myIndex+1; i<mv3d.characters.length; ++i){
				const other = mv3d.characters[i];
				if(!other.shadow||!other.visible){ continue; }
				if(other.char._realX===this.char._realX&&other.char._realY===this.char._realY){
					shadowVisible=false;
					break;
				}
			}
		}
		if(!this.shadow._isEnabled){
			if(shadowVisible){ this.shadow.setEnabled(true); }
		}else{
			if(!shadowVisible){ this.shadow.setEnabled(false); }
		}
		if(!shadowVisible){ return; }

		const shadowBase = Math.min(0,this.getConfig('height',0));
		const shadowDist = Math.max(this.z - this.platformHeight, shadowBase);
		const shadowFadeDist = this.getConfig('shadowDist',4);
		const shadowStrength = Math.max(0,1-Math.abs(shadowDist)/shadowFadeDist);
		this.shadow.z = -shadowDist + mv3d.LAYER_DIST*3.5;
		this.shadow.x=this.spriteOrigin.x;this.shadow.y=this.spriteOrigin.y;
		const shadowScale = this.getConfig('shadow',1);
		this.shadow.scaling.setAll(shadowScale*shadowStrength);
		if(!this.shadow.isAnInstance){
			this.shadow.visibility=shadowStrength-0.5*this.bush;//visibility doesn't work with instancing
		}
	}

	updateAnimations(){
		if(this.char.isBalloonPlaying()){
			if(!this._balloon){
				this._balloon=mv3d.showBalloon(this);
			}
			this._balloon.update();
		}else{
			if(this._balloon){
				this._balloon.dispose();
				this._balloon=null;
			}
		}
	}

	dispose(...args){
		super.dispose(...args);
		delete this.char.mv3d_sprite;
	}

	getCHeight(){
		return this.getConfig('collide',this.shape===mv3d.configurationShapes.FLAT||this.char._priorityType===0?0:this.spriteHeight);
	}

	getCollisionHeight(z=this.z){
		if(this.hasConfig('height')){
			const height = this.getConfig('height')
			if(height<0){ z += height; }
		}
		const cHeight=this.getCHeight();
		return {z1:z, z2:z+cHeight, char:this};
	}

	getTriggerHeight(z=this.z){
		const trigger = this.getConfig('trigger');
		if(trigger){
			return {z1:z-trigger.down, z2:z+trigger.up};
		}else{
			return this.getCollisionHeight();
		}
	}
}

for (const methodName of [
	'characterBlockX','characterBlockY','characterPatternX',
	'isImageChanged','patternWidth','patternHeight',
	'updateTileFrame','updateFrame',
]){
	Character.prototype[methodName]=Sprite_Character.prototype[methodName];
}

mv3d.Sprite = Sprite;
mv3d.Character = Character;


const _isOnBush = Game_CharacterBase.prototype.isOnBush;
Game_CharacterBase.prototype.isOnBush = function() {
	if(mv3d.isDisabled()||!this.mv3d_sprite){ return _isOnBush.apply(this,arguments); }
	const rx=Math.round(this._realX), ry=Math.round(this._realY);
	const tileData=mv3d.getTileData(rx,ry);
	const layers = mv3d.getTileLayers(rx,ry,this.mv3d_sprite.z+this.mv3d_sprite.spriteHeight);
	const flags = $gameMap.tilesetFlags();
	for( const l of layers ){
		if( (flags[tileData[l]] & 0x40) !== 0 ){ return true; }
	}
	return false;
};