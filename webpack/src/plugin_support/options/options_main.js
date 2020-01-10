import mv3d from '../../mv3d.js';

mv3d['option-store']={}

mv3d.options={
	'mv3d-renderDist':{
		name:"Render Distance",
		min:10, max:100,
		increment:5,
		wrap:false,
		apply(v){ mv3d.RENDER_DIST=v; },
		default:mv3d.RENDER_DIST,
	},
}

if(mv3d.MIPMAP_OPTION) mv3d.options['mv3d-mipmap']={
	name:"Mipmapping",
	type:'bool',
	apply(v){ mv3d.MIPMAP=v; mv3d.needReloadMap=true; },
	default:mv3d.MIPMAP,
}

if(mv3d.ENABLE_3D_OPTIONS){
	require('./options_enabled.js');
}