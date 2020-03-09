
export function hackShaders(){
	hackShaderAlphaCutoff('shadowMapPixelShader');
	hackShaderAlphaCutoff('depthPixelShader');
	hackDefaultShader();
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
	hackShaderReplace('defaultPixelShader',
		'vec4 color=vec4(finalDiffuse*baseAmbientColor+finalSpecular+reflectionColor+refractionColor,alpha);',
		`vec3 mv3d_extra_emissiveColor = max(emissiveColor-1.,0.);
		vec4 color=vec4(clamp(finalDiffuse*baseAmbientColor+finalSpecular+reflectionColor+mv3d_extra_emissiveColor+refractionColor,0.0,1.0),alpha);`,
	);
}
