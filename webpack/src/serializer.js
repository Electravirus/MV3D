import mv3d from './mv3d.js';
import { SceneSerializer, AssetsManager } from 'babylonjs';

const _onBoot = Scene_Boot.prototype.start;
Scene_Boot.prototype.start=function(){
	_onBoot.apply(this,arguments);
	mv3d.setupSerializer();
}
const isPlaytest = Utils.isOptionValid('test');

if(isPlaytest){
	const fs = require('fs');
	const path = require('path');
	const fileName = path.resolve(nw.__dirname,'data/mv3d_data.json');
	if(!fs.existsSync(fileName)) {
		fs.writeFileSync(fileName,JSON.stringify({
			id:crypto.getRandomValues(new Uint32Array(1))[0],
		}));
	}
}

DataManager._databaseFiles.push({name:'mv3d_data',src:`mv3d_data.json`});
let _mv3d_data;
const mv3d_data_handler={
	get(target,key){
		if(target[key]&&typeof target[key]==='object'){
			return new Proxy(target[key],mv3d_data_handler);
		}else{
			return target[key];
		}
	},
	set(target,key,value){
		_mv3d_data._dirty=true;
		target[key]=value;
	}
}
let writing_mv3d_data=false;

Object.assign(mv3d,{
	setupSerializer(){
		_mv3d_data=mv3d_data;
		if(isPlaytest){
			mv3d_data=new Proxy(_mv3d_data,mv3d_data_handler);
		}
	},
	async updateSerializer(){
		if(!isPlaytest){ return; }
		if(_mv3d_data._dirty&&!writing_mv3d_data){
			writing_mv3d_data=true;
			_mv3d_data._dirty=false;
			await saveFile(`data/mv3d_data.json`,JSON.stringify(_mv3d_data));
			writing_mv3d_data=false;
		}
	},

	async loadFinalizedCells(vectors){
		const assetsManager = new AssetsManager(this.scene);
		for (const vector of vectors){
			const key = [vector2.x,vector2.y].toString();
			assetsManager.addMeshTask(key,'','./',`${mv3d.MV3D_FOLDER}/finalizedMaps/${$gameMap.mapId().padZero(3)}/${key}.babylon`);
		}
		assetsManager.load();
	},

	async finalizeCell(cell){
		const meshdata = SceneSerializer.SerializeMesh(cell.mesh);
		const fileName = `${mv3d.MV3D_FOLDER}/finalizedMaps/${$gameMap.mapId().padZero(3)}/${[cell.cx,cell.cy]}.babylon`;
		await saveFile(fileName,JSON.stringify(meshdata));
	},

	openMenu(){
		const choices = [
			"Finalize this cell",
			"Definalize this cell",
			"Finalize all loaded cells",
			"Definalize all cells",
		];
		$gameMessage.setChoices(choices, 0);
		$gameMessage.setChoicePositionType(1);
		$gameMessage.setChoiceCallback(choice=>{
	
		});
	},

});

const saveFile=async(fileName,fileData)=>{
	const fs=require('fs');
	const path=require('path');
	const filePath = path.resolve(global.__dirname,fileName);
	await ensureDirectory(path.dirname(filePath));
	await new Promise((resolve,reject)=>{
		fs.writeFile(filePath,fileData,err=>{
			if(err){ reject(err); return; }
			resolve();
		});
	});
}

const ensureDirectory=(dirName)=>new Promise((resolve,reject)=>{
	const fs=require('fs');
	const path=require('path');
	fs.mkdir(path.resolve(global.__dirname,dirName),{recursive:true},err=>{
		if(err&&err.code!=='EEXIST'){ reject(err); return; }
		resolve();
	});
});
