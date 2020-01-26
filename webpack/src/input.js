import mv3d from './mv3d.js';
import { override } from './util.js';
import { Feature } from './features.js';

new Feature('input',{
	_is1stPerson:false,
	update(){
		const is1stPerson = mv3d.is1stPerson();
		if(this._is1stPerson !== is1stPerson){
			Input.clear();
			this._is1stPerson = is1stPerson;
		}
	}
});

Object.assign(Input.keyMapper,{
	81:'rotleft',  // Q
	69:'rotright', // E
	87:'up',       // W
	65:'left',     // A
	83:'down',     // S
	68:'right',    // D
});

mv3d.setupInput=function(){
	const descriptors={
		left:getInputDescriptor('left','left','rotleft'),
		rotleft:getInputDescriptor('pageup','rotleft', mv3d.KEYBOARD_STRAFE?'left':undefined),
		right:getInputDescriptor('right','right','rotright'),
		rotright:getInputDescriptor('pagedown','rotright', mv3d.KEYBOARD_STRAFE?'right':undefined),
	}
	Object.defineProperties(Input.keyMapper,{
		37:descriptors.left, // left arrow
		39:descriptors.right,// right arrow
		81:descriptors.rotleft, //Q
		69:descriptors.rotright,//E
		65:descriptors.left, //A
		68:descriptors.right,//D
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
	if (mv3d.isDisabled()){ return _getInputDirection.apply(this,arguments); }
	let dir = Input.dir4;
	return mv3d.transformDirectionYaw(dir,mv3d.blendCameraYaw.currentValue(),true);
};

const _player_updateMove = Game_Player.prototype.updateMove;
Game_Player.prototype.updateMove = function() {
	_player_updateMove.apply(this,arguments);
	if (mv3d.isDisabled()){ return; }
	if ( !this.isMoving() && mv3d.is1stPerson() ) {
		mv3d.playerFaceYaw();
	}
};
const _player_move_straight=Game_Player.prototype.moveStraight;
Game_Player.prototype.moveStraight = function(d) {
	_player_move_straight.apply(this,arguments);
	if (mv3d.isDisabled()){ return; }
	if(!this.isMovementSucceeded()&&mv3d.is1stPerson()){
		mv3d.playerFaceYaw();
	}
};

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
				
				const intersection = mv3d.scene.pick(TouchInput.x,TouchInput.y,raycastPredicate);
				if(intersection.hit){
					const point = {x:intersection.pickedPoint.x, y:-intersection.pickedPoint.z};
					const mesh = intersection.pickedMesh;
					if(mesh.character){
						point.x=mesh.character.x;
						point.y=mesh.character.y;
					}
					$gameTemp.setDestination(Math.round(point.x), Math.round(point.y));
				}

			}
			this._touchCount++;
		} else {
			this._touchCount = 0;
		}
	}
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

override(Game_Player.prototype,'direction',o=>function isDirectionFixed(){
	if(mv3d.is1stPerson() && this.isMoving() && !this.isDirectionFixed()){
		return mv3d.yawToDir();
	}else{
		return o.apply(this,arguments);
	}
});