import mv3d from './mv3d.js';
import { override } from './util.js';


Object.assign(mv3d,{
	
	playerFaceYaw(){
		let dir = this.yawToDir(mv3d.blendCameraYaw.targetValue(),true);
		$gamePlayer.mv3d_setDirection(dir);
	},

	yawToDir(yaw=mv3d.blendCameraYaw.targetValue(),dir8=false){
		const divisor = dir8?45:90;
		yaw=Math.round(yaw/divisor)*divisor;
		while(yaw<0){yaw+=360;} while(yaw>=360){yaw-=360;}
		switch(yaw){
			case 0: return 8;
			case 45: return 7;
			case 90: return 4;
			case 135: return 1;
			case 180: return 2;
			case 225: return 3;
			case 270: return 6;
			case 315: return 9;
			default: return 0;
		}
	},

	dirToYaw(dir){
		switch(dir){
			case 3: return -135;
			case 6: return -90;
			case 9: return -45;
			case 8: return 0;
			case 7: return 45;
			case 4: return 90;
			case 1: return 135;
			case 2: return 180;
			default: return NaN;
		}
	},
	
	transformDirection(dir,yaw=this.blendCameraYaw.currentValue(),dir8=mv3d.DIR8MOVE){
		return mv3d.yawToDir(mv3d.dirToYaw(dir)+yaw,dir8);
	},

	transformFacing(dir,yaw=this.blendCameraYaw.currentValue(),dir8=false){
		return mv3d.yawToDir(mv3d.dirToYaw(dir)-yaw,dir8);
	},

	updateDirection(){
		if ( mv3d.is1stPerson() ) {
			mv3d.playerFaceYaw();
		}
	},
});

let _oldDir=0;
override(Game_Player.prototype,'update',o=>function update(){
	o.apply(this,arguments);
	if(this._direction!==_oldDir){
		mv3d.updateDirection();
		_oldDir=this._direction;
	}
});

override(Game_Player.prototype,'moveStraight',o=>function moveStraight(){
	o.apply(this,arguments);
	mv3d.updateDirection();
});

override(Game_Player.prototype,'direction',o=>function direction(){
	if(mv3d.is1stPerson() && this.isMoving() && !this.isDirectionFixed()){
		return mv3d.yawToDir(mv3d.blendCameraYaw.targetValue(),false);
	}else{
		return o.apply(this,arguments);
	}
});


const _setDirection=Game_CharacterBase.prototype.setDirection;
Game_CharacterBase.prototype.setDirection=function(){
	_setDirection.apply(this,arguments);
	this._mv3d_direction=this._direction;
};
Game_CharacterBase.prototype.mv3d_setDirection=function(d){
	if( this.isDirectionFixed() ){ return; }
	this._direction=mv3d.yawToDir(mv3d.dirToYaw(d),false);
	if(mv3d.DIR8MOVE){
		this._mv3d_direction=d;
	}else{
		this._mv3d_direction=this._direction;
	}
};
Game_CharacterBase.prototype.mv3d_direction=function(){
	return this._mv3d_direction||this.direction();
};

override(Game_CharacterBase.prototype,'copyPosition',o=>function(character) {
	o.apply(this,arguments);
	this._mv3d_direction = character._mv3d_direction;
});

override(Game_Player.prototype,'processMoveCommand',o=>function processMoveCommand(command){
	o.apply(this,arguments);
	const  gc = Game_Character;
	switch(command.code){
		case gc.ROUTE_TURN_DOWN:
		case gc.ROUTE_TURN_LEFT:
		case gc.ROUTE_TURN_RIGHT:
		case gc.ROUTE_TURN_UP:
		case gc.ROUTE_TURN_90D_R:
		case gc.ROUTE_TURN_90D_L:
		case gc.ROUTE_TURN_180D:
		case gc.ROUTE_TURN_90D_R_L:
		case gc.ROUTE_TURN_RANDOM:
		case gc.ROUTE_TURN_TOWARD:
		case gc.ROUTE_TURN_AWAY:
			let yaw = mv3d.dirToYaw(this._direction);
			mv3d.blendCameraYaw.setValue(yaw,0.25);
	}
},()=>!mv3d.isDisabled()&&mv3d.is1stPerson());

