import mv3d from './mv3d.js';

const _graphics_createCanvas=Graphics._createCanvas;
Graphics._createCanvas = function() {
	mv3d.setup();
	mv3d.updateCanvas();
	_graphics_createCanvas.apply(this,arguments);
};

const _graphics_updateAllElements=Graphics._updateAllElements;
Graphics._updateAllElements = function() {
	_graphics_updateAllElements.apply(this,arguments);
	mv3d.updateCanvas();
};

const _graphics_render=Graphics.render;
Graphics.render=function(){
	mv3d.render();
	_graphics_render.apply(this,arguments);
};

const _sceneMap_update=Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
	_sceneMap_update.apply(this,arguments);
	mv3d.update();
}

ShaderTilemap.prototype.renderWebGL = function(renderer) {};

const _createTilemap=Spriteset_Map.prototype.createTilemap;
Spriteset_Map.prototype.createTilemap=function(){
	_createTilemap.apply(this,arguments);
	this._tilemap.visible=false;
	this._baseSprite.addChild( new PIXI.Sprite(mv3d.texture) );
};

const _sprite_char_setchar = Sprite_Character.prototype.setCharacter;
Sprite_Character.prototype.setCharacter = function(character) {
	_sprite_char_setchar.apply(this,arguments);
	Object.defineProperty(character,'mv_sprite',{
		value:this,
		configurable:true,
	});
};

// Player Transfer

const _performTransfer=Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
	const newmap = this._newMapId !== $gameMap.mapId();
	if(newmap){
		mv3d.clearMap();
	}
	_performTransfer.apply(this,arguments);
};

// On Map Load

const _onMapLoaded=Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded=function(){
	_onMapLoaded.apply(this,arguments);
	if(!mv3d.mapLoaded){
		mv3d.loadMap();
	}
	mv3d.updateBlenders(true);
};