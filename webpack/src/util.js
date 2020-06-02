import mv3d from "./mv3d";

const {Vector2,Vector3,Color3,Color4} = window.BABYLON;

export const makeColor = color=>{
	if (typeof color === 'number'){
		return {
			r: (color>>16)/255,
			g: (color>>8&255)/255,
			b: (color&255)/255,
			a: 1,
		};
	}else if(color instanceof Color3){
		return color.toColor4();
	}else if(color instanceof Color4){
		return color;
	}else{
		const canvas = document.createElement('canvas');
		canvas.width=1; canvas.height=1;
		const context = canvas.getContext('2d');
		context.fillStyle = color; context.fillRect(0,0,1,1);
		const bytes = context.getImageData(0,0,1,1).data;
		return new Color4(bytes[0]/255,bytes[1]/255,bytes[2]/255,bytes[3]/255);
	}
}


export const hexNumber=n=>{
	n=String(n);
	if(n.startsWith('#')){
		n=n.substr(1);
	}
	return Number.parseInt(n,16);
};

export const relativeNumber=(current,n)=>{
	if(n===''){ return +current; }
	const relative = /^[+]/.test(n);
	if(relative){n=n.substr(1);}
	n=Number(n);
	if(Number.isNaN(n)){ return +current; }
	if(relative){
		return +current+n;
	}else{
		return +n;
	}
};

export const booleanNumber=s=>{
	if(!isNaN(s)){return Number(s);}
	return booleanString(s);
};
export const booleanString=s=>{
	return Boolean(falseString(s));
};
export const falseString=s=>{
	if(!s){ return false; }
	if(typeof s !=='string'){ s=String(s); }
	const S=s.toUpperCase();
	if(falseString.values.includes(S)){
		return false;
	}
	return s;
};
falseString.values=['OFF','FALSE','UNDEFINED','NULL','DISABLE','DISABLED'];

export const sleep=(ms=0)=>new Promise(resolve=>setTimeout(resolve,ms));
export const degtorad=deg=>deg*Math.PI/180;
export const radtodeg=rad=>rad*180/Math.PI;

export const pointtorad=(x,y)=>Math.atan2(-y,x)-Math.PI/2;
export const pointtodeg=(x,y)=>radtodeg(pointtorad(x,y));

export const sin=r=>unround(Math.sin(r),1e15);
export const cos=r=>unround(Math.cos(r),1e15);

export const unround=(n,m=1e15)=>Math.round(n*m)/m;

export const minmax=(min,max,v)=>Math.min(max,Math.max(min,v));

export const tileSize=()=>tileWidth();
export const tileWidth=()=>Game_Map.prototype.tileWidth();
export const tileHeight=()=>Game_Map.prototype.tileHeight();
export const optimalFrustrumWidth=()=>Graphics.width/48;
export const optimalFrustrumHeight=()=>Graphics.height/48;

export const file=(folder=mv3d.MV3D_FOLDER,name)=>{
	if(name.startsWith('/')){ return '.'+name; }
	else if(name.startsWith('./')){ return name; }
	if(folder.startsWith('/')){ folder='.'+folder; }
	else if(!folder.startsWith('./')&&folder!=='.'){ folder='./'+folder; }
	return `${folder}${folder.endsWith('/')?'':'/'}${name}`;
};

export const filename=path=>{path=path.split('/');return path[path.length-1];}
export const foldername=path=>{path=path.split('/');path.pop();return path.join('/')+'/';}

const issuedWarnings={};
export const deprecated=message=>{
	if(message in issuedWarnings){ return; }
	issuedWarnings[message]=true;
	console.warn(message);
};

export const throttle=(func,interval=100)=>{
	let last_call = 0;
	return function(){
		if(Date.now()-last_call>interval){
			func.apply(this,arguments);
			last_call = Date.now();
		}
	};
}

// directions

export const dirtoh=d=>5 + ((d-1)%3-1);
export const dirtov=d=>5 + (Math.floor((d-1)/3)-1)*3;
export const hvtodir=(h,v)=>5 + (Math.floor((v-1)/3)-1)*3 + ((h-1)%3-1);

// overloading

export const overload=funcs=>{
	const overloaded = function(){
		const l=arguments.length;
		if(typeof funcs[l] === 'function'){
			return funcs[l].apply(this,arguments);
		}else if(typeof funcs.default === 'function'){
			return funcs.default.apply(this,arguments);
		}else{ console.warn("Unsupported number of arguments."); }
	}
	for(const key in funcs){
		overloaded[key]=funcs[key].bind
	}
	return overloaded;
};

// override
const _override_default_condition=()=>!mv3d.isDisabled();
export const override=(obj,methodName,getNewMethod,condition=_override_default_condition)=>{
	const oldMethod = obj[methodName];
	const newMethod = getNewMethod(oldMethod);
	const overrider = function(){
		if(!(typeof condition==='function'?condition():condition)){ return oldMethod.apply(this,arguments); }
		return newMethod.apply(this,arguments);
	};
	Object.defineProperty(overrider,'name',{value:`${methodName}<mv3d_override>`});
	Object.defineProperty(newMethod,'name',{value:`${methodName}<mv3d>`});
	overrider.oldMethod=oldMethod; overrider.newMethod=newMethod;
	return obj[methodName] = overrider;
};

// assign
export const assign=(obj,methods)=>{
	for (const key in methods){
		const descriptor = Object.getOwnPropertyDescriptor(methods,key);
		if (descriptor.get||descriptor.set){
			Object.defineProperty(obj,key,descriptor);
		}else if(methods[key] instanceof mv3d.Attribute){
			const attribute = methods[key];
			Object.defineProperty(obj,key,attribute.descriptor);
		}else{
			obj[key]=methods[key];
		}
	}
};


// useful consts
export const XAxis = new Vector3(1,0,0);
export const YAxis = new Vector3(0,1,0);
export const ZAxis = new Vector3(0,0,1);
export const v2origin = new Vector2(0,0);
export const v3origin = new Vector3(0,0,0);

export const PI = Math.PI;
export const PI2 = Math.PI*2;
