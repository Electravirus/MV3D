import mv3d from './mv3d.js';
import { override, tileWidth, tileHeight } from './util.js';

override(Game_Map.prototype,'setupParallax',o=>function(){
	o.apply(this,arguments);
	this.mv3d_parallaxX=0;
	this.mv3d_parallaxY=0;
},true);

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
	const loopPos = mv3d.loopCoords(this.x,this.y);
	return Math.abs(loopPos.x - mv3d.cameraStick.x)<=mv3d.renderDist
	&& Math.abs(loopPos.y - mv3d.cameraStick.y)<=mv3d.renderDist;
};

override(Game_CharacterBase.prototype,'isNearTheScreen',o=>function(){
	if(!mv3d.EVENTS_UPDATE_NEAR){ return o.apply(this,arguments); }
	return this.mv3d_inRenderDist() || o.apply(this,arguments);
});


override(Game_Screen.prototype,'shake',o=>function(){
	return 0;
},()=> !mv3d.isDisabled() && SceneManager._scene instanceof Scene_Map );

override(Game_CharacterBase.prototype,'screenX',o=>function(){
	const sprite = this.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	if(SceneManager.isNextScene(Scene_Battle) && this===$gamePlayer){
		return Graphics.width/2;
	}
	return mv3d.getScreenPosition(sprite).x;
});

override(Game_CharacterBase.prototype,'screenY',o=>function(){
	const sprite = this.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }
	if(SceneManager.isNextScene(Scene_Battle) && this===$gamePlayer){
		return Graphics.height/2;
	}
	return mv3d.getScreenPosition(sprite).y;
});

Game_CharacterBase.prototype.mv3d_screenWidth=function(){
	const sprite = this.mv3d_sprite; if(!sprite)return this.mv3d_sprite?this.mv3d_sprite.width:0;
	return sprite.spriteWidth*tileWidth()*mv3d.getScaleForDist();
};

Game_CharacterBase.prototype.mv3d_screenHeight=function(){
	const sprite = this.mv3d_sprite; if(!sprite)return this.mv3d_sprite?this.mv3d_sprite.height:0;
	return sprite.spriteHeight*tileHeight()*mv3d.getScaleForDist();
};

Game_CharacterBase.prototype.mv3d_screenBounds=function(){
	const sprite = this.mv3d_sprite;
	if(!sprite){
		const width = this.mv3d_screenWidth();
		const height = this.mv3d_screenHeight();
		return new PIXI.Rectangle(this.screenX()-width/2,this.screenY()-height,width/2,height);
	}
	const bbox = sprite.mesh.getBoundingInfo().boundingBox;
	const projections = bbox.vectorsWorld.map(v=>mv3d.getScreenPosition(v));
	let minX=Graphics.width, minY=Graphics.height, maxX=0, maxY=0;
	let pointsBehindCamera=0;
	for (const projection of projections){
		if(projection.x<minX){ minX=projection.x; }
		if(projection.y<minY){ minY=projection.y; }
		if(projection.x>maxX){ maxX=projection.x; }
		if(projection.y>maxY){ maxY=projection.y; }
		if(projection.behindCamera){ ++pointsBehindCamera; }
	}
	const rect = new PIXI.Rectangle(minX,minY,maxX-minX,maxY-minY);
	rect.behindCamera = pointsBehindCamera<8;
	return rect;
};