import mv3d from '../../mv3d.js';

Object.assign(mv3d,{
	vehicleObstructed(vehicle,...args){
		return vehicleObstructed.apply(vehicle,args);
	},
	tileCollision(char,x,y,useStairThresh=false,useTargetZ=false){
		if(!(char instanceof mv3d.Character)){if(!char.mv3d_sprite){return false;}char=char.mv3d_sprite;}
		const z = typeof useTargetZ==='number'? useTargetZ
		:useTargetZ?char.targetElevation:char.z;
		const cc = char.getCollisionHeight(z);
		const tcs = this.getCollisionHeights(x,y);
		if(useStairThresh==2){ cc.z1+=mv3d.STAIR_THRESH; cc.z2+=mv3d.STAIR_THRESH; }
		for (const tc of tcs){
			if(cc.z1<tc.z2&&cc.z2>tc.z1){
				if(useStairThresh==1&&mv3d.STAIR_THRESH){ return this.tileCollision(char,x,y,2,useTargetZ); }
				return true;
			}
		}
		return false;
	},
	charCollision(char1,char2,useStairThresh=false,useTargetZ1=false,useTargetZ2=useTargetZ1,triggerMode=false){
		if(!(char1 instanceof mv3d.Character)){if(!char1.mv3d_sprite){return false;}char1=char1.mv3d_sprite;}
		if(!(char2 instanceof mv3d.Character)){if(!char2.mv3d_sprite){return false;}char2=char2.mv3d_sprite;}
		if(!triggerMode&&(!char1.char._mv3d_hasCollide()||!char2.char._mv3d_hasCollide())){ return false; } 
		const c1z = typeof useTargetZ1==='number'? useTargetZ1 : useTargetZ1?char1.targetElevation:char1.z;
		const c2z = typeof useTargetZ2==='number'? useTargetZ2 : useTargetZ2?char2.targetElevation:char2.z;
		const cc1 = char1.getCollisionHeight(c1z);
		const cc2 = triggerMode ? char2.getTriggerHeight(c2z) : char2.getCollisionHeight(c2z);
		if(useStairThresh==2){ cc1.z1+=mv3d.STAIR_THRESH; cc1.z2+=mv3d.STAIR_THRESH; }
		if(!triggerMode&&cc1.z1<cc2.z2&&cc1.z2>cc2.z1 || triggerMode&&cc1.z1<=cc2.z2&&cc1.z2>=cc2.z1){
			if(useStairThresh==1&&mv3d.STAIR_THRESH){ return this.charCollision(char1,char2,2,useTargetZ1,useTargetZ2); }
			return true;
		}
		return false;
	},
	getPlatformForCharacter(char,x,y){
		if(!(char instanceof mv3d.Character)){if(!char.mv3d_sprite){return false;}char=char.mv3d_sprite;}
		return this.getPlatformAtLocation(x,y,char.z+Math.max(char.spriteHeight,mv3d.STAIR_THRESH),char);
	},
	getPlatformAtLocation(x,y,z,char=null){
		const cs = this.getCollisionHeights(x,y);
		cs.push(...$gameMap.eventsXyNt(Math.round(x),Math.round(y))
			.filter(event=>event.mv3d_sprite&&event._mv3d_isPlatform()&&event._mv3d_hasCollide()&&event.mv3d_sprite.visible&&(!char||char.char!==event))
			.map(event=>event.mv3d_sprite.getCollisionHeight())
		);
		let closest = cs[0];
		for (const c of cs){
			if(c.z2>closest.z2&&c.z2<=z){
				closest=c;
			}
		}
		return closest;
	},

	isRampAt(x,y,z){
		const tileData = this.getTileData(x,y);
		let height = 0;
		for (let l=0;l<4;++l){
			height += this.getTileFringe(x,y,l);
			height += this.getTileHeight(x,y,l);
			const conf = this.getTileConfig(tileData[l],x,y,l);
			if(conf.shape!==this.configurationShapes.SLOPE){ continue; }
			const slopeHeight = conf.slopeHeight||1;
			if(z>=height-slopeHeight && z<=height){
				return { id:tileData[l], x,y,l,conf, z1:height-slopeHeight, z2:height };
			}
		}
		return false;
	},

	canPassRamp(d,slope){
		const {dir:sd} = mv3d.getSlopeDirection(slope.x,slope.y,slope.l,true);
		const x2 = $gameMap.roundXWithDirection(slope.x,d);
		const y2 = $gameMap.roundYWithDirection(slope.y,d);
		const slope2 = this.isRampAt(x2,y2,sd===d?slope.z1:sd===10-d?slope.z2:(slope.z1+slope.z2)/2);
		if(slope2){
			const  {dir:sd2} = mv3d.getSlopeDirection(x2,y2,slope2.l,true);
			if(sd!==d&&sd!==10-d){
				if(sd===sd2&&slope.z1===slope2.z1&&slope.z2===slope2.z2){ return true; }
				return false;
			}
			return sd===sd2 && (sd===d?(slope.z1===slope2.z2):(slope.z2===slope2.z1));
		}
		if(sd!==d&&sd!==10-d){ return false; }
		const dh = this.getPlatformAtLocation(x2,y2, (sd===d?slope.z1:slope.z2)+mv3d.STAIR_THRESH ).z2;
		return Math.abs(dh-(sd===d?slope.z1:slope.z2))<=mv3d.STAIR_THRESH;
	}
});

