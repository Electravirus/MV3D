import mv3d from './mv3d.js';
import { TransformNode, StandardMaterial, InstancedMesh } from 'babylonjs';
import { sleep } from './util.js';

const modelInstanceCache={};
mv3d.modelInstanceCache=modelInstanceCache;

const orphanModelList=[];

mv3d.clearModelCache=function(){
	for (const key in modelInstanceCache){
		const mesh = modelInstanceCache[key];
		delete modelInstanceCache[key];
		mesh.dispose(false,true);
	}
};

export class Model extends TransformNode{
	constructor(opts={}){
		super('model',mv3d.scene);
		this.mesh=null;
		this.textureLoaded=false;
		const {orphan=true}=opts;
		if(orphan){ orphanModelList.push(this); }
	}
	get meshes(){ return this.mesh instanceof MeshGroup ? this.mesh.meshes : [this.mesh]; }
	get materials(){ return this.mesh.mv3d_materials ? this.mesh.mv3d_materials : this.material ? [this.material] : []; }
	setupMesh(){
		if(!this.mesh||this.mesh.mv3d_isSetup){ return; }
		this.mesh.mv3d_isSetup=true;
		mv3d.callFeatures('createCharMesh',this.mesh);
		this.mesh.parent=this;
		this.mesh.yaw=0;
		this.mesh.pitch=0;
		if(this.shape===mv3d.enumShapes.XCROSS){
			this.mesh.yaw=45;
		}
		if(this.material && !this.isComplexMesh()){
			this.mesh.material=this.material;
		}
		if(this.character){
			this.character.setupMesh();
		}
		if(this.order!=null){ this.mesh.order=this.order; }
	}
	isComplexMesh(){
		return this.shape === mv3d.enumShapes.MODEL || this.shape === mv3d.enumShapes.MESH;
	}
	async setMaterial(src){
		let newTexture;
		if(src==='error'){
			newTexture = await mv3d.getErrorTexture();
		}else{
			newTexture = await mv3d.createTexture(src);
		}
		await mv3d.waitTextureLoaded(newTexture);
		this.disposeMaterial();
		this.texture = newTexture;
		this.texture.hasAlpha=true;
		this.texture.updateSamplingMode(1);
		this.textureLoaded=true;
		this.material = new StandardMaterial('sprite material',mv3d.scene);
		this.material.diffuseTexture=this.texture;
		this.material.alphaCutOff = mv3d.ALPHA_CUTOFF;
		this.material.ambientColor.set(1,1,1);
		this.material.specularColor.set(0,0,0);
		this.material.maxSimultaneousLights=mv3d.LIGHT_LIMIT;
		this.material.backFaceCulling=false;
		this.material.twoSidedLighting=true;
		if(!this.isComplexMesh()){
			this.mesh.material=this.material;
		}
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
		if(this.isComplexMesh()){
			if(this.mesh instanceof InstancedMesh){
				super.dispose(false,false);
			}else{
				super.dispose(false,true);
			}
		}else{
			super.dispose(...args);
		}
	}
	clearShape(){
		this.shape=null;
		this.model_filename=null;
		this.mesh_text=null;
	}
	clearMesh(){
		if(!this.mesh){ return; }
		mv3d.callFeatures('destroyCharMesh',this.mesh);
		this.mesh.dispose();
	}
	setMesh(mesh){
		this.clearMesh();
		this.mesh=mesh;
		this.setupMesh();
	}
	setMeshForShape(shape){
		if(this.shape===shape){ return; }
		this.clearShape();
		this.shape=shape;
		let geometry = mv3d.Meshes.SPRITE;
		const shapes = mv3d.enumShapes;
		switch(this.shape){
		case shapes.FLAT:
			geometry = mv3d.Meshes.FLAT;
			break;
		case shapes.XCROSS:
		case shapes.CROSS:
			geometry = mv3d.Meshes.CROSS;
			break;
		case shapes['8CROSS']:
			geometry = mv3d.Meshes['8CROSS'];
			break;
		case shapes.FENCE:
		case shapes.WALL:
			geometry = mv3d.Meshes.WALL;
			break;
		case shapes.BOARD:
			geometry = mv3d.Meshes.BOARD;
			break;
		}
		this.setMesh(geometry.clone());
	}
	async importModel(filename,opts={}){
		if(this.shape === mv3d.enumShapes.MODEL && this.model_filename === filename){
			return;
		}
		this.clearShape();
		this.model_filename = filename;
		this.shape = mv3d.enumShapes.MODEL;
		if(opts.useInstance){
			if(filename in modelInstanceCache){
				while(modelInstanceCache[filename]==='loading'){ await sleep(10); }
				var mesh = modelInstanceCache[filename];
				mesh.receiveShadows=true;
			}else{
				modelInstanceCache[filename]='loading';
				var mesh = await mv3d.importModel(filename);
				modelInstanceCache[filename]=mesh;
				mv3d.scene.removeMesh(mesh);
			}
			mesh = mesh.createInstance();
		}else{
			var mesh = await mv3d.importModel(filename);
		}
		if(!opts.nodelay){
			mesh.setEnabled(false);
			await sleep(100);
			mesh.setEnabled(true);
		}
		this.setMesh(mesh);
	}
	update(){
		if(this.mesh&&this.shape){
			if(this.shape===mv3d.enumShapes.SPRITE){
				this.mesh.pitch = mv3d.blendCameraPitch.currentValue()-90;
				this.mesh.yaw = mv3d.blendCameraYaw.currentValue();
			}else if(this.shape===mv3d.enumShapes.BOARD){
				this.mesh.yaw = mv3d.blendCameraYaw.currentValue();
				if(this.character){ this.mesh.yaw -= this.character.spriteOrigin.yaw; }
			}
		}
	}
}
mv3d.Model = Model;

export class MeshGroup extends TransformNode{
	constructor(){
		super('meshGroup',mv3d.scene);
		this.meshes=[];
	}
	addMesh(){
		this.meshes.push(...arguments);
		for(const mesh of arguments){
			mesh.parent=this;
		}
	}
	dispose(doNotRecurse,disposeMaterialAndTextures){
		super.dispose(doNotRecurse,disposeMaterialAndTextures);
		if(doNotRecurse) for(const mesh of this.meshes){
			mesh.dispose(doNotRecurse,disposeMaterialAndTextures);
		}
	}
}
mv3d.MeshGroup = MeshGroup;
for(const property of ['receiveShadows','renderingGroupId','visibility','character']){
	Object.defineProperty(MeshGroup.prototype,property,{
		get(){ const p=this[`_${property}`]; return p!==undefined?p:this.meshes[0][property]; },
		set(v){
			this[`_${property}`]=v;
			for(const mesh of this.meshes){
				mesh[property]=v;
			}
		},
	});
}

