import mv3d from './mv3d.js';
import { override, throttle } from './util.js';
import { Feature } from './features.js';


Object.assign(mv3d,{
	updateInput(){
		mv3d.updateInputCamera();
	},

	updateInputCamera(){
		if(this.isDisabled()||this.loadData('cameraLocked')||!$gamePlayer.canMove()){ return; }
		const is1stPerson = this.is1stPerson();
		if( this.loadData('allowRotation',mv3d.KEYBOARD_TURN) || is1stPerson ){
			const leftKey=mv3d.getTurnKey('left'), rightKey=mv3d.getTurnKey('right');
			if(mv3d.TURN_INCREMENT>1){
				const turning = this.blendCameraYaw.currentValue()!==this.blendCameraYaw.targetValue();
				const yawSpeed = mv3d.TURN_INCREMENT / mv3d.YAW_SPEED;
				if(Input.isTriggered(leftKey)||Input.isPressed(leftKey)&&!turning){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+mv3d.TURN_INCREMENT,yawSpeed,false);
				}else if(Input.isTriggered(rightKey)||Input.isPressed(rightKey)&&!turning){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-mv3d.TURN_INCREMENT,yawSpeed,false);
				}
			}else{
				const increment = mv3d.YAW_SPEED / 60;
				if(Input.isPressed(leftKey)&&Input.isPressed(rightKey)){
					// do nothing
				}else if(Input.isPressed(leftKey)){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+increment,0.1);
				}else if(Input.isPressed(rightKey)){
					this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-increment,0.1);
				}
			}
		}
		if( this.loadData('allowPitch',mv3d.KEYBOARD_PITCH) ){
			const increment = mv3d.PITCH_SPEED / 60;
			if(Input.isPressed('pageup')&&Input.isPressed('pagedown')){
				// do nothing
			}else if(Input.isPressed('pageup')){
				this.blendCameraPitch.setValue(Math.min(179,this.blendCameraPitch.targetValue()+increment),0.1);
			}else if(Input.isPressed('pagedown')){
				this.blendCameraPitch.setValue(Math.max(1,this.blendCameraPitch.targetValue()-increment),0.1);
			}
		}
	},

	getStrafeKey(keyname){
		if(mv3d.is1stPerson()){
			switch(mv3d.KEYBOARD_STRAFE){
				case 'QE': return 'rot'+keyname;
				case 'AD': return keyname;
				default: return false;
			}
		}else{
			switch(mv3d.KEYBOARD_TURN){
				case 'QE': return keyname;
				case 'AD': return 'rot'+keyname;
				default: return keyname;
			}
		}
	},

	getTurnKey(keyname){
		if(mv3d.is1stPerson()){
			switch(mv3d.KEYBOARD_STRAFE){
				case 'QE': return keyname;
				case 'AD': return 'rot'+keyname;
				default: return keyname;
			}
		}else{
			switch(mv3d.KEYBOARD_TURN){
				case 'QE': return 'rot'+keyname;
				case 'AD': return keyname;
				default: return 'rot'+keyname;
			}
		}
	},
});

override(Input,'_signX',o=>function _signX(){
	if(!mv3d.KEYBOARD_STRAFE && mv3d.is1stPerson()){ return 0; }
	const leftKey=mv3d.getStrafeKey('left'), rightKey=mv3d.getStrafeKey('right');

	let x = 0;
	if (this.isPressed(leftKey)) { --x; }
	if (this.isPressed(rightKey)) { ++x; }
	return x;
});

mv3d.setupInput=function(){
	if(!mv3d.WASD){ return; }
	Object.assign(Input.keyMapper,{
		81:'rotleft',  // Q
		69:'rotright', // E
		87:'up',       // W
		65:'left',     // A
		83:'down',     // S
		68:'right',    // D
	});
	const descriptors={
		rotleft:getInputDescriptor('pageup','rotleft', 'rotleft'),
		rotright:getInputDescriptor('pagedown','rotright', 'rotright'),
	}
	Object.defineProperties(Input.keyMapper,{
		81:descriptors.rotleft, //Q
		69:descriptors.rotright,//E
	});
}

function getInputDescriptor(menumode,p3mode,p1mode){
	let assignedValue=undefined;
	return {
		configurable:true,
		get(){
			if(assignedValue!=undefined){ return assignedValue; }
			if(!(SceneManager._scene instanceof Scene_Map)){ return menumode; }
			if(mv3d.isDisabled()){ return p3mode; }
			if(mv3d.is1stPerson()){ return p1mode; }
			return p3mode;
		},
		set(v){ assignedValue=v; },
	};
}

const _getInputDirection = Game_Player.prototype.getInputDirection;
Game_Player.prototype.getInputDirection = function() {
	if (mv3d.isDisabled()){ 
		if(mv3d.DIR8MOVE && mv3d.DIR8_2D) { return Input.dir8; }
		return _getInputDirection.apply(this,arguments);
	 }
	return mv3d.getInputDirection();
};

mv3d.getInputDirection=function(){
	let dir = mv3d.DIR8MOVE ? Input.dir8 : Input.dir4;
	return mv3d.transformDirection(dir,mv3d.blendCameraYaw.currentValue());
}

const raycastPredicate=mesh=>{
	if(!mesh.isEnabled() || !mesh.isVisible || !mesh.isPickable){ return false; }
	if(mesh.character){
		if(mesh.character.isFollower||mesh.character.isPlayer){ return false; }
	}
	return true;
}

const _process_map_touch = Scene_Map.prototype.processMapTouch;
Scene_Map.prototype.processMapTouch = function() {
	if (mv3d.isDisabled()){ return _process_map_touch.apply(this,arguments); }
	if (TouchInput.isTriggered() || this._touchCount > 0) {
		if (TouchInput.isPressed()) {
			if (this._touchCount === 0 || this._touchCount >= 15) {
				
				mv3d.processMapTouch();

			}
			this._touchCount++;
		} else {
			this._touchCount = 0;
		}
	}
};

mv3d.processMapTouch=throttle(function(){
	const intersection = mv3d.scene.pick(TouchInput.x*mv3d.RES_SCALE,TouchInput.y*mv3d.RES_SCALE,raycastPredicate);
	if(intersection.hit){
		const point = {x:intersection.pickedPoint.x, y:-intersection.pickedPoint.z};
		const mesh = intersection.pickedMesh;
		if(mesh.character){
			point.x=mesh.character.x;
			point.y=mesh.character.y;
		}
		mv3d.setDestination(point.x,point.y);
	}
},100);

mv3d.setDestination=function(x,y){
	$gameTemp.setDestination(Math.round(x), Math.round(y));
};

const _player_findDirectionTo=Game_Player.prototype.findDirectionTo;
Game_Player.prototype.findDirectionTo=function(){
	const dir = _player_findDirectionTo.apply(this,arguments);
	if(mv3d.isDisabled()){ return dir; }
	if(mv3d.is1stPerson() && dir){
		let yaw = mv3d.dirToYaw(dir);

		mv3d.blendCameraYaw.setValue(yaw,0.25);
	}
	return dir;
}





