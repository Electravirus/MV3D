
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
	// When no diffuse texture, use diffuseColor as baseColor
	hackShaderReplace('defaultPixelShader',
	'vec3 finalDiffuse=clamp(diffuseBase*diffuseColor+emissiveColor+vAmbientColor,0.0,1.0)*baseColor.rgb;',
	`#ifdef DIFFUSE
	vec3 finalDiffuse=clamp(diffuseBase*diffuseColor+emissiveColor+vAmbientColor,0.0,1.0)*baseColor.rgb;
	#else
	vec3 finalDiffuse=clamp(diffuseBase+emissiveColor+vAmbientColor,0.0,1.0)*diffuseColor.rgb;
	#endif
	`);
	// When emissive color higher than one, use illumination.
	hackShaderReplace('defaultPixelShader',
		'vec4 color=vec4(finalDiffuse*baseAmbientColor+finalSpecular+reflectionColor+refractionColor,alpha);',
		`vec3 mv3d_extra_emissiveColor = max(emissiveColor-1.,0.);
		vec4 color=vec4(clamp(finalDiffuse*baseAmbientColor+finalSpecular+reflectionColor+mv3d_extra_emissiveColor+refractionColor,0.0,1.0),alpha);`,
	);
}
