import mv3d from './mv3d.js';

mv3d.features={};

mv3d.callFeature=function(name,method,...args){
	if(!this.featureEnabled(name)){ return; }
	const feature = this.features[name];
	if(method in feature.methods){
		feature.methods[method](...args);
	}
}

mv3d.callFeatures=function(method,...args){
	for(const name in this.features){
		this.callFeature(name,method,...args);
	}
}

mv3d.featureEnabled=function(name){
	if( !(name in this.features) ){ return false; }
	if(!this.features[name].enabled()){ return false; }
	return true;
}

export class Feature{
	constructor(name,methods,condition=true){
		Object.assign(this,{name,condition,methods});
		mv3d.features[name]=this;
	}
	enabled(){
		if(typeof this.condition==='function'){
			return this.condition();
		}
		return Boolean(this.condition);
	}
}
mv3d.Feature = Feature;
