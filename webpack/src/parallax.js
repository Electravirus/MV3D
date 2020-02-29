import mv3d from './mv3d.js';
import { override } from './util.js';

override(Game_Map.prototype,'setupParallax',o=>function(){
	o.apply(this,arguments);
	this.mv3d_parallaxX=0;
	this.mv3d_parallaxY=0;
});

override(Game_Map.prototype,'changeParallax',o=>function(name, loopX, loopY, sx, sy){
	if (this._parallaxLoopX && !loopX || this._parallaxSx && !sx) {
		this.mv3d_parallaxX=0;
	}
	if (this._parallaxLoopY && !loopY || this._parallaxSy && !sy) {
		this.mv3d_parallaxY=0;
	}
	o.apply(this,arguments);
});

override(Game_Map.prototype,'updateParallax',o=>function(){
	if (this._parallaxLoopX) {
		this.mv3d_parallaxX += this._parallaxSx / 8;
	}
	if (this._parallaxLoopY) {
		this.mv3d_parallaxY += this._parallaxSy / 8;
	}
});

override(Game_Map.prototype,'parallaxOx',o=>function(){
	let ox = this.mv3d_parallaxX;
	if(this._parallaxLoopX){
		return ox - mv3d.blendCameraYaw.currentValue()*816/90;
	}
	return ox;
});

override(Game_Map.prototype,'parallaxOy',o=>function(){
	let oy = this.mv3d_parallaxY;
	if(this._parallaxLoopY){
		return oy - mv3d.blendCameraPitch.currentValue()*816/90;
	}
	return 0;
});

/*
['setDisplayPos','scrollUp','scrollDown','scrollLeft','scrollRight'].forEach(method=>{
	const _oldMethod=Game_Map.prototype[method];
	Game_Map.prototype[method]=function(){
		if (mv3d.isDisabled()){ _oldMethod.apply(this,arguments); }
	}
});
const _updateScroll = Game_Map.prototype.updateScroll;
Game_Map.prototype.updateScroll = function() {
	if (mv3d.mapDisabled){ return _updateScroll.apply(this,arguments); }
	this._displayX = -mv3d.blendCameraYaw.currentValue()*816/3600;
	this._displayY = -mv3d.blendCameraPitch.currentValue()*816/3600;
};
*/

Game_CharacterBase.prototype.mv3d_inRenderDist=function(){
	return Math.abs(this.x - mv3d.cameraStick.x)<=mv3d.RENDER_DIST
	&& Math.abs(this.y - mv3d.cameraStick.y)<=mv3d.RENDER_DIST;
};

override(Game_CharacterBase.prototype,'isNearTheScreen',o=>function(){
	if(!mv3d.EVENTS_UPDATE_NEAR){ return o.apply(this,arguments); }
	return this.mv3d_inRenderDist();
});


override(Game_Screen.prototype,'shake',o=>function(){
	return 0;
},()=> !mv3d.isDisabled() && SceneManager._scene instanceof Scene_Map );

override(Game_CharacterBase.prototype,'screenX',o=>function screenX(){
	const sprite = this.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	if(SceneManager.isNextScene(Scene_Battle)){
		return Graphics.width/2;
	}
	return mv3d.getScreenPosition(sprite).x;
});

override(Game_CharacterBase.prototype,'screenY',o=>function screenY(){
	const sprite = this.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	if(SceneManager.isNextScene(Scene_Battle)){
		return Graphics.height/2;
	}
	return mv3d.getScreenPosition(sprite).y;
});