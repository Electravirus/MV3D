import mv3d from './mv3d.js';

const gameMap_parallaxOx = Game_Map.prototype.parallaxOx;
Game_Map.prototype.parallaxOx = function() {
	let ox = gameMap_parallaxOx.apply(this,arguments);
	if(this._parallaxLoopX){
		return ox - mv3d.blendCameraYaw.currentValue()*816/90;
	}
	return ox;
};
const gameMap_parallaxOy = Game_Map.prototype.parallaxOy;
Game_Map.prototype.parallaxOy = function() {
	let oy = gameMap_parallaxOy.apply(this,arguments);
	if(this._parallaxLoopY){
		return oy - mv3d.blendCameraPitch.currentValue()*816/90;
	}
    return oy;
};

Game_Map.prototype.setDisplayPos = function() { };
Game_Map.prototype.scrollUp = function() { };
Game_Map.prototype.scrollDown = function() { };
Game_Map.prototype.scrollLeft = function() { };
Game_Map.prototype.scrollRight = function() { };
Game_Map.prototype.updateScroll = function() {
    this._displayX = -mv3d.blendCameraYaw.currentValue()*816/3600;
    this._displayY = -mv3d.blendCameraPitch.currentValue()*816/3600;
};

Game_CharacterBase.prototype.isNearTheScreen = function() {
	return Math.abs(this.x - mv3d.cameraStick.position.x)<=mv3d.RENDER_DIST
	&& Math.abs(-this.y - mv3d.cameraStick.position.y)<=mv3d.RENDER_DIST;
};
