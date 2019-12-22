import { Engine, Scene, HemisphericLight, TransformNode, FreeCamera, Node, Vector2, Vector3, Color3, FOGMODE_LINEAR, DirectionalLight, ShadowGenerator, ORTHOGRAPHIC_CAMERA, PERSPECTIVE_CAMERA, setupBabylonMods } from "./mod_babylon.js";
import util, { v3origin, degtorad, tileSize } from "./util.js";


const mv3d = {
	util:util,

	setup(){
		this.setupParameters();
		setupBabylonMods();

		this.canvas = document.createElement('canvas');
		this.texture = PIXI.Texture.fromCanvas(this.canvas);
		this.engine = new Engine(this.canvas,this.ANTIALIASING);
		this.scene = new Scene(this.engine);
		//this.scene.clearColor.a=0;
		this.scene.clearColor.set(0,0,0,0);

		this.cameraStick = new TransformNode("cameraStick",this.scene);
		this.cameraNode = new TransformNode("cameraNode",this.scene);
		this.cameraNode.parent=this.cameraStick;
		this.camera = new FreeCamera("camera",new Vector3(0,0,0),this.scene);
		this.camera.parent=this.cameraNode;
		this.camera.fov=degtorad(mv3d.FOV);
		/*
		this.camera.orthoLeft=-Graphics.width/2/tileSize();
		this.camera.orthoRight=Graphics.width/2/tileSize();
		this.camera.orthoTop=Graphics.height/2/tileSize();
		this.camera.orthoBottom=-Graphics.height/2/tileSize();
		*/
		this.camera.minZ=0.1;
		this.camera.maxZ=this.RENDER_DIST;

		this.scene.ambientColor = new Color3(1,1,1);
		this.scene.fogMode=FOGMODE_LINEAR;

		this.map = new Node("map",this.scene);
		this.cells={};
		this.characters=[];

		this.setupBlenders();
		//this.updateBlenders(true);
		this.setupInput();

		this.setupSpriteMeshes();

		this.callFeatures('setup');

		if(isNaN(this.LIGHT_LIMIT)){
			const _sortLightsByPriority=BABYLON.Scene.prototype.sortLightsByPriority;
			BABYLON.Scene.prototype.sortLightsByPriority=function(){
				_sortLightsByPriority.apply(this,arguments);
				mv3d.updateAutoLightLimit();
			};
		}
	},

	updateCanvas(){
		this.canvas.width = Graphics._width;
		this.canvas.height = Graphics._height;
	},

	render(){
		this.scene.render();
		this.texture.update();
	},

	lastMapUpdate:0,
	update(){
		if( performance.now()-this.lastMapUpdate > 1000 && !this.mapUpdating ){
			this.updateMap();
			this.lastMapUpdate=performance.now();
		}

		this.updateAnimations();

		this.updateCharacters();

		this.updateBlenders();

		// input
		if(!mv3d.isDisabled()){
			if( mv3d.KEYBOARD_TURN || this.is1stPerson() ){
				if(Input.isTriggered('rotleft')){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+90,0.5);
				}else if(Input.isTriggered('rotright')){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-90,0.5);
				}
				if(this.is1stPerson()&&(Input.isTriggered('rotleft')||Input.isTriggered('rotright'))){
					this.playerFaceYaw();
				}
			}
			if( mv3d.KEYBOARD_PITCH ){
				if(Input.isPressed('pageup')&&Input.isPressed('pagedown')){
					// do nothing
				}else if(Input.isPressed('pageup')){
					this.blendCameraPitch.setValue(Math.min(180,this.blendCameraPitch.targetValue()+1.5),0.1);
				}else if(Input.isPressed('pagedown')){
					this.blendCameraPitch.setValue(Math.max(0,this.blendCameraPitch.targetValue()-1.5),0.1);
				}
			}
		}

		for (const key in this.cells){
			this.cells[key].update();
		}

		this.callFeatures('update');

		this.updateData();
	},

	loadData(key,dfault){
		if(!$gameVariables || !$gameVariables.mv3d || !(key in $gameVariables.mv3d)){ return dfault; }
		return $gameVariables.mv3d[key];
	},
	saveData(key,value){
		if(!$gameVariables){ return console.warn(`MV3D: Couldn't save data ${key}:${value}`); }
		if(!$gameVariables.mv3d){ $gameVariables.mv3d={}; }
		$gameVariables.mv3d[key]=value;
	},

	updateCameraMode(){
		const mode = this.cameraMode;
		let updated=false;
		if(mode.startsWith('O')){
			if(this.camera.mode!==ORTHOGRAPHIC_CAMERA){ this.camera.mode=ORTHOGRAPHIC_CAMERA; updated=true; }
		}else{
			if(this.camera.mode!==PERSPECTIVE_CAMERA){ this.camera.mode=PERSPECTIVE_CAMERA; updated=true; }
		}
		if(updated){
			this.updateBlenders(true);
			this.callFeatures('updateCameraMode');
			this.updateParameters();
		}
	},
	get cameraMode(){
		return this.loadData('cameraMode',this.CAMERA_MODE).toUpperCase();
	},
	set cameraMode(v){
		v = String(v).toUpperCase().startsWith('O') ? 'ORTHOGRAPHIC' : 'PERSPECTIVE' ;
		this.saveData('cameraMode',v);
		this.updateBlenders(true);
	},

	is1stPerson(useCurrent){
		const k = useCurrent?'currentValue':'targetValue';
		return this.getCameraTarget()===$gamePlayer && this.blendCameraTransition[k]()<=0
		&& this.blendCameraDist[k]()<=0 && this.blendPanX[k]()===0 && this.blendPanY[k]()===0;
	},

	isDisabled(){
		return this.getMapConfig('disabled')||this.loadData('disabled');
	},
	disable(fadeType=2){
		mv3d.saveData('disabled',true);
		//SceneManager.goto(Scene_Map);
		$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),fadeType);
	},
	enable(fadeType=2){
		mv3d.saveData('disabled',false);
		//SceneManager.goto(Scene_Map);
		$gamePlayer.reserveTransfer($gameMap.mapId(),$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction(),fadeType);
	},

	loopCoords(x,y){
		if($gameMap.isLoopHorizontal()){
			const mapWidth=$gameMap.width();
			const ox = this.cameraStick.x - mapWidth/2;
			x=(x-ox).mod(mapWidth)+ox;
		}
		if($gameMap.isLoopVertical()){
			const mapHeight=$gameMap.height();
			const oy = this.cameraStick.y - mapHeight/2;
			y=(y-oy).mod(mapHeight)+oy;
		}
		return new Vector2(x,y);
	},
	
	playerFaceYaw(){
		let dir = Math.floor((-mv3d.blendCameraYaw.targetValue()+45)/90).mod(4);
		if(dir>1){ dir+=(dir+1)%2*2-1; }
		dir=10-(dir*2+2);
		$gamePlayer.setDirection(dir);
	},

	dirToYaw(dir){
		let yaw = dir/2-1;
		if(yaw>1){ yaw+=(yaw+1)%2*2-1; }
		yaw=yaw*-90+180;
		return yaw;
	},
	
	transformDirectionYaw(dir,yaw=this.blendCameraYaw.currentValue(),reverse=false){
		if(dir==0){ return 0; }
		dir = dir/2-1;
		if(dir>1){ dir+=(dir+1)%2*2-1; }
		const c = Math.floor((yaw+45)/90);
		if(reverse){
			dir=(dir-c).mod(4);
		}else{
			dir=(dir+c).mod(4);
		}
		if(dir>1){ dir+=(dir+1)%2*2-1; }
		return dir*2+2;
	},

	autoLightLimit(lightLimit){
		if(isNaN(this.LIGHT_LIMIT)){
			return Math.max(4,lightLimit);
		}else{
			return this.LIGHT_LIMIT;
		}
	},

	updateAutoLightLimit(){
		const lightLimit=this.autoLightLimit(mv3d.scene.lights.length);
		for(const m of Object.values(mv3d.materialCache)){
			m.maxSimultaneousLights=lightLimit;
		}
		for(const char of this.characters){
			if(!char.material){ continue; }
			char.material.maxSimultaneousLights=this.autoLightLimit(char.mesh.lightSources.length);
		}
	},

	getFieldSize(dist=mv3d.blendCameraDist.currentValue()){
		const size = Math.tan(mv3d.camera.fov/2)*dist*2;
		return {
			width:size*mv3d.engine.getAspectRatio(mv3d.camera),
			height:size,
		};
	},
	getScaleForDist(dist=mv3d.blendCameraDist.currentValue()){
		return Graphics.height/this.getFieldSize(dist).height/48;
	},
	getScreenPosition(node,offset=Vector3.Zero()){
		const matrix = node.parent ? node.parent.getWorldMatrix() : BABYLON.Matrix.Identity();
		const pos = node instanceof Vector3 ? node.add(offset) : node.position.add(offset);
		const projected = Vector3.Project(pos,matrix,mv3d.scene.getTransformMatrix(),mv3d.camera.viewport);
		return {x:projected.x*Graphics.width, y:projected.y*Graphics.height, behindCamera:projected.z>1};
	},

}
window.mv3d=mv3d;
export default mv3d;