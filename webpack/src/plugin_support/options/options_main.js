import mv3d from '../../mv3d.js';

mv3d['option-store']={}

mv3d.options={};

if(mv3d.OPTION_RENDER_DIST) mv3d.options['mv3d-renderDist']={
	name:mv3d.OPTION_NAME_RENDER_DIST,
	min:mv3d.OPTION_RENDER_DIST_MIN, max:mv3d.OPTION_RENDER_DIST_MAX,
	increment:5,
	wrap:false,
	apply(v){ mv3d.RENDER_DIST=v; },
	default:mv3d.RENDER_DIST,
};

if(mv3d.OPTION_FOV) mv3d.options['mv3d-fov']={
	name:mv3d.OPTION_NAME_FOV,
	min:mv3d.OPTION_FOV_MIN, max:mv3d.OPTION_FOV_MAX,
	increment:5,
	apply(v){ mv3d.FOV=v; },
	default:mv3d.FOV,
};

if(mv3d.OPTION_MIPMAP) mv3d.options['mv3d-mipmap']={
	name:mv3d.OPTION_NAME_MIPMAP,
	type:'bool',
	apply(v){ mv3d.MIPMAP=v; mv3d.needReloadMap=true; },
	default:mv3d.MIPMAP,
};

if(mv3d.ENABLE_3D_OPTIONS){
	require('./options_enabled.js');
}