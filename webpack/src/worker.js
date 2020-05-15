

function getFunctionBody(fn){
	const fnStr = fn.toString(); 
	return fnStr.slice(fnStr.indexOf("{") + 1, fnStr.lastIndexOf("}"));
}

function createWorker(body){
	const blob = new Blob([body], { type: 'text/javascript' });
	const url = URL.createObjectURL(blob);
	return new Worker(url);
}

function createPromiseWorker(fn){
	let nextMessageId = 0;
	const promises = {};
	const worker = createWorker(`
	`+getFunctionBody(fn));
	const postMessage=(key,...args)=>new Promise((resolve,reject)=>{
		const id = nextMessageId++;
		promises[id]={resolve,reject};
		worker.postMessage({id,key,args});
	});
	worker.onmessage=e=>{
		const {id,ret,err} = e.data;
		if(!(id in promises)){ throw "Worker provided invalid message id"; }
		const {resolve,reject} = promises[id];
		if(err){ reject(err); return; }
		resolve(ret);
	}
	const proxy = new Proxy(worker,{
		get(key){ return async (...args)=>await postMessage(key,...args); },
		set(){ console.error("Can't set property on PromiseWorker"); },
	});
}

var worker = createWorker(function(){
	onmessage=async e=>{ postMessage(await NYA()); }
	var TEST=1;
	function NYA(){return "Nya!";}
});