import mv3d from '../../mv3d.js';
import { override, unround, hvtodir, dirtoh, dirtov } from '../../util.js';

const _characterBase_canPass = Game_CharacterBase.prototype.canPass
Game_CharacterBase.prototype.canPass = function(x, y, d) {

	if(!_characterBase_canPass.apply(this,arguments)){
		return false;
	}
	if (mv3d.isDisabled()||this.isDebugThrough()||this.isThrough()){return true; }

	return true;
};

function charCollidesWithChars(char1,charlist,x,y){
	return charlist.some(char2=>{
		const isPlatform = char2._mv3d_isPlatform();
		if(mv3d.WALK_OFF_EDGE&&!isPlatform){
			const platformHeight = mv3d.getPlatformForCharacter(char1,x,y).z2;
			if(mv3d.charCollision(char1,char2,false,platformHeight)){ return true; }
		}
		return mv3d.charCollision(char1,char2,isPlatform,true);
	});
}

const _isCollidedWithEvents=o=>function(x,y){
	return charCollidesWithChars(this,$gameMap.eventsXyNt(x,y),x,y);
};

override(Game_CharacterBase.prototype,'isCollidedWithEvents',_isCollidedWithEvents);

override(Game_Event.prototype,'isCollidedWithEvents',_isCollidedWithEvents);

override(Game_Event.prototype,'isCollidedWithPlayerCharacters',o=>function(x,y){
	if($gamePlayer.isThrough()){ return false; }
	const chars = [$gamePlayer,...$gamePlayer.followers()._data.filter(f=>f.isVisible()&&f.mv3d_sprite&&f.mv3d_sprite.visible)]
	.filter(char=>char.pos(x,y));
	return charCollidesWithChars(this,chars,x,y);
});

override(Game_CharacterBase.prototype,'isCollidedWithVehicles',o=>function(x,y){
	const boat=$gameMap.boat(), ship=$gameMap.ship();
	return boat.posNt(x,y)&&mv3d.charCollision(this,boat,boat._mv3d_isPlatform(),true) || ship.posNt(x,y)&&mv3d.charCollision(this,ship,ship._mv3d_isPlatform(),true);
});

const _isMapPassable=o=>function(x,y,d){
	const sprite = this.mv3d_sprite;
	if(!sprite){ return o.apply(this,arguments); }

	$gameTemp._mv3d_collision_char = sprite;
	let collided = !o.apply(this,arguments);
	delete $gameTemp._mv3d_collision_char;
	if(collided){ return false; }


	let slope;
	if(slope=mv3d.isRampAt(x,y,sprite.z)){
		if(mv3d.canPassRamp(d,slope)){ return true; }
	}

	var x2 = $gameMap.roundXWithDirection(x, d);
	var y2 = $gameMap.roundYWithDirection(y, d);
	
	if(slope=mv3d.isRampAt(x2,y2,sprite.z)){
		if(mv3d.canPassRamp(10-d,slope,{z:sprite.z})){ return true; }
	}
	
	if(this._mv3d_isFlying()){
		if(!mv3d.allowGlide&&mv3d.tileCollision(this,x2,y2,true,sprite.targetElevation)||mv3d.tileCollision(this,x2,y2,true,false)){ return false; }
	}else{
		if(mv3d.tileCollision(this,x2,y2,true,false)){ return false; }
		
		if(sprite.falling){ return false; }
		if(!mv3d.WALK_OFF_EDGE){
			const platformz = mv3d.getPlatformFloatForCharacter(this,x2,y2);
			if(unround(Math.abs(platformz-sprite.targetElevation))>mv3d.STAIR_THRESH){
				return false; 
			}
		}
	}
	return true;
};

override(Game_CharacterBase.prototype,'isMapPassable',_isMapPassable);

override(Game_Vehicle.prototype,'isMapPassable',_isMapPassable);

