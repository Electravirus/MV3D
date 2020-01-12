import mv3d from '../../mv3d.js';
import { override, unround } from '../../util.js';

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
	const chars = [$gamePlayer,...$gamePlayer.followers().visibleFollowers()]
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
		if(mv3d.canPassRamp(10-d,slope)){ return true; }
	}
	
	if(this._mv3d_isFlying()){
		if(mv3d.tileCollision(this,x2,y2,true,true)||mv3d.tileCollision(this,x2,y2,true,false)){ return false; }
	}else{
		if(mv3d.tileCollision(this,x2,y2,true,true)){ return false; }
		
		if(sprite.falling){ return false; }
		if(!mv3d.WALK_OFF_EDGE){
			let platform = mv3d.getPlatformForCharacter(this,x2,y2).z2;
			if(sprite.hasFloat){
				platform += mv3d.getFloatHeight(x2,y2,sprite.z+sprite.spriteHeight);
			}
			if(unround(Math.abs(platform-sprite.targetElevation))>mv3d.STAIR_THRESH){
				return false; 
			}
		}
	}
	return true;
};

override(Game_CharacterBase.prototype,'isMapPassable',_isMapPassable);

override(Game_Vehicle.prototype,'isMapPassable',_isMapPassable);

Game_Player.prototype.startMapEvent = function(x,y,triggers,normal){
	if ($gameMap.isEventRunning()) { return; }
	$gameMap.eventsXy(x,y)
	.filter(event=>mv3d.charCollision(this,event,false,false,false,true))
	.forEach(event=>{
		if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
			event.start();
		}
	});
};

const _checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function(x, y, bit) {
	if(!('_mv3d_collision_char' in $gameTemp)){
		return _checkPassage.apply(this,arguments);
	}
	const char = $gameTemp._mv3d_collision_char;
	const z = char.z+Math.max(char.spriteHeight,mv3d.STAIR_THRESH);
	const platform = mv3d.getPlatformForCharacter(char,x,y);
	if(platform.char){ return true; }
	var flags = this.tilesetFlags();
	//var tiles = this.allTiles(x, y);
	const layers = mv3d.getTileLayers(x,y,z);
	const tiles = mv3d.getTileData(x,y);
	for (var i = layers.length-1; i>=0; --i) {
		const l=layers[i];
		if(bit&0x0f){
			const conf = mv3d.getTileConfig(x,y,l);
			if('pass' in conf){
				//const passage = mv3d.getTilePassage(x,y,l);
				if(conf.pass===mv3d.configurationPassage.THROUGH){ continue; }
				if(conf.pass===mv3d.configurationPassage.FLOOR){ return true; }
				if(conf.pass===mv3d.configurationPassage.WALL){ return false; }
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