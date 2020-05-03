import mv3d from './mv3d.js';
import { TransformNode, SceneLoader } from 'babylonjs';
import { foldername, filename } from './util.js';

const modelCache={};

class Model extends TransformNode{
	constructor(){
		this.mesh=null;
		this.importedModel=null;
	}

	loadModel(path){
		SceneLoader.LoadAssetContainer("./models/", "Applebox.obj", mv3d.scene, function (container) {
			window.meshes = container.meshes;
			window. materials = container.materials;
			for (const mat of materials){
				mat.ambientColor.set(1,1,1)	;
			}
			for (const mesh of meshes){
				mesh.renderingGroupId=1;
			}
			// Adds all elements to the scene
			container.addAllToScene();
		});
	}
}

mv3d.testImportModel=function(url){
	const node = new TransformNode('importedModel',mv3d.scene);
	SceneLoader.LoadAssetContainer(foldername(url), filename(url), mv3d.scene, function (container) {
		const meshes = container.meshes;
		const materials = container.materials;
		node.meshes=meshes; node.materials=materials;
		for (const mat of materials){
			mat.ambientColor.set(1,1,1);
			const texture = mat.diffuseTexture;
			if(texture) mv3d.waitTextureLoaded(texture).then(texture=>{
				texture.updateSamplingMode(1);
			});
		}
		for (const mesh of meshes){
			mesh.renderingGroupId=1;
			mesh.parent=node;
		}
		container.addAllToScene();
	});
	return node;
}