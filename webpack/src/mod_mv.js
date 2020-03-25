import mv3d from './mv3d.js';
import { override } from './util.js';

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
	if(!mv3d.isDisabled()){
		mv3d.update();
	}
}

const _renderWebGL = ShaderTilemap.prototype.renderWebGL;
ShaderTilemap.prototype.renderWebGL = function(renderer) {
	if(mv3d.mapDisabled){ _renderWebGL.apply(this,arguments); }
};

const _createTilemap=Spriteset_Map.prototype.createTilemap;
Spriteset_Map.prototype.createTilemap=function(){
	_createTilemap.apply(this,arguments);
	mv3d.mapDisabled = mv3d.isDisabled();
	if(mv3d.mapDisabled){ return; }
	this._tilemap.visible=false;
	mv3d.pixiSprite=new PIXI.Sprite(mv3d.texture);
	mv3d.pixiSprite.scale.set(1/mv3d.RES_SCALE,1/mv3d.RES_SCALE);
	this._baseSprite.addChild( mv3d.pixiSprite );
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
		if($gameVariables.mv3d){ delete $gameVariables.mv3d.disabled; }
		mv3d.clearMap();
		delete $gamePlayer._mv3d_z;
	}
	_performTransfer.apply(this,arguments);
	if(mv3d.is1stPerson()){
		mv3d.blendCameraYaw.setValue(mv3d.dirToYaw($gamePlayer.direction(),0));
	}
};

// On Map Load
const _onMapLoaded=Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded=function(){
	Input.clear();
	if(mv3d.needClearMap){
		mv3d.clearMap();
		mv3d.needClearMap=false;
	}else if(mv3d.needReloadMap){
		mv3d.reloadMap();
		mv3d.needReloadMap=false;
	}
	mv3d.loadMapSettings();
	_onMapLoaded.apply(this,arguments);
	if(!mv3d.mapLoaded){
		mv3d.applyMapSettings();
		if(mv3d.isDisabled()){
			mv3d.mapReady=true;
		}else{
			mv3d.mapReady=false;
			//mv3d.mapReady=true;
			mv3d.loadMap();
		}
	}
	mv3d.updateBlenders(true);
};

// onMapLoaded > performTransfer > map setup
// hook into map setup before Qmovement's setup.
const _map_battleback_Setup = Game_Map.prototype.setupBattleback;
Game_Map.prototype.setupBattleback=function(){
	_map_battleback_Setup.apply(this,arguments);
	mv3d.loadTilesetSettings();
};

const _onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function() {
	_onLoadSuccess.apply(this,arguments);
	mv3d.needClearMap=true;
};

const _map_isReady = Scene_Map.prototype.isReady;
Scene_Map.prototype.isReady = function() {
	let ready = _map_isReady.apply(this,arguments);
	return ready && mv3d.mapReady;
};

// Title

const _title_start=Scene_Title.prototype.start;
Scene_Title.prototype.start = function() {
	_title_start.apply(this,arguments);
	mv3d.clearMap();
	mv3d.clearCameraTarget();
};

const _initGraphics = SceneManager.initGraphics;
SceneManager.initGraphics = function() {
	_initGraphics.apply(this,arguments);
	if(!Graphics.isWebGL()){
		throw new Error("MV3D requires WebGL");
	}
};

// force webgl
SceneManager.preferableRendererType = function() {
    if (Utils.isOptionValid('canvas')) {
        return 'canvas';
    } else if (Utils.isOptionValid('webgl')) {
        return 'webgl';
    } else {
		if(Graphics.hasWebGL()){ return 'webgl'; }
        return 'auto';
    }
};