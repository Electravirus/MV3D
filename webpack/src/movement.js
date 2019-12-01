import mv3d from './mv3d.js';

Object.assign(mv3d,{
	vehicleObstructed(vehicle,...args){
		return vehicleObstructed.apply(vehicle,args);
	}
});

const _characterBase_canPass = Game_CharacterBase.prototype.canPass
Game_CharacterBase.prototype.canPass = function(x, y, d) {
	if(!_characterBase_canPass.apply(this,arguments)){
		return false;
	}
	if (mv3d.isDisabled()){return true; }
	const x2 = $gameMap.roundXWithDirection(x, d);
	const y2 = $gameMap.roundYWithDirection(y, d);
	if(this===$gamePlayer){
		const vehicle = this.vehicle();
		if(vehicle){
			const obstructed = vehicleObstructed.call(vehicle,x2,y2,false);
			if(vehicle.isAirship()){
				return !obstructed;
			}else if(obstructed){
				return false;
			}
		}
	}
	if (this.isThrough() || this.isDebugThrough()) {
		return true;
	}
	const tileHeight1 = mv3d.getWalkHeight(x,y);
	const tileHeight2 = mv3d.getWalkHeight(x2,y2);
	if(Math.abs(tileHeight1-tileHeight2)>mv3d.STAIR_THRESH){ return false; }
	return true;
};

// vehicles

function vehicleNotObstructed(x, y, strict=true){
	if(!(this instanceof Game_Vehicle)){ throw "This isn't a vehicle."; }
	if(!this.mv3d_sprite){ return true; }
	if(!this._driving){ return true; }
	if($gamePlayer.isDebugThrough()){ return true; }
	const isAirship=this.isAirship();
	const settings = mv3d[`${this._type.toUpperCase()}_SETTINGS`];
	const big = mv3d.loadData( `${this._type}_big`, settings.big );
	let altitude = 0.5;
	if(isAirship){
		altitude = mv3d.loadData('airship_height',mv3d.AIRSHIP_SETTINGS.height);
	}else{
		altitude += mv3d.getFloatHeight(x,y);
	}
	const tileHeight = mv3d.getWalkHeight(x,y);
	let posZ = this.mv3d_sprite.z;
	if('zoff' in settings){
		posZ-=settings.zoff;
	}
	if(tileHeight>posZ){ return false; }
	if(!big){ return true; }
	for (let ox=-1;ox<=1;++ox)
	for (let oy=-1;oy<=1;++oy){
		if(ox===0&&oy===0 || !strict&&ox&&oy){ continue; }
		const tileHeight2 = mv3d.getWalkHeight(x+ox,y+oy);
		if(tileHeight2>tileHeight+altitude*!strict&&(strict||tileHeight2>posZ)){
			return false;
		}
	}
	return true;
}
function vehicleObstructed(){
	return !vehicleNotObstructed.apply(this,arguments);
}

const _airship_land_ok = Game_Map.prototype.isAirshipLandOk;
Game_Map.prototype.isAirshipLandOk = function(x, y) {
	if (mv3d.isDisabled()){ return _airship_land_ok.apply(this,arguments); }
	if(vehicleObstructed.call(this.airship(),x,y,true)){ return false; }
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
	this.vehicle().setMoveSpeed(speed);
	_player_updateVehicleGetOn.apply(this,arguments);
};

// jump
const _charBase_jump = Game_CharacterBase.prototype.jump;
Game_CharacterBase.prototype.jump = function(xPlus, yPlus) {
	if (mv3d.isDisabled()){ return _charBase_jump.apply(this,arguments); }
	this.mv3d_jumpHeightStart = mv3d.getWalkHeight(this.x,this.y);
	this.mv3d_jumpHeightEnd = mv3d.getWalkHeight(this.x+xPlus,this.y+yPlus);
	_charBase_jump.apply(this,arguments);
};