override(Game_Player.prototype,'startMapEvent',o=>function(x,y,triggers,normal){
	if ($gameMap.isEventRunning()) { return; }
	$gameMap.eventsXy(x,y)
	.filter(event=>mv3d.charCollision(this,event,false,false,false,true))
	.forEach(event=>{
		if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
			event.start();
		}
	});
});

const _checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function(x, y, bit) {
	if(!('_mv3d_collision_char' in $gameTemp)){
		return _checkPassage.apply(this,arguments);
	}
	const char = $gameTemp._mv3d_collision_char;
	const cHeight = char.getCHeight();
	const z = char.z+Math.max(cHeight,mv3d.STAIR_THRESH);
	const platform = mv3d.getPlatformForCharacter(char,x,y);
	if(platform.char){ return true; }
	var flags = this.tilesetFlags();
	//var tiles = this.allTiles(x, y);
	const layers = mv3d.getTileLayers(x,y,z,mv3d.STAIR_THRESH>=cHeight);
	const tiles = mv3d.getTileData(x,y);
	for (var i = layers.length-1; i>=0; --i) {
		const l=layers[i];
		if(bit&0x0f){
			const conf = mv3d.getTileConfig(x,y,l);
			if('pass' in conf){
				//const passage = mv3d.getTilePassage(x,y,l);
				if(conf.pass===mv3d.enumPassage.THROUGH){ continue; }
				if(conf.pass===mv3d.enumPassage.FLOOR){ return true; }
				if(conf.pass===mv3d.enumPassage.WALL){ return false; }
			}
		}
		const flag = flags[tiles[l]];
		if ((flag & 0x10) !== 0)  // [*] No effect on passage
			continue;
		if ((flag & bit) === 0)   // [o] Passable
			return true;
		if ((flag & bit) === bit) // [x] Impassable
			return false;
	}
    return false;
};

const _dir8Condition=()=> !mv3d.isDisabled() || mv3d.DIR8MOVE&&mv3d.DIR8_2D;

override(Game_Player.prototype,'moveStraight',o=>function(d){
	if(!mv3d.DIR8MOVE){ return o.apply(this,arguments); }
	switch(d){
		case 1: this.moveDiagonally(4, 2); break;
		case 3: this.moveDiagonally(6, 2); break;
		case 7: this.moveDiagonally(4, 8); break;
		case 9: this.moveDiagonally(6, 8); break;
		default: o.apply(this,arguments);
	}
	
},_dir8Condition);

override(Game_Character.prototype,'moveDiagonally',o=>function(h,v){
	o.apply(this,arguments);

	let adjustDirection=false;

	if(this.isMovementSucceeded()){
		adjustDirection=true;
	}else if(mv3d.DIR8SMART && !this.isDebugThrough()){
		this.moveStraight(h);
		if(!this.isMovementSucceeded()){
			this.moveStraight(v);
			if(!this.isMovementSucceeded()){
				adjustDirection=true;
			}
		}
	}else{ adjustDirection=true; }

	if(adjustDirection){
		const d = hvtodir(h,v);
		this.mv3d_setDirection(d);
	}

},_dir8Condition);

override(Game_CharacterBase.prototype,'canPassDiagonally',o=>function(x,y,horz,vert){
	if(this.isDebugThrough()){ return true; }
    const x2 = $gameMap.roundXWithDirection(x, horz);
	const y2 = $gameMap.roundYWithDirection(y, vert);
	if(mv3d.tileCollision(this,x,y2,true,false)||mv3d.tileCollision(this,x2,y,true,false)){
		return false;
	}
	return o.apply(this,arguments);
});

const _dontSnapRealXY=o=>function(){
	const realX=this._realX, realY=this._realY;
	o.apply(this,arguments);
	if(Math.abs(realX-this._realX)>2||Math.abs(realY-this._realY)>2){ return;}
	this._realX=realX; this._realY=realY;
};
override(Game_Follower.prototype,'moveDiagonally',_dontSnapRealXY,_dir8Condition);
override(Game_Follower.prototype,'moveStraight',_dontSnapRealXY,_dir8Condition);

