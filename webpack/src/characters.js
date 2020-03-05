import mv3d from './mv3d.js';
import { TransformNode, MeshBuilder, FRONTSIDE, Texture, StandardMaterial, Color3, Mesh, WORLDSPACE, Vector2, SpotLight, Vector3, PointLight, LOCALSPACE, DOUBLESIDE, Plane } from "./mod_babylon.js";
import { relativeNumber, ZAxis, YAxis, tileSize, degtorad, XAxis, sleep, minmax, override } from './util.js';
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
		for (let i=this.characters.length-1; i>=0; --i){
			this.characters[i].update();
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
		for (const key in Sprite.Meshes){
			mv3d.scene.removeMesh(Sprite.Meshes[key]);
		}
	},

	async getShadowMaterial(){
		if(this._shadowMaterial){ return this._shadowMaterial; }
		const shadowTexture = await mv3d.createTexture(`${mv3d.MV3D_FOLDER}/shadow.png`);
		const shadowMaterial = new StandardMaterial('shadow material', mv3d.scene);
		this._shadowMaterial=shadowMaterial;
		shadowMaterial.diffuseTexture=shadowTexture;
		shadowMaterial.opacityTexture=shadowTexture;
		shadowMaterial.specularColor.set(0,0,0);
		return shadowMaterial;
	},
	async getShadowMesh(){
		let shadowMesh;
		while(this.getShadowMesh.getting){ await sleep(100); }
		if(this._shadowMesh){ shadowMesh=this._shadowMesh}
		else{
			this.getShadowMesh.getting=true;
			shadowMesh=Sprite.Meshes.FLAT.clone('shadow mesh');
			shadowMesh.material=await this.getShadowMaterial();
			this._shadowMesh=shadowMesh;
			mv3d.scene.removeMesh(shadowMesh);
			this.getShadowMesh.getting=false;
		}
		return shadowMesh.clone();
	},

	ACTOR_SETTINGS: [],
});

