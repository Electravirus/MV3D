
export function hackShaders(){
	hackShaderAlphaCutoff('shadowMapPixelShader');
	hackShaderAlphaCutoff('depthPixelShader');
	//hackDefaultShader();
}

function hackShaderAlphaCutoff(shader){
	hackShaderReplace(shader,
		'if (texture2D(diffuseSampler,vUV).a<0.4)',
		`if (texture2D(diffuseSampler,vUV).a<${mv3d.ALPHA_CUTOFF})`,
	);
}
function hackShaderReplace(shader,find,replace){
	BABYLON.Effect.ShadersStore[shader]=BABYLON.Effect.ShadersStore[shader].replace(find,replace);
}
function hackShaderInsert(shader,find,insert){
	hackShaderReplace(shader,find,`${find}\n${insert}\n`);
}

function hackDefaultShader(){

}
