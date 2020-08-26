import mv3d from './mv3d.js';
import { override, throttle } from './util.js';
import { Feature } from './features.js';

mv3d._gamepadStick={
	x:0,
	y:0,
};


mv3d._touchState={
	lastX:0,
	lastY:0,
	isTouching:false,
};

override(Input, '_pollGamepads',o=>function(gamepad){
	mv3d._gamepadStick.x=0;
	mv3d._gamepadStick.y=0;
	o.apply(this,arguments);
},true);

override(Input, '_updateGamepadState',o=>function(gamepad){
	o.apply(this,arguments);
	const threshold = 0.1;
	const max = 1 - threshold;
	const axes = gamepad.axes;
	if (Math.abs(axes[2]) > threshold) {
		mv3d._gamepadStick.x -= ( axes[2] - Math.sign(axes[2])*threshold ) / max;
    }
    if (Math.abs(axes[3]) > threshold) {
        mv3d._gamepadStick.y -= ( axes[3] - Math.sign(axes[2])*threshold ) / max;
    }
});

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

		if(mv3d.inputCameraGamepad){
			if(mv3d._gamepadStick.x){
				const increment = mv3d.YAW_SPEED / 60 * mv3d.lookSensitivity;
				this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()+mv3d._gamepadStick.x*increment,0.1);
			}
			if(mv3d._gamepadStick.y){
				const increment = mv3d.PITCH_SPEED / 60 * mv3d.lookSensitivity;
				this.blendCameraPitch.setValue(this.blendCameraPitch.targetValue()+mv3d._gamepadStick.y*increment*(mv3d.invertY*-2+1),0.1);
			}
		}

		if(mv3d.inputCameraMouse){
			mv3d._touchState.isTapped = !TouchInput._screenPressed && mv3d._touchState.touchCount>0 && mv3d._touchState.touchCount<15 && Math.abs(mv3d._touchState.deltaX)<5 && Math.abs(mv3d._touchState.deltaY)<5;
			if(TouchInput._screenPressed){
				if(mv3d._touchState.isTouching){
					mv3d._touchState.deltaX=TouchInput.x-mv3d._touchState.lastX;
					mv3d._touchState.deltaY=TouchInput.y-mv3d._touchState.lastY;
					if(mv3d._touchState.deltaX){
						const increment = mv3d._touchState.deltaX / Graphics.width * 180;
						this.blendCameraYaw.setValue(this.blendCameraYaw.targetValue()-increment*mv3d.lookSensitivity,0.1);
					}
					if(mv3d._touchState.deltaY){
						const increment = mv3d._touchState.deltaY / Graphics.width * 180;
						this.blendCameraPitch.setValue(this.blendCameraPitch.targetValue()-increment*mv3d.lookSensitivity*(mv3d.invertY*-2+1),0.1);
					}
					++mv3d._touchState.touchCount;
				}else{
					mv3d._touchState.isTouching=true;
				}
			}else{
				mv3d._touchState.isTouching=false;
				mv3d._touchState.touchCount=0;
			}
			mv3d._touchState.lastX=TouchInput.x;
			mv3d._touchState.lastY=TouchInput.y;
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

	if(mv3d.GAMEPAD_TURN_BUTTON){
		Object.assign(Input.gamepadMapper,mv3d.GAMEPAD_TURN_BUTTON===1?{
			4: 'rotleft',   // LB
			5: 'rotright',  // RB
			6: 'pageup',    // LT
			7: 'pagedown',  // RT
		}:{
			4: 'pageup',    // LB
			5: 'pagedown',  // RB
			6: 'rotleft',   // LT
			7: 'rotright',  // RT
		});
	}
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
		
		if(mv3d.inputCameraMouse && !mv3d._touchState.isTapped){
			Graphics._canvas.requestPointerLock();
			this._touchCount++;
			return;
		}

		if (TouchInput.isPressed() || mv3d._touchState.isTapped) {
			
			if (this._touchCount === 0 || this._touchCount >= 15 || mv3d._touchState.isTapped) {
				
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

override(TouchInput,'_onMouseMove',o=>function(e){
	if(e.movementX){
		const increment = e.movementX / Graphics.width * 180 * mv3d.lookSensitivity;
		mv3d.blendCameraYaw.setValue(mv3d.blendCameraYaw.targetValue()-increment,0.1,false);
	}
	if(e.movementY){
		const increment = e.movementY / Graphics.width * 180 * mv3d.lookSensitivity;
		mv3d.blendCameraPitch.setValue(mv3d.blendCameraPitch.targetValue()-increment*(mv3d.invertY*-2+1),0.1,false);
	}
},()=> !mv3d.isDisabled() && mv3d.inputCameraMouse && document.pointerLockElement && mv3d.blendCameraYaw );

override(Scene_Map.prototype,'isMapTouchOk',o=>function(){
	const isOk = o.apply(this,arguments);
	if(!isOk||!mv3d.inputCameraMouse){
		document.exitPointerLock();
	}
	return isOk;
},true);

override(Scene_Map.prototype,'stop',o=>function(){
	o.apply(this,arguments);
	document.exitPointerLock();
},true);

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





