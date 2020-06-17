import mv3d from './mv3d.js';
import { TransformNode, MeshBuilder, StandardMaterial, Mesh, Vector2, SpotLight, Vector3, PointLight, Color4, VertexData } from 'babylonjs';
import { WORLDSPACE, DOUBLESIDE } from './mod_babylon.js';
import { relativeNumber, ZAxis, YAxis, tileSize, degtorad, XAxis, sleep, minmax, override, sin, cos, tileWidth, tileHeight } from './util.js';
import { ColorBlender, Blender } from './blenders.js';
import { Model } from './model.js';

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
				enumerable:false,
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

	updateDynamicNormals(){
		if(!mv3d.DYNAMIC_NORMALS||!this.blendSunColor){ return; }
		const pitch = this.blendSunColor.averageCurrentValue()<128 ? this.blendSunColor.averageCurrentValue()/128 * this.blendCameraPitch.currentValue() : this.blendCameraPitch.currentValue();
		const y = sin(degtorad(pitch));
		const z = -cos(degtorad(pitch));
		this.Meshes.SPRITE.updateVerticesData(BABYLON.VertexBuffer.NormalKind, [ 0,y,z, 0,y,z, 0,y,z, 0,y,z ]);
	},

	setupSpriteMeshes(){
		const meshes = this.Meshes = {};

		const vdata = new VertexData();
		vdata.indices=[1,0,2,1,2,3];
		vdata.uvs=[0,1,1,1,0,0,1,0];
		const normals_up = [ 0,1,0, 0,1,0, 0,1,0, 0,1,0 ];
		const normals_front = [ 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1 ]

		vdata.positions=[ -0.5,0.5,0, 0.5,0.5,0, -0.5,-0.5,0, 0.5,-0.5,0 ];
		vdata.normals=normals_front;
		meshes.BASIC = new Mesh('basic mesh', mv3d.scene);
		vdata.applyToMesh(meshes.BASIC,false);

		vdata.positions=[ -0.5,0,0.5, 0.5,0,0.5, -0.5,0,-0.5, 0.5,0,-0.5 ];
		vdata.normals=normals_up;
		meshes.FLAT = new Mesh('flat mesh', mv3d.scene);
		vdata.applyToMesh(meshes.FLAT,false);

		vdata.positions=[ -0.5,1,0, 0.5,1,0, -0.5,0,0, 0.5,0,0 ];
		vdata.normals=mv3d.DYNAMIC_NORMALS?normals_up:normals_front;
		meshes.SPRITE = new Mesh('sprite mesh', mv3d.scene);
		vdata.applyToMesh(meshes.SPRITE,true);
		meshes.BOARD = new Mesh('board mesh', mv3d.scene);
		vdata.applyToMesh(meshes.BOARD,false);

		vdata.normals=normals_front;
		meshes.WALL = new Mesh('wall mesh', mv3d.scene);
		vdata.applyToMesh(meshes.WALL,false);

		vdata.normals=mv3d.ABNORMAL?normals_up:normals_front;
		meshes.TEMP_CROSS = new Mesh('cross mesh', mv3d.scene);
		vdata.applyToMesh(meshes.TEMP_CROSS,false);
		meshes.CROSS=Mesh.MergeMeshes([
			meshes.TEMP_CROSS.clone(),
			meshes.TEMP_CROSS.clone().rotate(YAxis,Math.PI/2,WORLDSPACE),
		]);
		meshes['8CROSS']=Mesh.MergeMeshes([
			meshes.CROSS.clone(),
			meshes.CROSS.clone().rotate(YAxis,Math.PI/4,WORLDSPACE),
		]);

		for (const key in meshes){
			meshes[key].renderingGroupId=mv3d.enumRenderGroups.MAIN;
			mv3d.scene.removeMesh(meshes[key]);
			if(key.startsWith('TEMP_')){
				meshes[key].dispose();
				delete meshes[key];
			}
		}
	},

	async getShadowMaterial(){
		if(this._shadowMaterial){ return this._shadowMaterial; }
		const shadowTexture = await mv3d.createTexture(`${mv3d.MV3D_FOLDER}/${mv3d.TEXTURE_SHADOW}.png`);
		const shadowMaterial = new StandardMaterial('shadow material', mv3d.scene);
		this._shadowMaterial=shadowMaterial;
		shadowMaterial.diffuseTexture=shadowTexture;
		shadowMaterial.opacityTexture=shadowTexture;
		shadowMaterial.specularColor.set(0,0,0);
		shadowMaterial.dispose=()=>{};
		return shadowMaterial;
	},
	async getShadowMesh(){
		let shadowMesh;
		while(this.getShadowMesh.getting){ await sleep(100); }
		if(this._shadowMesh){ shadowMesh=this._shadowMesh}
		else{
			this.getShadowMesh.getting=true;
			shadowMesh=mv3d.Meshes.FLAT.clone('shadow mesh');
			shadowMesh.material=await this.getShadowMaterial();
			this._shadowMesh=shadowMesh;
			mv3d.scene.removeMesh(shadowMesh);
			this.getShadowMesh.getting=false;
		}
		return shadowMesh.clone();
	},

	ACTOR_SETTINGS: [],
});

