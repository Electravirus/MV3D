import mv3d from '../../mv3d.js';
import { override } from '../../util.js';

Object.assign(mv3d,{
	vehicleObstructed(vehicle,...args){
		return vehicleObstructed.apply(vehicle,args);
	},
	tileCollision(char,x,y,useStairThresh=false,useTargetZ=false){
		if(!(char instanceof mv3d.Character)){if(!char.mv3d_sprite){return false;}char=char.mv3d_sprite;}
		const z = typeof useTargetZ==='number'? useTargetZ
		:useTargetZ?char.getTargetElevation(x,y):char.z;
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
		const c1z = typeof useTargetZ1==='number'? useTargetZ1 : useTargetZ1?char1.getTargetElevation(char2.x,char2.y):char1.z;
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
	getPlatformFloatForCharacter(char,x,y,opts={}){
		if(!(char instanceof mv3d.Character)){if(!char.mv3d_sprite){return 0;}char=char.mv3d_sprite;}
		let z = mv3d.getPlatformForCharacter(char,x,y,opts).z2;
		if(char.hasFloat){
			const cHeight = char.getCHeight();
			z += mv3d.getFloatHeight(x,y,char.z+Math.max(cHeight,mv3d.STAIR_THRESH),mv3d.STAIR_THRESH>=cHeight);
		}
		return z;
	},
	getPlatformForCharacter(char,x,y,opts={}){
		if(!(char instanceof mv3d.Character)){if(!char.mv3d_sprite){return false;}char=char.mv3d_sprite;}
		const cHeight = char.getCHeight();
		const useStairThresh = mv3d.STAIR_THRESH>=cHeight;
		Object.assign(opts,{char:char,gte:useStairThresh});
		return this.getPlatformAtLocation(x,y,char.z+Math.max(cHeight,mv3d.STAIR_THRESH),opts);
	},
	getPlatformAtLocation(x,y,z,opts={}){
		const char = opts.char;
		const cs = this.getCollisionHeights(x,y,opts);
		cs.push(...mv3d.getEventsAt(x,y)
			.filter(event=>{
				if(!(event.mv3d_sprite&&event._mv3d_isPlatform()&&event._mv3d_hasCollide()&&event.mv3d_sprite.visible)){ return false; }
				if(char){
					if(char.char===event || event.isMoving()){ return false; }
					let pc=event.mv3d_sprite;
					while(pc=pc.platformChar){
						if(pc===char||pc===event.mv3d_sprite){ return false; }
					}
				}
				return true;
			})
			.map(event=>event.mv3d_sprite.getCollisionHeight())
		);
		let closest = cs[0];
		for (const c of cs){
			if(c.z2>closest.z2 && (opts.gte?c.z2<=z:c.z2<z) ){
				closest=c;
			}
		}
		return closest;
	},

	getEventsAt(x,y){
		return $gameMap.eventsXyNt(Math.round(x),Math.round(y));
	},

	isRampAt(x,y,z){
		const tileData = this.getTileData(x,y);
		let height = 0;
		for (let l=0;l<4;++l){
			height += this.getTileFringe(x,y,l);
			height += this.getTileHeight(x,y,l);
			const conf = this.getTileConfig(tileData[l],x,y,l);
			if(conf.shape!==this.enumShapes.SLOPE){ continue; }
			const slopeHeight = conf.slopeHeight||1;
			if(z>=height-slopeHeight && z<=height){
				return { id:tileData[l], x,y,l,conf, z1:height-slopeHeight, z2:height };
			}
		}
		return false;
	},

	getRampData(x,y,l,conf=null){
		const tileId = mv3d.getTileId(x,y,l);
		if(!conf){ conf = this.getTileConfig(tileId,x,y,l); }
		if(conf.shape!==this.enumShapes.SLOPE){ return false; }
		const height = mv3d.getStackHeight(x,y,l);
		const slopeHeight = conf.slopeHeight||1;
		return { id:tileId, x,y,l,conf, z1:height-slopeHeight, z2:height };
	},

	canPassRamp(d,slope,opts={}){
		if(d===5||d<=0||d>=10){ return true; }
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
		const dh = this.getPlatformAtLocation(x2,y2, (opts.z!=null?opts.z:sd===d?slope.z1:slope.z2)+mv3d.STAIR_THRESH ).z2;
		return Math.abs(dh-(sd===d?slope.z1:slope.z2))<=mv3d.STAIR_THRESH;
	}
});

Game_CharacterBase.prototype._mv3d_isFlying=function(){
	if(!this.mv3d_sprite){ return false;}
	return this.mv3d_sprite.blendElevation.currentValue()>0||this.mv3d_sprite.hasConfig('zlock')||!this.mv3d_sprite.getConfig('gravity',mv3d.GRAVITY);
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

if(window.Imported&&Imported.QMovement){
	require('./movement_Q.js');
}else if(PluginManager._scripts.includes("AltimitMovement")&&Game_CharacterBase.prototype.moveVector){
	require('./movement_Altimit.js');
}else{
	require('./movement_vanilla.js');
}

// jump
const _charBase_jump = Game_CharacterBase.prototype.jump;
Game_CharacterBase.prototype.jump = function(xPlus, yPlus) {
	if (mv3d.isDisabled()){ return _charBase_jump.apply(this,arguments); }
	this.mv3d_jumpHeightStart = this.z!=null?this.z:mv3d.getWalkHeight(this.x,this.y);
	this.mv3d_jumpHeightEnd = mv3d.getWalkHeight(this.x+xPlus,this.y+yPlus);
	_charBase_jump.apply(this,arguments);
};

override(Game_Map.prototype,'allTiles',o=>function(x,y){
	return this.layeredTiles(x, y);
});