import mv3d from '../../mv3d.js';
import { override, unround, degtorad, cos, sin, pointtodeg } from "../../util";

override(Game_Player.prototype,'moveByInput',o=>function(){
	$gameTemp._mv3d_altimit_moveByInput=true;
	o.apply(this,arguments);
	$gameTemp._mv3d_altimit_moveByInput=false;
});

mv3d.getInputDirection=function(){
	let dir = mv3d.DIR8MOVE ? Input.dir8 : Input.dir4;
	return dir;
};

override(Game_Player.prototype,'moveVector',o=>function(vx,vy){
	if($gameTemp._mv3d_altimit_moveByInput && !this._touchTarget){
		const _vx=vx,_vy=vy;
		const yaw = degtorad(mv3d.blendCameraYaw.currentValue());
		vx=cos(yaw)*_vx + sin(yaw)*_vy;
		vy=-sin(yaw)*_vx + cos(yaw)*_vy;
		//console.log(_vx,_vy,vx,vy);
	}
	if(this.mv3d_sprite && this.mv3d_sprite.platform && this.mv3d_sprite.platform.isSlope){
		if(Math.abs(vx)>Math.abs(vy)){ 
			vx=Math.round(this._x)-this._x+Math.sign(vx);
			vy=Math.round(this._y)-this._y;
		}else{
			vx=Math.round(this._x)-this._x;
			vy=Math.round(this._y)-this._y+Math.sign(vy);
		}
		if($gamePlayer._touchTarget){
			$gamePlayer._touchTarget.x=Math.round($gamePlayer._touchTarget.x);
			$gamePlayer._touchTarget.y=Math.round($gamePlayer._touchTarget.y);
		}
	}
	
	o.call(this,vx,vy);
});

override(Game_CharacterBase.prototype,'setDirectionVector',o=>function(vx,vy){
	this.mv3d_setDirection(mv3d.yawToDir(pointtodeg(vx,vy),true));
});

override(Game_CharacterBase.prototype,'moveVectorMap',o=>function(owner, collider, bboxTests, move, vx, vy){
	o.apply(this,arguments);
	const sprite = owner.mv3d_sprite;
	if(!sprite){ return; }

	const x = Math.floor(owner.x+collider.x);
	const y = Math.floor(owner.y+collider.y);
	const x1=Math.floor(owner.x+move.x+collider.aabbox.left), x2=Math.ceil(owner.x+move.x+collider.aabbox.right);
	const y1=Math.floor(owner.y+move.y+collider.aabbox.top), y2=Math.ceil(owner.y+move.y+collider.aabbox.bottom);
	
	//const d = Input._makeNumpadDirection(Math.sign(move.x),Math.sign(move.y));
	//const d = this.direction();

	for (let tx = x1; tx < x2; ++tx)
	for (let ty = y1; ty < y2; ++ty){
		const d = Input._makeNumpadDirection(Math.sign(tx-x),Math.sign(ty-y));
		//if(tx===x&&ty===y){continue;}
		let slope;
		let realign = false;
		if(slope=mv3d.isRampAt(tx,ty,sprite.z)){
			if(mv3d.canPassRamp(10-d,slope,{z:sprite.z})){ continue; }
		}
		const tx2 = $gameMap.roundXWithDirection(tx, 10-d);
		const ty2 = $gameMap.roundYWithDirection(ty, 10-d);
		if(slope=mv3d.isRampAt(tx2,ty2,sprite.z)){
			if(mv3d.canPassRamp(d,slope)){ continue; }
		}

		let collided = false;
		if(this._mv3d_isFlying()){
			if(!mv3d.allowGlide&&mv3d.tileCollision(this,tx,ty,true,true)||mv3d.tileCollision(this,tx,ty,true,false)){ collided=true; }
		}else{
			if(sprite.falling){ collided=true; }
			else if(mv3d.tileCollision(this,tx,ty,true,true)){ collided=true; }
			else if(!mv3d.WALK_OFF_EDGE){
				const platformz = mv3d.getPlatformFloatForCharacter(this,tx,ty);
				if(unround(Math.abs(platformz-sprite.targetElevation))>mv3d.STAIR_THRESH){
					collided=true;
				}
			}
		}
		if(collided){
			if(tx!==x){ move.x=0; }
			if(ty!==y){ move.y=0; }
		}
	}
});

override(Game_CharacterBase.prototype,'moveVectorCharacters',o=>function(owner, collider, characters, loopMap, move){
	const spr1=this.mv3d_sprite; if(!spr1){ return o.apply(this,arguments); }
	const zcol1=spr1.getCollisionHeight();
	characters=characters.filter(character=>{
		const spr2 = character.mv3d_sprite; if(!spr2){ return true; }
		const zcol2=spr2.getCollisionHeight();
		return zcol1.z1<zcol2.z2&&zcol1.z2>zcol2.z1;
	});
	return o.call(this,owner,collider,characters,loopMap,move);
});

