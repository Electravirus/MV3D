import { Engine, Scene, TransformNode, FreeCamera, Node, Matrix, Vector2, Vector3, Color3, Quaternion } from 'babylonjs';
import { FOGMODE_LINEAR, ORTHOGRAPHIC_CAMERA, PERSPECTIVE_CAMERA, setupBabylonMods } from './mod_babylon.js';
import { degtorad, optimalFrustrumHeight } from "./util.js";
import * as util from "./util.js";


const mv3d = {
	util:util,

	setup(){
		this.setupParameters();
		setupBabylonMods();

		this.canvas = document.createElement('canvas');
		this.texture = PIXI.Texture.fromCanvas(this.canvas);
		this.texture.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST;
		this.engine = new Engine(this.canvas,this.ANTIALIASING);
		this.scene = new Scene(this.engine);
		//this.scene.clearColor.a=0;
		this.scene.clearColor.set(0,0,0,0);

		//this.engine.forcePOTTextures=true;

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

		//this.scene.activeCameras.push(this.camera);

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

	},

	updateCanvas(){
		this.canvas.width = Graphics._width*mv3d.RES_SCALE;
		this.canvas.height = Graphics._height*mv3d.RES_SCALE;
	},

	render(){
		this.scene.render();
		this.texture.update();
		//this.callFeatures('render');
	},

	lastMapUpdate:0,
	update(){
		if( performance.now()-this.lastMapUpdate > 1000 && !this.mapUpdating ){
			this.updateMap();
			this.lastMapUpdate=performance.now();
		}

		this.updateAnimations();

		this.updateCharacters();

		this.intensiveUpdate();

		this.updateBlenders();

		// input
		this.updateInput();

		for (const key in this.cells){
			this.cells[key].update();
		}

		this.callFeatures('update');

		//this.updateData();
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
	clearData(key){
		if(!$gameVariables){ return console.warn(`MV3D: Couldn't clear data ${key}`); }
		if(!$gameVariables.mv3d){ return; }
		delete $gameVariables.mv3d[key];
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
		return this.loadData('disabled', this.getMapConfig('disabled', false ));
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
		mv3d.createCharacters();
	},

	loopCoords(x,y){
		if(this.loopHorizontal()){
			const mapWidth=mv3d.mapWidth();
			const ox = this.cameraStick.x - mapWidth/2;
			x=(x-ox).mod(mapWidth)+ox;
		}
		if(this.loopVertical()){
			const mapHeight=mv3d.mapHeight();
			const oy = this.cameraStick.y - mapHeight/2;
			y=(y-oy).mod(mapHeight)+oy;
		}
		return new Vector2(x,y);
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
	getFovForDist(dist=mv3d.blendCameraDist.currentValue(),height=optimalFrustrumHeight()){
		return 2*Math.atan(height/2/dist);
	},
	getFrustrumHeight(dist=mv3d.blendCameraDist.currentValue(),fov=mv3d.camera.fov){
		return 2*dist*Math.tan(fov/2);
	},


	getScreenPosition(node,offset=Vector3.Zero()){
		const matrix = node.parent ? node.parent.getWorldMatrix() : Matrix.Identity();
		const pos = node instanceof Vector3 ? node.add(offset) : node.position.add(offset);
		const projected = Vector3.Project(pos,matrix,mv3d.scene.getTransformMatrix(),mv3d.camera.viewport);
		return {x:projected.x*Graphics.width, y:projected.y*Graphics.height, behindCamera:projected.z>1};
	},
	
	getUnscaledMatrix(mesh){
		const matrix = mesh.getWorldMatrix();
		const qrot=new Quaternion(), vtrans=new Vector3();
		matrix.decompose(null,qrot,vtrans);
		return Matrix.Compose(Vector3.One(),qrot,vtrans);
	},
	getTranslationMatrix(mesh){
		const matrix = mesh.getWorldMatrix();
		const vrot=Vector3.Zero(), vtrans=new Vector3();
		vrot.y=-degtorad(mv3d.blendCameraYaw.currentValue());
		vrot.x=-degtorad(mv3d.blendCameraPitch.currentValue()-90);
		matrix.decompose(null,null,vtrans);
		return Matrix.Compose(Vector3.One(),vrot.toQuaternion(),vtrans);
	},
	getRotationMatrix(mesh){
		const matrix = mesh.getWorldMatrix();
		const qrot=new Quaternion();
		matrix.decompose(null,qrot,null);
		return Matrix.Compose(Vector3.One(),qrot,Vector3.Zero());
	},

	globalPosition(node){
		const matrix = node.parent ? node.parent.getWorldMatrix() : Matrix.Identity();
		return Vector3.TransformCoordinates(node.position,matrix);
	},

}
window.mv3d=mv3d;
export default mv3d;