const z_descriptor = {
	configurable: true,
	enumerable:false,
	get(){ return this._mv3d_z; },
	set(v){
		this._mv3d_z=v;
		if(this.mv3d_sprite){ this.mv3d_sprite.position.y=v; }
	}
}
const z_descriptor2 = {
	configurable: true,
	enumerable:false,
	get(){ return this.char._mv3d_z; },
	set(v){
		this.char._mv3d_z=v;
		this.position.y=v;
	}
}

class Character extends TransformNode{
	constructor(char,order){
		super('character',mv3d.scene);
		this.spriteOrigin = new TransformNode('sprite origin',mv3d.scene);
		this.spriteOrigin.parent=this;
		this.model = new Model({orphan:false});
		this.model.parent = this.spriteOrigin;
		this.model.order=order;
		this.model.character = this;

		//this.order=order;
		//this.mesh.order=this.order;
		//this.mesh.character=this;
		
		this._character=this.char=char;
		this.charName='';
		this.charIndex=0;
		
		if(this.char.mv_sprite){
			this.char.mv_sprite.updateBitmap();
		}

		if(!this.char.mv3d_settings){ this.char.mv3d_settings={}; }
		if(!this.char.mv3d_blenders){ this.char.mv3d_blenders={}; }

		this.isVehicle = this.char instanceof Game_Vehicle;
		this.isBoat = this.isVehicle && this.char.isBoat();
		this.isShip = this.isVehicle && this.char.isShip();
		this.isAirship = this.isVehicle && this.char.isAirship();
		this.isEvent = this.char instanceof Game_Event;
		this.isPlayer = this.char instanceof Game_Player;
		this.isFollower = this.char instanceof Game_Follower;

		this.updateCharacter();
		this.updateShape();

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
		this.needsMaterialUpdate=true;
		this.needsScaleUpdate=false;
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
			this.needsMaterialUpdate=true;
		}

