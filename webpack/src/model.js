import mv3d from './mv3d.js';
import { TransformNode, SceneLoader, Mesh, StandardMaterial } from 'babylonjs';
import { foldername, filename } from './util.js';

const modelCache={};

const orphanModelList=[];

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
		if(this.character){ this.mesh.character=this.character; }
		if(this.material){
			this.mesh.material=this.material;
		}
		if(this.character){
			this.character.setupMesh();
		}
		if(this.order!=null){ this.mesh.order=this.order; }
	}
	isComplexMesh(){
		return this.shape === mv3d.enumShapes.IMPORTED || this.shape === mv3d.enumShapes.MESH;
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
		this.mesh.material=this.material;
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
		// TODO dispose differently for cached complex models
		super.dispose(...args);
	}
	clearMesh(){
		if(!this.mesh){ return; }
		mv3d.callFeatures('destroyCharMesh',this.mesh);
		this.mesh.dispose();
	}
	setMeshForShape(shape){
		if(this.shape===shape){ return; }
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
		case shapes.WALL:
		case shapes.FENCE:
			break;
		}
		this.clearMesh();
		this.mesh=geometry.clone();
		this.setupMesh();
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

mv3d.importModel=(url,merge=true)=>new Promise((resolve,reject)=>{
	// TODO: Caching
	SceneLoader.LoadAssetContainer(foldername(url), filename(url), mv3d.scene, container=>{
		const meshes = container.meshes;
		const materials = container.materials;
		for (const mat of materials){
			mat.ambientColor.set(1,1,1);
			const texture = mat.diffuseTexture;
			if(texture) mv3d.waitTextureLoaded(texture).then(texture=>{
				texture.updateSamplingMode(1);
			});
		}
		let totalVertices = 0;
		for (const mesh of meshes){
			totalVertices += mesh.getTotalVertices();
			if(!merge){
				mesh.renderingGroupId=mv3d.enumRenderGroups.MAIN;
			}
		}
		if(merge){
			const importedMesh = Mesh.MergeMeshes(meshes,true,totalVertices>64000,undefined,false,true);;
			importedMesh.renderingGroupId=mv3d.enumRenderGroups.MAIN;
			importedMesh.mv3d_materials=materials;
			resolve(importedMesh);
		}else{
			const group = new MeshGroup();
			container.addAllToScene();
			group.addMesh(...meshes);
			group.mv3d_materials = materials;
			resolve(group);
		}
	});
});