override(Game_CharacterBase.prototype,'distancePerFrame',o=>function(){
	const dist = o.apply(this,arguments);
	if(this._mv3d_direction%2){
		return dist * Math.SQRT1_2;
	}
	return dist;
},_dir8Condition);

// triggering

override(Game_Player.prototype,'checkEventTriggerThere',o=>function(triggers){
	if (!this.canStartLocalEvents()) { return; }
	const dir = this.mv3d_direction();
	if(dir%2===0){ return o.apply(this,arguments); }
	const horz = dirtoh(dir),vert = dirtov(dir);
	const x2 = $gameMap.roundXWithDirection(this.x, horz);
	const y2 = $gameMap.roundYWithDirection(this.y, vert);
	this.startMapEvent(x2, y2, triggers, true);
	if(!$gameMap.isAnyEventStarting()){
		return o.apply(this,arguments);
	}
},_dir8Condition);


// VEHICLES

const _airship_land_ok = Game_Map.prototype.isAirshipLandOk;
Game_Map.prototype.isAirshipLandOk = function(x, y) {
	if (mv3d.isDisabled()){ return _airship_land_ok.apply(this,arguments); }
	if(mv3d.AIRSHIP_SETTINGS.bushLanding){
		return this.checkPassage(x, y, 0x0f);
	}else{
		return _airship_land_ok.apply(this,arguments);
	}

};

const _player_updateVehicleGetOn = Game_Player.prototype.updateVehicleGetOn;
Game_Player.prototype.updateVehicleGetOn = function() {
	if (mv3d.isDisabled()){ return _player_updateVehicleGetOn.apply(this,arguments); }
	const vehicle = this.vehicle();
	const speed = mv3d.loadData(`${vehicle._type}_speed`,vehicle._moveSpeed);
	vehicle.setMoveSpeed(speed);
	_player_updateVehicleGetOn.apply(this,arguments);
	this.setThrough(false);
};

// get on off vehicle

const _getOnVehicle = Game_Player.prototype.getOnVehicle;
Game_Player.prototype.getOnVehicle = function(){
	if(mv3d.isDisabled()){ return _getOnVehicle.apply(this,arguments); }
	var d = this.direction();
	var x1 = Math.round(this.x);
    var y1 = Math.round(this.y);
    var x2 = $gameMap.roundXWithDirection(x1,d);
	var y2 = $gameMap.roundYWithDirection(y1,d);
	
	if($gameMap.airship().pos(x1,y1) && mv3d.charCollision(this,$gameMap.airship(),false,false,false,true)){
		this._vehicleType = 'airship';
	}else if($gameMap.ship().pos(x2,y2) && mv3d.charCollision(this,$gameMap.ship())) {
		this._vehicleType = 'ship';
	}else if($gameMap.boat().pos(x2,y2) && mv3d.charCollision(this,$gameMap.boat())) {
		this._vehicleType = 'boat';
	}
	if (this.isInVehicle()) {
		this._vehicleGettingOn = true;
		if (!this.isInAirship()) {
			this.forceMoveForward();
		}
		this.gatherFollowers();
	}
	return this._vehicleGettingOn;
};


override(Game_Vehicle.prototype,'isLandOk',o=>function(x,y,d){
	$gameTemp._mv3d_collision_char = $gamePlayer.mv3d_sprite;
	let landOk = o.apply(this,arguments);
	delete $gameTemp._mv3d_collision_char;
	if (this.isAirship()) { return landOk; }
	var x2 = $gameMap.roundXWithDirection(x, d);
	var y2 = $gameMap.roundYWithDirection(y, d);
	const platform = mv3d.getPlatformForCharacter($gamePlayer,x2,y2);
	if(platform.char){ landOk=true; }
	const diff = Math.abs(platform.z2-this.z);
	return landOk && diff<Math.max($gamePlayer.mv3d_sprite.getCHeight(),this.mv3d_sprite.getCHeight());
});