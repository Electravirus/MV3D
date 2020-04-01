import mv3d from './mv3d.js';

mv3d.attributes={};

export class Attribute{
	constructor(name,dfault,reader){
		this.name=name.toLowerCase();
		this.reader = reader?reader:v=>v;
		this.default=this.reader(dfault);
		this.descriptor={
			get:()=>this.get(),
			set:v=>this.set(this.reader(v)),
		};
		Object.defineProperty(mv3d.attributes,this.name,this.descriptor);
	}
	get(){
		const storage = Attribute.getStorageLocation();
		if(!storage || !(this.name in storage)){ return this.default; }
		return storage[this.name];
	}
	set(v){
		const storage = Attribute.getStorageLocation();
		if (!storage){console.warn(`MV3D: Couldn't get Attribute storage location.`); return;}
		storage[this.name]=v;
	}
	static getStorageLocation(){
		if(!$gameVariables){ return null; }
		if(!$gameVariables.mv3d_attributes){ $gameVariables.mv3d_attributes = {}; }
		return $gameVariables.mv3d_attributes;
	}
}
mv3d.Attribute = Attribute;