Game_CharacterBase.prototype._mv3d_isFlying=function(){
	return this.mv3d_sprite&&this.mv3d_sprite.blendElevation.currentValue()>0;
};
Game_Vehicle.prototype._mv3d_isFlying=function(){
	return this.isAirship()||Game_CharacterBase.prototype._mv3d_isFlying.apply(this,arguments);
};
Game_Player.prototype._mv3d_isFlying=function(){
	if(this.isInVehicle()&&this.vehicle().isAirship()){ return true; }
	return Game_CharacterBase.prototype._mv3d_isFlying.apply(this,arguments);
};

Game_CharacterBase.prototype._mv3d_isPlatform=function(){
	return this.mv3d_sprite&&this.mv3d_sprite.getConfig('platform',mv3d.WALK_ON_EVENTS);
};

Game_CharacterBase.prototype._mv3d_hasCollide=function(){
	const sprite = this.mv3d_sprite;
	if(!sprite || sprite.getConfig('collide')===false){ return false; }
	return this._mv3d_isPlatform() || Boolean(sprite.getCHeight());
};


require('./movement_vanilla.js');

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

// jump
const _charBase_jump = Game_CharacterBase.prototype.jump;
Game_CharacterBase.prototype.jump = function(xPlus, yPlus) {
	if (mv3d.isDisabled()){ return _charBase_jump.apply(this,arguments); }
	this.mv3d_jumpHeightStart = mv3d.getWalkHeight(this.x,this.y);
	this.mv3d_jumpHeightEnd = mv3d.getWalkHeight(this.x+xPlus,this.y+yPlus);
	_charBase_jump.apply(this,arguments);
};


// get on off vehicle

const _getOnVehicle = Game_Player.prototype.getOnVehicle;
Game_Player.prototype.getOnVehicle = function(){
	if(mv3d.isDisabled()){ return _getOnVehicle.apply(this,arguments); }
	var d = this.direction();
	var x1 = this.x;
    var y1 = this.y;
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

const _isLandOk = Game_Vehicle.prototype.isLandOk;
Game_Vehicle.prototype.isLandOk = function(x, y, d) {
	if(!_isLandOk.apply(this,arguments)){ return false; }
	if(mv3d.isDisabled()||!this.mv3d_sprite){ return true; }
	if (!this.isAirship()) {
		var x2 = $gameMap.roundXWithDirection(x, d);
		var y2 = $gameMap.roundYWithDirection(y, d);
		const platform = mv3d.getPlatformAtLocation(x2,y2,this.z+this.mv3d_sprite.spriteHeight);
		return Math.abs(platform.z2-this.z)<this.mv3d_sprite.spriteHeight;
	}
	return true;
};