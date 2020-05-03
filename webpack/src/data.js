import mv3d from './mv3d.js';

const isPlaytest = Utils.isOptionValid('test');

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

const _loadDataFile = DataManager.loadDataFile;
DataManager.loadDataFile = function(name, src) {
	if(src.startsWith('Test_mv3d_')){
		src=src.replace('Test_mv3d_','mv3d_')
	}
	_loadDataFile.call(this,name,src);
};

class DataProxy{
	constructor(varName,fileName,defaultData={}){
		this.varName=varName;
		this.fileName=fileName;
		if(isPlaytest){
			const fs = require('fs');
			const path = require('path');
			const filePath = path.resolve(nw.__dirname,'data',fileName);
			if(!fs.existsSync(filePath)) {
				fs.writeFileSync(filePath,JSON.stringify(typeof defaultData==='function'?defaultData():defaultData));
			}
		}
		DataManager._databaseFiles.push({name:varName,src:fileName});

		this._dirty=false;
		this._data_handler={
			get:(target,key)=>{
				if(target[key]&&typeof target[key]==='object'){
					return new Proxy(target[key],this._data_handler);
				}else{
					return target[key];
				}
			},
			set:(target,key,value)=>{
				this._dirty=true;
				target[key]=value;
			},
			deleteProperty:(target,key)=>{
				this._dirty=true;
				delete target[key];
			},
		}
		this.writing=false;
		DataProxy.list.push(this);
	}
	setup(){
		this._data=window[this.varName];
		if(isPlaytest){
			window[this.varName]=new Proxy(this._data,this._data_handler);
		}
	}
	async update(){
		if(!isPlaytest){ return; }
		if(this._dirty&&!this.writing){
			this.writing=true;
			this._dirty=false;
			await saveFile(`data/${this.fileName}`,JSON.stringify(this._data));
			this.writing=false;
		}
	}
}
DataProxy.list=[];
mv3d.DataProxy=DataProxy;

const _onBoot = Scene_Boot.prototype.start;
Scene_Boot.prototype.start=function(){
	_onBoot.apply(this,arguments);
	mv3d.setupData();
}

Object.assign(mv3d,{
	setupData(){
		for (const dataProxy of DataProxy.list){
			dataProxy.setup();
		}
	},
	updateData(){
		for (const dataProxy of DataProxy.list){
			dataProxy.update();
		}
	}
});

new DataProxy('mv3d_data','mv3d_data.json',()=>({
	id:crypto.getRandomValues(new Uint32Array(1))[0],
}));