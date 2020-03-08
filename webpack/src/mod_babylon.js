
const BABYLON = window.BABYLON;
export const {
	Scene,
	Engine,
	FreeCamera,
	HemisphericLight,
	DirectionalLight,
	SpotLight,
	PointLight,
	ShadowGenerator,
	Vector2,
	Vector3,
	Vector4,
	Color3,
	Color4,
	Plane,
	Node,
	TransformNode,
	Texture,
	StandardMaterial,
	ShaderMaterial,
	Effect,
	Mesh,
	VertexData,
	MeshBuilder,
	AssetsManager,
	SceneSerializer,
	Sprite,
	SpriteManager,
} = BABYLON;

export const {
	FRONTSIDE,BACKSIDE,DOUBLESIDE,
} = Mesh;

export const {
	PERSPECTIVE_CAMERA,
	ORTHOGRAPHIC_CAMERA,
} = BABYLON.Camera;

export const{
	FOGMODE_NONE,
	FOGMODE_EXP,
	FOGMODE_EXP2,
	FOGMODE_LINEAR,
} = Scene;

export const WORLDSPACE = BABYLON.Space.WORLD,
             LOCALSPACE = BABYLON.Space.LOCAL,
              BONESPACE = BABYLON.Space.BONE;

import mv3d from './mv3d.js';
import { radtodeg, degtorad } from './util.js';
import { hackShaders } from './shaders.js';

Texture.prototype.crop=function(x=0,y=0,w=0,h=0,useBaseSize=false){
	const { width, height } = useBaseSize?this.getBaseSize():this.getSize();
	if(!w)w=width-x;
	if(!h)h=height-y;
	if(mv3d.EDGE_FIX){ x+=mv3d.EDGE_FIX;y+=mv3d.EDGE_FIX;w-=mv3d.EDGE_FIX*2;h-=mv3d.EDGE_FIX*2; }
	if(!useBaseSize){
		const size = this.getSize(), baseSize = this.getBaseSize();
		const scaleX=baseSize.width/size.width;
		const scaleY=baseSize.height/size.height;
		x/=scaleX; w/=scaleX; y/=scaleY; h/=scaleY;
	}
	this.uScale=w/width;
	this.vScale=h/height;
	this.uOffset=x/width;
	this.vOffset=1-y/height-this.vScale;
}

const _mixin_xyz = {
	x:{
		get(){ return this.position?this.position.x:undefined; },
		set(v){ if(this.position){ this.position.x=v; } },
	},
	y:{
		get(){ return this.position?-this.position.z:undefined; },
		set(v){ if(this.position){ this.position.z=-v; } },
	},
	z:{
		get(){ return this.position?this.position.y:undefined; },
		set(v){ if(this.position){ this.position.y=v; } },
	},
};
const _mixin_angles = {
	pitch:{
		get(){ return this.rotation?-radtodeg(this.rotation.x):undefined; },
		set(v){ if(this.rotation){ this.rotation.x=-degtorad(v); } },
	},
	yaw:{
		get(){ return this.rotation?-radtodeg(this.rotation.y):undefined; },
		set(v){  if(this.rotation){ this.rotation.y=-degtorad(v); } },
	},
	roll:{
		get(){ return this.rotation?-radtodeg(this.rotation.z):undefined; },
		set(v){  if(this.rotation){ this.rotation.z=-degtorad(v); } },
	},
}
Object.defineProperties(Node.prototype,_mixin_xyz);
Object.defineProperties(Node.prototype,_mixin_angles);
Object.defineProperties(Sprite.prototype,_mixin_xyz);

// mesh sorting

Object.defineProperty(Mesh.prototype,'order',{
	get(){ return this._order; },
	set(v){ this._order=v; this._scene.sortMeshes(); }
});
const meshSorter=(m1,m2)=>(m1._order|0)-(m2._order|0);
Scene.prototype.sortMeshes=function(){
	this.meshes.sort(meshSorter);
}
const _addMesh = Scene.prototype.addMesh;
Scene.prototype.addMesh=function(mesh){
	_addMesh.apply(this,arguments);
	if(typeof mesh._order==='number'){
		this.sortMeshes();
	}
}
const _removeMesh = Scene.prototype.removeMesh;
Scene.prototype.removeMesh=function(mesh){
	_removeMesh.apply(this,arguments);
	this.sortMeshes();
}

// color
Color3.prototype.toNumber=Color4.prototype.toNumber=function(){return this.r*255<<16|this.g*255<<8|this.b*255;}

// hack babylon
export function setupBabylonMods(){
	hackShaders();
};

StandardMaterial.prototype._shouldTurnAlphaTestOn=function(mesh){
	return this.needAlphaTesting();
};