		this.intensiveUpdate();
	}

	dispose(...args){
		this.model.dispose();
		super.dispose(...args);
	}

	//===========================
	//  Texture & Model
	//===========================

	async setMaterial(src){
		await this.model.setMaterial(src);
		this.updateScale();
		this.needsMaterialUpdate=true;
	}

	get settings(){ return this.char.mv3d_settings; }

	isBitmapReady(){
		return Boolean(this.mv_sprite && this.bitmap && this.bitmap.isReady() && !this._waitingForBitmap);
	}

	isTextureReady(){
		const texture = this.model.texture
		return Boolean(
			texture && texture.isReady() && this.isBitmapReady()
		);
	}

	get mv_sprite(){
		return this.char.mv_sprite;
	}
	get bitmap(){
		return this.mv_sprite.bitmap;
	}
	get shape(){
		return this.model.shape;
	}
	get tileId(){
		return this.getConfig('texture_id',this._tileId);
	}

	setTileMaterial(tileId){
		const textureSrc = mv3d.getTsImgUrl(mv3d.getSetName(tileId));
		this.setMaterial(textureSrc);
	}
	async setRectMaterial(img,rect){
		const textureSrc = mv3d.getTsImgUrl(img);
		await this.setMaterial(textureSrc);
		this.dontCrop=true;
		const { width, height } = this.model.texture.getBaseSize();
		rect = mv3d.finalizeTextureRect(rect,width,height);
		this.textureRect = rect;
		this.model.texture.crop(rect.x,rect.y,rect.width,rect.height);
		this.updateScale();
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
		await mv3d.waitBitmapLoaded(this.char.mv_sprite.bitmap);
		this._waitingForBitmap=false;
	}

	async waitTextureLoaded(texture=this.model.texture){
		await this.waitBitmapLoaded();
		await mv3d.waitTextureLoaded(texture);
	}

	isImageChanged(){
		return (this._tilesetId !== $gameMap.tilesetId()
		||this._tileId !== this._character._tileId
		||this._characterName !== this._character.characterName()
		//||this._characterIndex !== this._character.characterIndex()
		||this._texture_symbol !== this.getConfig('texture_symbol')
		||this.isComplex !== this.model.isComplexMesh()
		);
	}
	updateCharacter(){
		//if(!this.isBitmapReady()){ return; }
		this.needsPositionUpdate=true;
		this._tilesetId = $gameMap.tilesetId();
		this._tileId = this._character._tileId;
		this._characterName = this._character.characterName();
		this._characterIndex = this._character.characterIndex();
		this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
		this._texture_symbol = this.getConfig('texture_symbol');
		this.isEmpty=false;
		this.isComplex=this.model.isComplexMesh();
		this.model.setEnabled(true);
		this.dontCrop=false;
		delete this.textureRect;
		if(this.hasConfig('texture_rect')){
			this.setRectMaterial(this.getConfig('texture_img','B'),this.getConfig('texture_rect'));
		}else if(this.tileId>0 || this.isComplex){
			this.setTileMaterial(this.tileId);
		}else if(this._characterName){
			this.setMaterial(`img/characters/${this._characterName}.png`);
		}else{
			this.isEmpty=true;
			this.model.textureLoaded=false;
			this.model.disposeMaterial();
			this.model.setEnabled(false);
			this.spriteWidth=1;
			this.spriteHeight=1;
			this.updateScale();
		}
	}
	setFrame(x,y,w,h){
		if(!this.isTextureReady()||this.dontCrop){ return; }
		this.model.texture.crop(x,y,w,h);
	}

	async updateScale(){
		this.needsScaleUpdate=false;
		if(this.isEmpty){
			this.spriteWidth=1;
			this.spriteHeight=1;
			if(this.model.mesh)this.model.scaling.set(1,1,1);
			return;
		}
		const configScale = this.getConfig('scale',new Vector2(1,1));
		if(this.isComplex){
			this.spriteWidth = configScale.x;
			this.spriteHeight = configScale.y;
		}else{
			if(!this.isBitmapReady()){ this.needsScaleUpdate=true; return; }
			this.mv_sprite.updateBitmap();
			if(this.textureRect){
				var width = this.textureRect.width;
				var height = this.textureRect.height;
			}else{
				var width = this.mv_sprite.patternWidth();
				var height = this.mv_sprite.patternHeight();
			}
			this.spriteWidth = width/tileWidth() * configScale.x;
			this.spriteHeight = height/tileHeight() * configScale.y;
		}
		const xscale = this.spriteWidth;
		const yscale = this.spriteHeight;
		if(this.model.mesh){
			if(this.model.shape===mv3d.enumShapes.FLAT){
				this.model.scaling.set(xscale,yscale,yscale);
			}else{
				this.model.scaling.set(xscale,yscale,xscale);
			}
		}
	}

	getShape(){
		return this.getConfig('shape', mv3d.enumShapes.SPRITE );
	}
	async updateShape(){
		const shape = this.getShape();
		if(shape===mv3d.enumShapes.MODEL){
			await this.model.importModel(this.getConfig('model'));
		}else{
			this.model.setMeshForShape(shape);
		}
		this.updateConfiguration();
		this.dirtyNearbyCells();
	}

	updateEmissive(){
		const materials = this.model.materials;
		if(!materials.length){ return; }
		const glow = this.getConfig('glow', new Color4(0,0,0,0));
		if(this.lamp){
			var lampColor = this.lamp.diffuse;
			var intensity = Math.max(0,Math.min(1,this.lamp.intensity,this.lamp.range,this.lamp.intensity/4+this.lamp.range/4));	
		}
		const blendColor = this.mv_sprite._blendColor;
		const blendAlpha=blendColor[3]/255;
		const noShadow = !this.getConfig('dynShadow',true);
		for(const material of materials){
			const emissiveColor = material.emissiveColor;
			if(!material._mv3d_orig_emissiveColor){ material._mv3d_orig_emissiveColor = emissiveColor.clone(); }
			const orig_emissive = material._mv3d_orig_emissiveColor;
			material.mv3d_glowColor=glow;
			if(this.lamp){
				emissiveColor.set(
					Math.max(glow.r,lampColor.r*intensity,orig_emissive.r),
					Math.max(glow.g,lampColor.g*intensity,orig_emissive.g),
					Math.max(glow.b,lampColor.b*intensity,orig_emissive.b)
				);
			}else{
				emissiveColor.set(
					Math.max(glow.r,orig_emissive.r),
					Math.max(glow.g,orig_emissive.g),
					Math.max(glow.b,orig_emissive.b)
				);
			}
			emissiveColor.r+=(2-emissiveColor.r)*Math.pow(blendColor[0]/255*blendAlpha,0.5);
			emissiveColor.g+=(2-emissiveColor.g)*Math.pow(blendColor[1]/255*blendAlpha,0.5);
			emissiveColor.b+=(2-emissiveColor.b)*Math.pow(blendColor[2]/255*blendAlpha,0.5);

			if(this.hasConfig('ambient')){
				material.ambientColor.copyFrom(this.getConfig('ambient'));
			}else{
				material.ambientColor.set(1,1,1);
			}
	
			material.mv3d_noShadow=noShadow;
		}
	}

	setupMesh(){
		if(this.isEmpty){
			this.model.setEnabled(false);
		}else{
			this.model.setEnabled(true);
		}
		if(this.flashlight){
			this.flashlight.excludedMeshes.splice(0,Infinity);
			this.flashlight.excludedMeshes.push(...this.model.meshes);
		}
		this.updateScale();
		this.model.mesh.character=this;
	}

	//===========================
	//	CONFIGURATION & LIGHTS
	//===========================

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
		this.updateShape();

		if(this.char.mv3d_needsConfigure){
			this.char.mv3d_needsConfigure=false;
			this.needsPositionUpdate=true;
		}else{ return; }

		this.pageConfigure();

	}

	initialConfigure(){
		this.configureHeight();
		this.updateConfiguration();
	}

	pageConfigure(settings=this.settings_event_page){
		const transient = settings===this.settings;
		if('pos' in settings){
			const event=this.char.event();
			const pos = settings.pos;
			if('x' in pos||'y' in pos){
				this.char.locate(
					'x' in pos?relativeNumber(event.x,pos.x):this.char.x,
					'y' in pos?relativeNumber(event.y,pos.y):this.char.y,
				);
			}
			if('z' in pos){
				this.z = relativeNumber(mv3d.getWalkHeight(event.x,event.y),pos.z);
			}
			if(transient)delete settings.pos;
		}
		this.setupEventLights();

		if(this.lamp){
			if('lamp' in settings){
				const lampConfig = this.getConfig('lamp');
				this.blendLampColor.setValue(lampConfig.color,0.5);
				this.blendLampIntensity.setValue(lampConfig.intensity,0.5);
				this.blendLampDistance.setValue(lampConfig.distance,0.5);
			}
			if(transient)delete settings.lamp;
		}
		if(this.flashlight){
			if('flashlight' in settings){
				const flashlightConfig = this.getConfig('flashlight');
				this.blendFlashlightColor.setValue(flashlightConfig.color,0.5);
				this.blendFlashlightIntensity.setValue(flashlightConfig.intensity,0.5);
				this.blendFlashlightDistance.setValue(flashlightConfig.distance,0.5);
				this.blendFlashlightAngle.setValue(flashlightConfig.angle,0.5);
				if(transient)delete settings.flashlight;
			}
			if('flashlightPitch' in settings){
				this.blendFlashlightPitch.setValue(this.getConfig('flashlightPitch',90),0.25);
				if(transient)delete settings.flashlightPitch;
			}
		}
		if('height' in settings || this.isAbove!==(this.char._priorityType===2)){
			this.configureHeight();
			if(transient)delete settings.height;
		}

		this.updateScale();
		this.updateShape();
		this.needsMaterialUpdate=true;
		this.needsPositionUpdate=true;
		this.updateLightOffsets();
	}

	configureHeight(){
		this.isAbove = this.char._priorityType===2;
		let height = Math.max(0, this.getConfig('height',this.isAbove&&!this.hasConfig('zlock')&&!this.isAirship?mv3d.EVENT_HEIGHT:0) );
		this.blendElevation.setValue(height,0);
		if(this.isEvent) this.z = this.platformHeight + height;
	}

	updateConfiguration(){
		const shapes = mv3d.enumShapes;
		if(this.model.shape===shapes.SPRITE){
			this.spriteOrigin.pitch=0;
			this.spriteOrigin.yaw=0;
		}else if(this.model.shape===shapes.BOARD){
			this.spriteOrigin.pitch=this.getConfig('pitch',0);
			this.spriteOrigin.yaw=this.getConfig('yaw',0);
		}else{
			this.model.yaw=this.getConfig('rot',0);
			this.spriteOrigin.pitch=this.getConfig('pitch',0);
			this.spriteOrigin.yaw=this.getConfig('yaw',0);
			//if(this.shape===shapes.XCROSS){this.mesh.yaw+=45;}
		}
		this.updateScale();
	}

	dirtyNearbyCells(){
		if(!this.cell){ return; }
		Character.dirtyNearbyCells(this.cell.cx,this.cell.cy);
	}
	static dirtyNearbyCells(cx,cy){
		for(let ix=cx-1; ix<=cx+1; ++ix)
		for(let iy=cy-1; iy<=cy+1; ++iy){
			let x=ix, y=iy;
			if(mv3d.loopHorizontal()){ x=x.mod(Math.ceil(mv3d.mapWidth()/mv3d.CELL_SIZE)); }
			if(mv3d.loopVertical()){ y=y.mod(Math.ceil(mv3d.mapHeight()/mv3d.CELL_SIZE)); }
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
		this.updateScale();
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
		for(let _cx=this.cell.cx-1; _cx<=this.cell.cx+1; ++_cx)
		for(let _cy=this.cell.cy-1; _cy<=this.cell.cy+1; ++_cy){
			let cx=_cx, cy=_cy;
			if(mv3d.loopHorizontal()){ cx=cx.mod(Math.ceil(mv3d.mapWidth()/mv3d.CELL_SIZE)); }
			if(mv3d.loopVertical()){ cy=cy.mod(Math.ceil(mv3d.mapHeight()/mv3d.CELL_SIZE)); }
			const cell = mv3d.cells[[cx,cy]];
			if(!cell||!cell.mesh){ continue; }
			const sphere = cell.mesh.getBoundingInfo().boundingSphere;
			const dist = Vector3.Distance(pos,sphere.centerWorld);
			if(dist>=sphere.radiusWorld+light.range){ continue; }
			meshes.push(cell.mesh);
			for(const character of cell.characters)for(const mesh of character.model.meshes){
				const sphere = mesh.getBoundingInfo().boundingSphere;
				const dist = Vector3.Distance(pos,sphere.centerWorld);
				if(dist>=sphere.radiusWorld+light.range){ continue; }
				meshes.push(mesh);
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
		this.flashlight.specular.set(0,0,0);
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
		this.lamp.specular.set(0,0,0);
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
			let flashlightYaw = 180+relativeNumber( mv3d.dirToYaw( this.char.mv3d_direction(),mv3d.DIR8MOVE ), this.getConfig('flashlightYaw','+0'));
			let firstPerson=this.isPlayer&&mv3d.is1stPerson();
			if(this.isPlayer){
				let flashlightPitch = this.getConfig('flashlightPitch',90);
				if(firstPerson){
					flashlightYaw=180+mv3d.blendCameraYaw.currentValue();
					flashlightPitch=mv3d.blendCameraPitch.currentValue();
				}
				this.blendFlashlightPitch.setValue(flashlightPitch,firstPerson?0:0.25);
			}
			if(flashlightYaw !== this.blendFlashlightYaw.targetValue()){
				this.blendFlashlightYaw.setValue(flashlightYaw,firstPerson?0:0.25);
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
				this.needsMaterialUpdate=true;
			}
		}
	}

	makeBlender(key,dfault,clazz=Blender){
		if(key in this.char.mv3d_blenders){
			dfault = this.char.mv3d_blenders[key];
		}else{
			this.char.mv3d_blenders[key]=dfault;
		}
		const blender=new clazz(key,dfault,false);
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

	//===========================
	//	Update Functions
	//===========================

	update(){
		if(this.char._erased){
			this.dispose();
		}

		const bitmapReady = this.isBitmapReady();

		this.visible=bitmapReady&&this.mv_sprite.visible;
		if(typeof this.char.isVisible === 'function'){
			this.visible=this.visible&&this.char.isVisible();
		}
		const inRenderDist = this.char.mv3d_inRenderDist();
		//this.disabled=!this.visible;
		if(this.char.isTransparent() || !inRenderDist
		|| (this.char._characterName||this.tileId)&&!this.model.textureLoaded&&!this.isComplex){
			this.visible=false;
		}
		if(!this._isEnabled){
			if(this.visible){ this.setEnabled(true); this.needsPositionUpdate=true; }
		}else{
			if(!this.visible){ this.setEnabled(false); }
		}

		if(this.isImageChanged()){
			this.updateCharacter();
		}
		//if(this.patternChanged()){
		//	this.updateFrame();
		//}

		if(!inRenderDist||!bitmapReady){
			//this.updateAnimations();
			return;
		}

		if(this.blendElevation.update()){
			this.needsPositionUpdate=true;
		}else if(this.x!==this.char._realX || this.y!==this.char._realY
		|| this.falling || this.prevZ !== this.z
		|| this.platformChar&&this.platformChar.needsPositionUpdate
		|| this.isPlayer || this.char===$gamePlayer.vehicle()
		){
			this.needsPositionUpdate=true;
			this.prevZ = this.z;
		}

		if(!this.isEmpty && this._isEnabled){
			this.updateNormal();
		}else{
			this.updateEmpty();
		}
		this.updateAnimations();
		
		if(this.needsMaterialUpdate){
			this.updateEmissive();
			this.needsMaterialUpdate=false;
		}
		if(this.needsScaleUpdate){
			this.updateScale();
			this.needsScaleUpdate=false;
		}
		this.char.mv3d_positionUpdated=this.needsPositionUpdate;
		this.needsPositionUpdate=false;
		//this.mesh.renderOutline=true;
		//this.mesh.outlineWidth=1;
	}
	//get needsPositionUpdate(){return this._needsPositionUpdate; }
	//set needsPositionUpdate(v){ this._needsPositionUpdate=v; }

	updateNormal(){

		this.model.update();

		if(this.isPlayer){
			this.model.mesh.visibility = +!mv3d.is1stPerson(true);
		}

		this.updateAlpha();

		this.updatePosition();
		this.updateElevation();
		if(this.shadow){ this.updateShadow(); }
		this.updateLights();

		// updating the scale every frame still doesn't fix all problems with ChronoEngine.
		//this.updateScale();
	}

	updateEmpty(){
		this.updatePosition();
		this.updateElevation();
		this.updateLights();
		if(this.shadow&&this.shadow._isEnabled){ this.shadow.setEnabled(false); }
	}

	updateAlpha(){
		const materials = this.model.materials;
		if(!materials.length){ return; }
		
		this.bush = Boolean(this.char.bushDepth());
		if(this.model.material){
			const material = this.model.material;
			if(this.bush && this.hasBush()){
				if(!material.opacityTexture){
					const bushAlpha = mv3d.getBushAlphaTextureSync();
					if(bushAlpha&&bushAlpha.isReady()){
						material.opacityTexture=bushAlpha;
					}
				}
			}else{
				if(material.opacityTexture){
					material.opacityTexture=null;
				}
			}
		}

		const alpha = this.getConfig('alpha',1)*this.char.opacity()/255;
		const _hasAlpha=this.hasConfig('alpha')||alpha<1;
		const blendMode = mv3d.blendModes[this.char.blendMode()];
		for(const material of materials){
			if(!material._mv3d_orig_alpha){ material._mv3d_orig_alpha=material.alpha; }
			let hasAlpha = _hasAlpha||material._mv3d_orig_alpha<1;
			if(material.alphaMode!==blendMode){
				material.alphaMode=blendMode;
			}
			if(blendMode!==mv3d.blendModes.NORMAL){
				hasAlpha=true;
			}
			if(hasAlpha||material.opacityTexture){
				material.useAlphaFromDiffuseTexture=true;
				material.alpha=alpha*material._mv3d_orig_alpha;
			}else{
				material.useAlphaFromDiffuseTexture=false;
				material.alpha=1;
			}
		}
	}

	updateLightOffsets(){
		if(this.lamp){
			const offset = {
				x: this.getConfig('lampXoff',0),
				y: this.getConfig('lampYoff',0),
				z: this.getConfig('lampZoff',mv3d.LAMP_HEIGHT),
			}
			this.lampOrigin.x=offset.x;
			this.lampOrigin.y=offset.y;
			this.lampOrigin.z=offset.z;
		}
		if(this.flashlight){
			const offset = {
				x: this.getConfig('flashlightXoff',0),
				y: this.getConfig('flashlightYoff',0),
				z: this.getConfig('flashlightZoff',mv3d.FLASHLIGHT_HEIGHT),
			}
			this.flashlightOrigin.x=offset.x;
			this.flashlightOrigin.y=offset.y;
			this.flashlightOrigin.z=offset.z;
		}
	}

	updatePositionOffsets(){
		this.spriteOrigin.position.set(0,0,0);
		if(this.model.shape===mv3d.enumShapes.FLAT){
			const elevation = this.blendElevation.currentValue();
			const offsetDist = mv3d.LAYER_DIST*4;
			if(this.hasConfig('zlock')){
				this.spriteOrigin.z = 0;
			}else if(elevation){
				this.spriteOrigin.z = Math.max(0,offsetDist - elevation);
			}else{
				this.spriteOrigin.z = offsetDist;
			}
		}else if(this.model.shape===mv3d.enumShapes.SPRITE){
			this.spriteOrigin.z = mv3d.LAYER_DIST*4 * (1-Math.max(0,Math.min(90,mv3d.blendCameraPitch.currentValue()))/90);
		
			const billboardOffset = new Vector2(Math.sin(-mv3d.cameraNode.rotation.y),Math.cos(mv3d.cameraNode.rotation.y));
			this.spriteOrigin.x=billboardOffset.x*mv3d.SPRITE_OFFSET;
			this.spriteOrigin.y=billboardOffset.y*mv3d.SPRITE_OFFSET;
		}

		if(this.isPlayer&&mv3d.is1stPerson()){
			this.lightOrigin.x=0;
			this.lightOrigin.y=0;
		}else{
			this.lightOrigin.x=this.spriteOrigin.x;
			this.lightOrigin.y=this.spriteOrigin.y;
		}

		this.spriteOrigin.x += this.getConfig('xoff',0);
		this.spriteOrigin.y += this.getConfig('yoff',0);
		this.spriteOrigin.z += this.getConfig('zoff',0);
		
	}

	updatePosition(){
		this.updatePositionOffsets();

		const loopPos = mv3d.loopCoords(this.char._realX,this.char._realY);
		this.x = loopPos.x;
		this.y = loopPos.y;

		if(!this.needsPositionUpdate) { return; }

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
			if(vehicle&&vehicle.mv3d_sprite){
			//if(vehicle&&vehicle._driving){
				const vehicle_sprite = vehicle.mv3d_sprite;
				this.z = vehicle_sprite.z;
				this.targetElevation = vehicle_sprite.targetElevation;
				this.platformChar = vehicle_sprite.platformChar;
				this.platformHeight = vehicle_sprite.platformHeight;
				if(vehicle._driving){ return; }
			}
		}

		if(this.hasConfig('zlock')){
			this.z=this.getConfig('zlock',0);
			this.z += this.blendElevation.currentValue();
			this.targetElevation = this.z;
			return;
		}

		this.hasFloat = this.isVehicle || (this.isPlayer||this.isFollower)&&$gamePlayer.vehicle();

		const platform = this.getPlatform(this.char._realX,this.char._realY);
		this.platform = platform;
		this.platformHeight = platform.z2;
		this.platformChar = platform.char;

		this.targetElevation = this.getTargetElevation(this.char._realX,this.char._realY,{platform});
		let gravity = this.getConfig('gravity',mv3d.GRAVITY)/60;

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

	getTargetElevation(x=this.char._realX,y=this.char._realY,opts={}){
		if(this.isPlayer){
			const vehicle = this.char.vehicle();
			if(vehicle&&vehicle.mv3d_sprite&&vehicle._driving){
				return vehicle.mv3d_sprite.getTargetElevation(x,y);
			}
		}
		if(this.hasConfig('zlock')){
			return this.getConfig('zlock',0)+this.blendElevation.currentValue();
		}

		if(!opts.platform){ opts.platform = this.getPlatform(x,y,opts); }
		const platform = opts.platform;
		let targetElevation;
		if(this.hasFloat && !this.platformChar){
			targetElevation = this.getPlatformFloat(x,y,{platform});
		}else{
			targetElevation = platform.z2;
		}

		targetElevation += this.blendElevation.currentValue()

		if(this.isAirship && $gamePlayer.vehicle()===this.char){
			targetElevation += mv3d.loadData('airship_height',mv3d.AIRSHIP_SETTINGS.height)*this.char._altitude/this.char.maxAltitude();
		}
		return targetElevation;
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
		let shadowVisible = Boolean(this.getConfig('shadow', this.model.shape!=mv3d.enumShapes.FLAT ));

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

		const shadowDist = Math.max(this.z - this.platformHeight, 0);
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
		for(const animation of this.char.mv_sprite._animationSprites){
			if(animation.mv3d_animation){
				animation.mv3d_animation.update();
			}
		}
		if(this.char.mv_sprite._animationSprites.length){
			this.needsMaterialUpdate=true;
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
		const dfault = this.model.shape===mv3d.enumShapes.FLAT||this.char._priorityType===0?0:this.spriteHeight;
		let collide = this.getConfig('collide',dfault);
		return collide===true ? dfault : Number(collide);
	}

	getCollider(){
		if(this._collider){ return this._collider; }
		const collider = {char:this};
		this._collider=collider;
		Object.defineProperties(collider,{
			z1:{get:()=>this.z },
			z2:{get:()=>{
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
	const ddir=this._character.mv3d_direction();
	const useDiagonal = !this._isBigCharacter&&this._characterIndex<4&&this._characterName.includes(mv3d.DIAG_SYMBOL);
	let dir;
	if(dirfix||mv3d.isDisabled()){
		if(useDiagonal){ dir=ddir; }
		else{ dir=this._character.direction(); }
	}else if(useDiagonal){
		dir = mv3d.transformFacing(ddir,mv3d.blendCameraYaw.currentValue(),true);
	}else{
		dir = mv3d.transformFacing(ddir,mv3d.blendCameraYaw.currentValue(),false);
	}
	if(dir%2){
		return diagRow[dir];
	}else{
		return dir/2-1;
	}
},()=> !mv3d.isDisabled() || mv3d.DIR8MOVE&&mv3d.DIR8_2D);
const diagRow={
	3:4,
	1:5,
	9:6,
	7:7,
};

override(Sprite_Character.prototype,'setFrame',o=>function(x, y, width, height){
	o.apply(this,arguments);
	const sprite = this._character.mv3d_sprite; if(!sprite){ return; }
	if(sprite.isImageChanged()){ return; }
	sprite.setFrame(x,y,this.patternWidth(),this.patternHeight());
});

override(Sprite_Character.prototype,'setBlendColor',o=>function(){
	o.apply(this,arguments);
	const sprite = this._character.mv3d_sprite; if(!sprite){ return; }
	sprite.needsMaterialUpdate=true;
});

override(Game_CharacterBase.prototype,'tileId',o=>function(){
	if(this.mv3d_sprite){ return this.mv3d_sprite.tileId; }
	return this._tileId;
});

mv3d.Character = Character;


override(Game_CharacterBase.prototype,'isOnBush',o=>function(){
	if(!this.mv3d_sprite){ return o.apply(this,arguments); }
	const rx=Math.round(this._realX), ry=Math.round(this._realY);
	const tileData=mv3d.getTileData(rx,ry);
	const layers = mv3d.getTileLayers(rx,ry,this.mv3d_sprite.z+this.mv3d_sprite.getCHeight(),false);
	const flags = $gameMap.tilesetFlags();
	for( const l of layers ){
		if( (flags[tileData[l]] & 0x40) !== 0 ){ return true; }
	}
	return false;
});