class Sprite extends TransformNode{
	constructor(){
		super('sprite',mv3d.scene);
		this.spriteOrigin = new TransformNode('sprite origin',mv3d.scene);
		this.spriteOrigin.parent=this;
		this.mesh = Sprite.Meshes.FLAT.clone();
		this.mesh.parent = this.spriteOrigin;
		this.textureLoaded=false;
	}
	async setMaterial(src){
		const newTexture = await mv3d.createTexture(src);
		await this.waitTextureLoaded(newTexture);
		this.disposeMaterial();
		this.texture = newTexture;
		this.texture.hasAlpha=true;
		this.onTextureLoaded();
		this.material = new StandardMaterial('sprite material',mv3d.scene);
		this.material.diffuseTexture=this.texture;
		this.material.alphaCutOff = mv3d.ALPHA_CUTOFF;
		this.material.ambientColor.set(1,1,1);
		this.material.specularColor.set(0,0,0);
		if(!isNaN(this.LIGHT_LIMIT)){ this.material.maxSimultaneousLights=this.LIGHT_LIMIT; }
		this.mesh.material=this.material;
	}
	async waitTextureLoaded(texture=this.texture){
		await mv3d.waitTextureLoaded(texture);
	}
	onTextureLoaded(){
		this.texture.updateSamplingMode(1);
		this.textureLoaded=true;
	}
	disposeMaterial(){
		if(this.material){
			this.material.dispose();
			this.texture.dispose();
			this.material=null;
			this.texture=null;
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
		
		if(this.char.mv_sprite){
			this.char.mv_sprite.updateBitmap();
		}

		if(!this.char.mv3d_settings){ this.char.mv3d_settings={}; }
		if(!this.char.mv3d_blenders){ this.char.mv3d_blenders={}; }

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
		this.prevZ = this.z;
		this.needsPositionUpdate=true;
		//this.elevation = 0;

		mv3d.getShadowMesh().then(shadow=>{
			this.shadow = shadow;
			this.shadow.parent = this;
		});

		this.blendElevation = this.makeBlender('elevation',0);

		this.lightOrigin = new TransformNode('light origin',mv3d.scene);
		this.lightOrigin.parent=this;
		this.setupLights();
		
		if(this.isEvent){
			this.eventConfigure();
		}else{
			this.initialConfigure();
			this.updateEmissive();
		}

		this.intensiveUpdate();
	}

	get settings(){ return this.char.mv3d_settings; }

	isBitmapReady(){
		return Boolean(this.bitmap && this.bitmap.isReady() && !this._waitingForBitmap);
	}

	isTextureReady(){
		return Boolean(
			this.texture && this.texture.isReady() && this.isBitmapReady()
		);
	}

	get mv_sprite(){
		return this.char.mv_sprite||{};
	}
	get bitmap(){
		return this.mv_sprite.bitmap;
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

	async waitBitmapLoaded(){
		if(!this.char.mv_sprite){
			await sleep();
			if(!this.char.mv_sprite){
				console.warn('mv_sprite is undefined');
				return;
			}
		}
		this._waitingForBitmap=true;
		this.char.mv_sprite.updateBitmap();
		await new Promise(resolve=>this.char.mv_sprite.bitmap.addLoadListener(resolve));
		this._waitingForBitmap=false;
	}

	async waitTextureLoaded(texture=this.texture){
		await this.waitBitmapLoaded();
		await super.waitTextureLoaded(texture);
	}

	onTextureLoaded(){
		super.onTextureLoaded();
		//this.updateFrame();
		this.updateScale();
		this.updateEmissive();
	}

	isImageChanged(){
		return (this._tilesetId !== $gameMap.tilesetId()
		||this._tileId !== this._character.tileId()
		||this._characterName !== this._character.characterName()
		//||this._characterIndex !== this._character.characterIndex()
		);
	}
	updateCharacter(){
		this._tilesetId = $gameMap.tilesetId();
		this._tileId = this._character.tileId();
		this._characterName = this._character.characterName();
		this._characterIndex = this._character.characterIndex();
		this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
		this.isEmpty=false;
		if(this._tileId>0){
			this.setTileMaterial(this._tileId);
		}else if(this._characterName){
			this.setMaterial(`img/characters/${this._characterName}.png`);
		}else{
			this.isEmpty=true;
			this.setEnabled(false);
			this.spriteWidth=1;
			this.spriteHeight=1;
		}
	}
	setFrame(x,y,w,h){
		if(!this.isTextureReady()){ return; }
		if(!(this._tileId>0)){
			const size = this.texture.getSize(), baseSize = this.texture.getBaseSize();
			const scaleX=baseSize.width/size.width;
			const scaleY=baseSize.height/size.height;
			x/=scaleX; w/=scaleX; y/=scaleY; h/=scaleY;
		}
		this.texture.crop(x,y,w,h,this._tileId>0);
	}

	async updateScale(){
		//if(!this.texture||!this.mv_sprite){ return; }
		//await this.waitTextureLoaded();
		if(!this.isBitmapReady()){ await this.waitBitmapLoaded(); }
		this.mv_sprite.updateBitmap();
		const configScale = this.getConfig('scale',new Vector2(1,1));
		this.spriteWidth=this.mv_sprite.patternWidth()/tileSize() * configScale.x;
		this.spriteHeight=this.mv_sprite.patternHeight()/tileSize() * configScale.y;
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

	getActorConfigObject(){
		const id = $gameParty._actors[ this.isFollower ? this.char._memberIndex : 0 ];
		if(!id){ return {}; }
		if(!(id in mv3d.ACTOR_SETTINGS)){
			const data = $dataActors[id];
			mv3d.ACTOR_SETTINGS[id]=mv3d.readConfigurationFunctions(
				mv3d.readConfigurationBlocksAndTags(data.note),
				mv3d.eventConfigurationFunctions
			);
		}
		return mv3d.ACTOR_SETTINGS[id];
	}

	getConfig(key,dfault=undefined){
		if(key in this.settings){ return this.settings[key]; }
		if(this.isEvent){
			if(this.settings_event_page && key in this.settings_event_page){
				return this.settings_event_page[key];
			}else if(this.settings_event && key in this.settings_event){
				return this.settings_event[key];
			}
		}else if(this.isPlayer||this.isFollower){
			const ACTOR_SETTINGS = this.getActorConfigObject();
			if(key in ACTOR_SETTINGS){
				return ACTOR_SETTINGS[key];
			}
		}
		const EVENT_SETTINGS = this.getDefaultConfigObject();
		if(key in EVENT_SETTINGS){
			return EVENT_SETTINGS[key];
		}
		return dfault;
	}
	hasConfig(key){
		return key in this.settings
		||this.isEvent &&
			(this.settings_event_page && key in this.settings_event_page
			|| this.settings_event && key in this.settings_event)
		|| (this.isPlayer||this.isFollower) && key in this.getActorConfigObject()
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
			this.needsPositionUpdate=true;
		}else{ return; }

		this.pageConfigure();

	}

	initialConfigure(){
		this.configureHeight();
	}

	pageConfigure(settings=this.settings_event_page){
		if('pos' in settings){
			const event=this.char.event();
			const pos = settings;
			this.char.locate(
				relativeNumber(event.x,pos.x),
				relativeNumber(event.y,pos.y),
			);
		}
		this.setupEventLights();

		if(this.lamp){
			if('lamp' in settings){
				const lampConfig = this.getConfig('lamp');
				this.blendLampColor.setValue(lampConfig.color,0.5);
				this.blendLampIntensity.setValue(lampConfig.intensity,0.5);
				this.blendLampDistance.setValue(lampConfig.distance,0.5);
			}
		}
		if(this.flashlight){
			if('flashlight' in settings){
				const flashlightConfig = this.getConfig('flashlight');
				this.blendFlashlightColor.setValue(flashlightConfig.color,0.5);
				this.blendFlashlightIntensity.setValue(flashlightConfig.intensity,0.5);
				this.blendFlashlightDistance.setValue(flashlightConfig.distance,0.5);
				this.blendFlashlightAngle.setValue(flashlightConfig.angle,0.5);
			}
			if('flashlightPitch' in settings){
				this.blendFlashlightPitch.setValue(this.getConfig('flashlightPitch',90),0.25);
			}
		}
		if('height' in settings || this.isAbove!==(this.char._priorityType===2)){
			this.configureHeight();
		}

		this.updateScale();
		this.updateShape();
		this.updateEmissive();
		this.updateLightOffsets();
	}

	updateEmissive(){
		if(this.material){
			const glow = this.getConfig('glow',0);
			if(this.lamp){
				const lampColor=this.lamp.diffuse;
				const intensity = minmax(0,1,this.lamp.intensity);
				this.material.emissiveColor.set(
					Math.max(glow,lampColor.r*intensity),
					Math.max(glow,lampColor.g*intensity),
					Math.max(glow,lampColor.b*intensity)
				);
			}else{
				this.material.emissiveColor.set(glow,glow,glow);
			}
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

	dirtyNearbyCells(){
		if(!this.cell){ return; }
		Character.dirtyNearbyCells(this.cell.cx,this.cell.cy);
	}
	static dirtyNearbyCells(cx,cy){
		for(let x=cx-1; x<=cx+1; ++x)
		for(let y=cy-1; y<=cy+1; ++y){
			const cell = mv3d.cells[[x,y]];
			if(!cell){ continue; }
			if(!cell._needsIntensiveUpdate){
				cell._needsIntensiveUpdate=true;
				mv3d._cellsNeedingIntensiveUpdate.push(cell);
			}
		}
	}

	intensiveUpdate(){
		this.setupLightInclusionLists();
	}

	setupLightInclusionLists(){
		if(this.flashlight){
			this.flashlight.includedOnlyMeshes.splice(0,Infinity);
			this.flashlight.includedOnlyMeshes.push(...this.getMeshesInRangeOfLight(this.flashlight));
		}
		if(this.lamp){
			this.lamp.includedOnlyMeshes.splice(0,Infinity);
			this.lamp.includedOnlyMeshes.push(...this.getMeshesInRangeOfLight(this.lamp));
		}
	}

	getMeshesInRangeOfLight(light){
		if(!this.cell){ return []; }
		const pos = Vector3.TransformCoordinates(light.position,light.getWorldMatrix());
		const meshes=[];
		for(let cx=this.cell.cx-1; cx<=this.cell.cx+1; ++cx)
		for(let cy=this.cell.cy-1; cy<=this.cell.cy+1; ++cy){
			const cell = mv3d.cells[[cx,cy]];
			if(!cell||!cell.mesh){ continue; }
			const sphere = cell.mesh.getBoundingInfo().boundingSphere;
			const dist = Vector3.Distance(pos,sphere.centerWorld);
			if(dist>=sphere.radiusWorld+light.range){ continue; }
			meshes.push(cell.mesh);
			for(let character of cell.characters){
				const sphere = character.mesh.getBoundingInfo().boundingSphere;
				const dist = Vector3.Distance(pos,sphere.centerWorld);
				if(dist>=sphere.radiusWorld+light.range){ continue; }
				meshes.push(character.mesh);
			}
		}
		return meshes;
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
		const lightDist = this.blendFlashlightDistance.targetValue();
		this.blendFlashlightDistance.setValue(0,0); this.blendFlashlightDistance.setValue(lightDist,0.25);
		this.blendFlashlightAngle = this.makeBlender('flashlightAngle',config.angle);
		this.flashlight = new SpotLight('flashlight',Vector3.Zero(),Vector3.Zero(),
			degtorad(this.blendFlashlightAngle.targetValue()+mv3d.FLASHLIGHT_EXTRA_ANGLE),0,mv3d.scene);
		this.flashlight.renderPriority=2;
		this.updateFlashlightExp();
		this.flashlight.range = this.blendFlashlightDistance.targetValue();
		this.flashlight.intensity=this.blendFlashlightIntensity.targetValue()*mv3d.FLASHLIGHT_INTENSITY_MULTIPLIER;
		this.flashlight.diffuse.set(...this.blendFlashlightColor.targetComponents());
		//this.flashlight.projectionTexture = mv3d.getFlashlightTexture();
		this.flashlight.direction.y=-1;
		this.flashlightOrigin=new TransformNode('flashlight origin',mv3d.scene);
		this.flashlightOrigin.parent=this.lightOrigin;
		this.flashlight.parent=this.flashlightOrigin;
		this.blendFlashlightPitch = this.makeBlender('flashlightPitch',90);
		this.blendFlashlightYaw = this.makeBlender('flashlightYaw', 0);
		this.blendFlashlightYaw.cycle=360;
		this.updateFlashlightDirection();
		this.setupMesh();
		this.updateLightOffsets();
	}

	updateFlashlightExp(){
		this.flashlight.exponent = 64800*Math.pow(this.blendFlashlightAngle.currentValue(),-2);
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
		const lightDist = this.blendLampDistance.targetValue();
		this.blendLampDistance.setValue(0,0); this.blendLampDistance.setValue(lightDist,0.25);
		this.lamp = new PointLight('lamp',Vector3.Zero(),mv3d.scene);
		this.lamp.renderPriority=1;
		this.lamp.diffuse.set(...this.blendLampColor.targetComponents());
		this.lamp.intensity=this.blendLampIntensity.targetValue();
		this.lamp.range=this.blendLampDistance.targetValue();
		this.lampOrigin=new TransformNode('lamp origin',mv3d.scene);
		this.lampOrigin.parent = this.lightOrigin;
		this.lamp.parent=this.lampOrigin;
		this.updateLightOffsets();
	}

	updateFlashlightDirection(){
		this.flashlightOrigin.yaw=this.blendFlashlightYaw.currentValue();
		this.flashlightOrigin.pitch=-this.blendFlashlightPitch.currentValue();
		//this.flashlightOrigin.position.set(0,0,0);
		//let flashlightOffset = Math.tan(degtorad(90-this.blendFlashlightAngle.currentValue()-Math.max(90,this.blendFlashlightPitch.currentValue())+90))*mv3d.LIGHT_HEIGHT;
		//flashlightOffset = Math.max(0,Math.min(1,flashlightOffset));
		//this.flashlight.range+=flashlightOffset;
		//this.flashlightOrigin.translate(YAxis,flashlightOffset,LOCALSPACE);
	}

	updateLights(){
		if(this.flashlight){
			const flashlightYaw = 180+relativeNumber( mv3d.dirToYaw( this.char.mv3d_direction(),mv3d.DIR8MOVE ), this.getConfig('flashlightYaw','+0'));
			if(flashlightYaw !== this.blendFlashlightYaw.targetValue()){
				this.blendFlashlightYaw.setValue(flashlightYaw,0.25);
			}
			if(this.blendFlashlightColor.update()|this.blendFlashlightIntensity.update()
			|this.blendFlashlightDistance.update()|this.blendFlashlightAngle.update()
			|this.blendFlashlightYaw.update()|this.blendFlashlightPitch.update()){
				this.flashlight.diffuse.set(...this.blendFlashlightColor.currentComponents());
				this.flashlight.intensity=this.blendFlashlightIntensity.currentValue()*mv3d.FLASHLIGHT_INTENSITY_MULTIPLIER;
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
				this.updateEmissive();
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
		if(this.platformChar){ return false; }
		return this.getConfig('bush',!(
			this.char.isTile() || this.isVehicle
			|| this.isEvent && this.char.isObjectCharacter()
		))&&!(this.blendElevation.currentValue()||this.falling);
	}

	getShape(){
		return this.getConfig('shape', mv3d.enumShapes.SPRITE );
	}
	updateShape(){
		const newshape = this.getShape();
		if(this.shape === newshape){ return; }
		this.shape=newshape;
		//let backfaceCulling=true;
		let geometry = Sprite.Meshes.SPRITE;
		const shapes = mv3d.enumShapes;
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
		this.dirtyNearbyCells();
	}

	update(){
		this.needsPositionUpdate=false;
		if(this.char._erased){
			this.dispose();
		}


		this.visible=this.mv_sprite.visible;
		if(typeof this.char.isVisible === 'function'){
			this.visible=this.visible&&this.char.isVisible();
		}
		this.disabled=!this.visible;
		if(this.char.isTransparent() || !this.char._characterName&&!this.char._tileId
		|| !this.char.mv3d_inRenderDist() || !this.textureLoaded){
			this.visible=false;
		}
		if(!this._isEnabled){
			if(this.visible){ this.setEnabled(true); this.needsPositionUpdate=true; }
		}else{
			if(!this.visible){ this.setEnabled(false); }
		}

		if(this.isImageChanged()){
			this.updateCharacter();
			this.needsPositionUpdate=true;
		}
		//if(this.patternChanged()){
		//	this.updateFrame();
		//}

		if(!this._isEnabled){
			return;
		}

		if(this.blendElevation.update()){
			this.needsPositionUpdate=true;
		}else if(this.x!==this.char._realX || this.y!==this.char._realY
		|| this.falling || this.prevZ !== this.z
		|| this.platformChar&&this.platformChar.needsPositionUpdate
		|| this.isPlayer || this.char===$gamePlayer.vehicle()){
			this.needsPositionUpdate=true;
			this.prevZ = this.z;
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
		const shapes = mv3d.enumShapes;
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
			if(!this.material.opacityTexture){
				const bushAlpha = mv3d.getBushAlphaTextureSync();
				if(bushAlpha&&bushAlpha.isReady()){
					this.material.opacityTexture=bushAlpha;
				}
			}
		}else{
			if(this.material.opacityTexture){
				this.material.opacityTexture=null;
			}
		}
		if(hasAlpha||this.material.opacityTexture){
			this.material.useAlphaFromDiffuseTexture=true;
			this.material.alpha=this.getConfig('alpha',1)*this.char.opacity()/255;
		}else{
			this.material.useAlphaFromDiffuseTexture=false;
			this.material.alpha=1;
		}
	}

	updateLightOffsets(){
		if(this.lamp){
			const height = this.getConfig('lampHeight',mv3d.LAMP_HEIGHT);
			const offset = this.getConfig('lampOffset',null);
			this.lampOrigin.position.set(0,0,0);
			this.lampOrigin.z=height;
			if(offset){
				this.lampOrigin.x=offset.x;
				this.lampOrigin.y=offset.y;
			}
		}
		if(this.flashlight){
			const height = this.getConfig('flashlightHeight',mv3d.FLASHLIGHT_HEIGHT);
			const offset = this.getConfig('flashlightOffset',null);
			this.flashlightOrigin.position.set(0,0,0);
			this.flashlightOrigin.z=height;
			if(offset){
				this.flashlightOrigin.x=offset.x;
				this.flashlightOrigin.y=offset.y;
			}
		}
	}

	updatePositionOffsets(){
		this.spriteOrigin.position.set(0,0,0);
		if(this.shape===mv3d.enumShapes.FLAT){
			this.spriteOrigin.z = mv3d.LAYER_DIST*4;
		}else if(this.shape===mv3d.enumShapes.SPRITE){
			this.spriteOrigin.z = mv3d.LAYER_DIST*4 * (1-Math.max(0,Math.min(90,mv3d.blendCameraPitch.currentValue()))/90);
		}else{
			this.spriteOrigin.z = 0;
		}

		const billboardOffset = new Vector2(Math.sin(-mv3d.cameraNode.rotation.y),Math.cos(mv3d.cameraNode.rotation.y)).multiplyByFloats(mv3d.SPRITE_OFFSET,mv3d.SPRITE_OFFSET);
		
		if(this.shape===mv3d.enumShapes.SPRITE){
			this.spriteOrigin.x=billboardOffset.x;
			this.spriteOrigin.y=billboardOffset.y;
			this.lightOrigin.x=billboardOffset.x;
			this.lightOrigin.y=billboardOffset.y;
		}else{
			this.lightOrigin.x=0;
			this.lightOrigin.y=0;
		}

		this.spriteOrigin.x += this.getConfig('x',0);
		this.spriteOrigin.y += this.getConfig('y',0);

		const height = this.getConfig('height',0);
		if(height<0){ this.spriteOrigin.z+=height; }
	}

	updatePosition(){
		this.updatePositionOffsets();

		if(!this.needsPositionUpdate) { return; }

		const loopPos = mv3d.loopCoords(this.char._realX,this.char._realY);
		this.x = loopPos.x;
		this.y = loopPos.y;

		const cellX=Math.floor(Math.round(this.char._realX)/mv3d.CELL_SIZE);
		const cellY=Math.floor(Math.round(this.char._realY)/mv3d.CELL_SIZE);
		const cell = mv3d.cells[[cellX,cellY]];
		if(this.cell&&this.cell!==cell){
			this.removeFromCell();
		}
		if(cell&&!this.cell){
			this.cell=cell;
			cell.characters.push(this);
		}
		this.dirtyNearbyCells();
	}

	updateElevation(){
		if(!this.needsPositionUpdate) { return; }

		//don't update when moving on tile corners
		if(this.char.isMoving() && !((this.x-0.5)%1)&&!((this.y-0.5)%1)){ return; }

		this.falling=false;

		if(this.isPlayer){
			const vehicle = this.char.vehicle();
			if(vehicle){
			//if(vehicle&&vehicle._driving){
				this.z = vehicle.z;
				this.targetElevation = vehicle.targetElevation;
				this.platformChar = vehicle.platformChar;
				this.platformHeight = vehicle.platformHeight;
				if(vehicle._driving){ return; }
			}
		}

		if(this.hasConfig('z')){
			this.z=this.getConfig('z',0);
			this.z += this.blendElevation.currentValue();
			return;
		}
		
		const platform = this.getPlatform(this.char._realX,this.char._realY);
		this.platform = platform;
		this.platformHeight = platform.z2;
		this.platformChar = platform.char;
		this.targetElevation = this.platformHeight+this.blendElevation.currentValue();
		let gravity = this.getConfig('gravity',mv3d.GRAVITY)/60;

		this.hasFloat = this.isVehicle || (this.isPlayer||this.isFollower)&&$gamePlayer.vehicle();
		if(this.hasFloat && !this.platformChar){
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
	}

	getPlatform(x=this.char._realX,y=this.char._realY,opts={}){
		return mv3d.getPlatformForCharacter(this,x,y,opts);
	}

	getPlatformFloat(x=this.char._realX,y=this.char._realY,opts={}){
		if(!opts.platform){ opts.platform = this.getPlatform(x,y,opts); }
		const platform = opts.platform;
		let z = platform.z2;
		if(this.hasFloat&&!platform.char){
			const cHeight = this.getCHeight();
			z += mv3d.getFloatHeight(Math.round(x),Math.round(y),this.z+Math.max(cHeight,mv3d.STAIR_THRESH),mv3d.STAIR_THRESH>=cHeight);
		}
		return z;
	}

	updateShadow(){
		let shadowVisible = Boolean(this.getConfig('shadow', this.shape!=mv3d.enumShapes.FLAT ));

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
			this.disposeBalloon();
		}
	}

	disposeBalloon(){
		if(this._balloon){
			this._balloon.dispose();
			this._balloon=null;
		}
	}

	dispose(...args){
		super.dispose(...args);
		delete this.char.mv3d_sprite;
		const index = mv3d.characters.indexOf(this);
		mv3d.characters.splice(index,1);
		this.disposeBalloon();
		this.removeFromCell();
	}

	removeFromCell(){
		if(this.cell){
			const index = this.cell.characters.indexOf(this);
			if(index>=0){ this.cell.characters.splice(index,1); }
			this.cell=null;
		}
	}

	getCHeight(){
		let collide = this.getConfig('collide',this.shape===mv3d.enumShapes.FLAT||this.char._priorityType===0?0:this.spriteHeight);
		return collide===true ? this.spriteHeight : Number(collide);
	}

	getCollider(){
		if(this._collider){ return this._collider; }
		const collider = {char:this};
		this._collider=collider;
		Object.defineProperties(collider,{
			z1:{get:()=>this.z },
			z2:{get:()=>{
				let z = this.z;
				if(this.hasConfig('height')){
					const height = this.getConfig('height')
					if(height<0){ z += height; }
				}
				return Math.max(this.z,this.z+this.getCHeight());
			}}
		});
		return collider;
	}
	getTriggerCollider(){
		if(this._triggerCollider){ return this._triggerCollider; }
		const collider = {};
		this._triggerCollider=collider;
		Object.defineProperties(collider,{
			z1:{get:()=>{
				const trigger = this.getConfig('trigger');
				if(trigger){
					return this.z-trigger.down;
				}else if(mv3d.TRIGGER_INFINITE || this.isEmpty){
					return -Infinity;
				}else{
					return this.getCollider().z1;
				}
			}},
			z2:{get:()=>{
				const trigger = this.getConfig('trigger');
				if(trigger){
					return this.z-trigger.up;
				}else if(mv3d.TRIGGER_INFINITE || this.isEmpty){
					return Infinity;
				}else{
					return this.getCollider().z2;
				}
			}}
		});
		return collider;
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
		}else if(mv3d.TRIGGER_INFINITE || this.isEmpty){
			return {z1:-Infinity, z2: Infinity};
		}else{
			return this.getCollisionHeight();
		}
	}
}

override(Sprite_Character.prototype,'characterPatternY',o=>function(){
	const sprite = this._character.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	const dirfix = sprite.getConfig('dirfix', sprite.isEvent && sprite.char.isObjectCharacter());
	if(dirfix){
		return sprite.char.direction()/2-1;
	}
	let dir = mv3d.transformFacing(sprite.char.mv3d_direction());
	return dir/2-1;
});

override(Sprite_Character.prototype,'setFrame',o=>function(x, y, width, height){
	o.apply(this,arguments);
	const sprite = this._character.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	sprite.setFrame(x,y,this.patternWidth(),this.patternHeight());
});

mv3d.Sprite = Sprite;
mv3d.Character = Character;


const _isOnBush = Game_CharacterBase.prototype.isOnBush;
Game_CharacterBase.prototype.isOnBush = function() {
	if(mv3d.isDisabled()||!this.mv3d_sprite){ return _isOnBush.apply(this,arguments); }
	const rx=Math.round(this._realX), ry=Math.round(this._realY);
	const tileData=mv3d.getTileData(rx,ry);
	const layers = mv3d.getTileLayers(rx,ry,this.mv3d_sprite.z+this.mv3d_sprite.getCHeight(),false);
	const flags = $gameMap.tilesetFlags();
	for( const l of layers ){
		if( (flags[tileData[l]] & 0x40) !== 0 ){ return true; }
	}
	return false;
};