mv3d.Character.prototype.getPlatform=function(x=this.char._realX,y=this.char._realY,opts={}){
	const collider = this.char.collider();
	if(collider.type===0){
		x+=collider.x-0.5; y+=collider.y-0.5;
		const r = collider.radius*0.95;
		
		const platform = [
			mv3d.getPlatformForCharacter(this,x,y),
			mv3d.getPlatformForCharacter(this,x,y-r,opts),
			mv3d.getPlatformForCharacter(this,x-r,y,opts),
			mv3d.getPlatformForCharacter(this,x,y+r,opts),
			mv3d.getPlatformForCharacter(this,x+r,y,opts),
		]
		const diagPlatforms = [
			-Infinity,
			mv3d.getPlatformForCharacter(this,x-r*Math.SQRT1_2,y-r*Math.SQRT1_2,opts),
			mv3d.getPlatformForCharacter(this,x-r*Math.SQRT1_2,y+r*Math.SQRT1_2,opts),
			mv3d.getPlatformForCharacter(this,x+r*Math.SQRT1_2,y+r*Math.SQRT1_2,opts),
			mv3d.getPlatformForCharacter(this,x+r*Math.SQRT1_2,y-r*Math.SQRT1_2,opts),
		].filter(c=>c.z2<=this.z);
		return platform.concat(diagPlatforms).reduce((a,b)=>a.z2>=b.z2?a:b);
	}else{
		x-=0.5; y-=0.5;
		const b = {
			l:collider.aabbox.left*0.99,
			r:collider.aabbox.right*0.99,
			t:collider.aabbox.top*0.99,
			b:collider.aabbox.bottom*0.99,
		};
		const platform = [
			mv3d.getPlatformForCharacter(this,x,y),
			mv3d.getPlatformForCharacter(this,x+b.l,y+b.t,opts),
			mv3d.getPlatformForCharacter(this,x+b.l,y+b.b,opts),
			mv3d.getPlatformForCharacter(this,x+b.r,y+b.t,opts),
			mv3d.getPlatformForCharacter(this,x+b.r,y+b.b,opts),
		].reduce((a,b)=>a.z2>=b.z2?a:b);
		return platform;
	}
};

mv3d.getEventsAt=function(x,y){
	x=Math.round(x); y=Math.round(y);
	return $gameMap.events().filter( character=>{
		if(character.isThrough()){ return false; }
		const {x:cx,y:cy}=character;
		const {left,right,top,bottom}=character.collider().aabbox;
		return cx+left<x+1 && cx+right>x && cy+top<y+1 && cy+bottom>y;
	  } );
};

// give followers through if they fall behind
/*
const _FOLLOWER_THROUGH_THRESH=3;
override(Game_Follower.prototype,'isThrough',o=>function(){
	const precedingCharacter = (this._memberIndex > 1 ? $gamePlayer._followers._data[this._memberIndex - 2] : $gamePlayer);
	if(Math.abs(precedingCharacter.x-this.x)+Math.abs(precedingCharacter.y-this.y)>_FOLLOWER_THROUGH_THRESH){ return true; }
	return o.apply(this,arguments);
});
*/

function zCollidersOverlap(s1,s2){
	s1=s1.getCollisionHeight(); s2=s2.getCollisionHeight();
	if(s1.z1===s1.z2||s2.z1===s2.z2){ return s1.z1<=s2.z2&&s1.z2>=s2.z1 }
	return s1.z1<s2.z2&&s1.z2>s2.z1;
}

override(Game_Map.prototype,'events',o=>function(){
	const events = o.apply(this,arguments);
	if(!$gameTemp._mv3d_altimit_eventsHeightFilter){ return events; }
	delete $gameTemp._mv3d_altimit_eventsHeightFilter;
	const player=$gamePlayer.mv3d_sprite;
	if(!player){ return events; }
	return events.filter(e=>{
		const sprite = e.mv3d_sprite;
		if(!sprite){ return true; }
		return zCollidersOverlap(sprite,player);
	});
});

override(Game_Event.prototype,'checkEventTriggerTouch',o=>function(){
	const sprite = this.mv3d_sprite, player=$gamePlayer.mv3d_sprite;
	if(sprite&&player){
		if(!zCollidersOverlap(sprite,player)){ return false; }
	}
	return o.apply(this,arguments);
});

const _eventsHeightFilter=o=>function(){
	$gameTemp._mv3d_altimit_eventsHeightFilter=true;
	return o.apply(this,arguments);
};
override(Game_Player.prototype,'checkEventTriggerHere',_eventsHeightFilter);
override(Game_Player.prototype,'checkEventTriggerThere',_eventsHeightFilter);