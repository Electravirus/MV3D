import mv3d from './mv3d.js';
import { hexNumber, ZAxis, XAxis } from "./util.js";
import parameters from './parameters.js';
import { ORTHOGRAPHIC_CAMERA, LOCALSPACE } from './mod_babylon.js';

Object.assign(mv3d,{

	cameraTargets:[],
	getCameraTarget(){
		return this.cameraTargets[0];
	},
	setCameraTarget(char,time){
		if(!char){ this.cameraTargets.length=0; return; }
		this.cameraTargets.unshift(char);
		if(this.cameraTargets.length>2){ this.cameraTargets.length=2; }
		this.saveData('cameraTarget',this.getTargetString(char));
		this.blendCameraTransition.value=1;
		this.blendCameraTransition.setValue(0,time);
	},
	clearCameraTarget(){
		this.cameraTargets.length=0;
	},
	resetCameraTarget(){
		this.clearCameraTarget();
		this.setCameraTarget($gamePlayer,0);
	},
	rememberCameraTarget(){
		const target = this.loadData('cameraTarget');
		if(target){
			this.setCameraTarget(this.targetChar(target),0);
		}
	},

	setupBlenders(){
		this.blendFogColor = new ColorBlender('fogColor',this.FOG_COLOR);
		this.blendFogNear = new Blender('fogNear',this.FOG_NEAR);
		this.blendFogFar = new Blender('fogFar',this.FOG_FAR);
		this.blendCameraRoll = new Blender('cameraRoll',0);
		this.blendCameraRoll.cycle=360;
		this.blendCameraYaw = new Blender('cameraYaw',0);
		this.blendCameraYaw.cycle=360;
		this.blendCameraPitch = new Blender('cameraPitch',60);
		this.blendCameraPitch.min=0;
		this.blendCameraPitch.max=180;
		this.blendCameraDist = new Blender('cameraDist',10);
		this.blendCameraDist.min=0;
		this.blendCameraHeight = new Blender('cameraHeight',0.7);
		this.blendAmbientColor = new ColorBlender('ambientColor',this.AMBIENT_COLOR);
		this.blendPanX = new Blender('panX',0);
		this.blendPanY = new Blender('panY',0);
		this.blendCameraTransition = new Blender('cameraTransition',0);
	},

    updateBlenders(reorient){
		this.updateCameraMode();
		// camera target & pan
		if(!this.cameraTargets.length){
			if($gamePlayer){
				this.cameraTargets[0]=$gamePlayer;
			}
		}
		if(this.blendCameraTransition.update() && this.cameraTargets.length>=2){
			const t = this.blendCameraTransition.currentValue();
			let char1=this.cameraTargets[0];
			//if(char1===$gamePlayer&&$gamePlayer.isInVehicle()){ char1=$gamePlayer.vehicle(); }
			let char2=this.cameraTargets[1];
			//if(char2===$gamePlayer&&$gamePlayer.isInVehicle()){ char2=$gamePlayer.vehicle(); }
			this.cameraStick.x = char1._realX*(1-t) + char2._realX*t;
			this.cameraStick.y = char1._realY*(1-t) + char2._realY*t;
			if(char1.mv3d_sprite&&char2.mv3d_sprite){
				this.cameraStick.z = char1.mv3d_sprite.z*(1-t) + char2.mv3d_sprite.z*t;
			}else if(char1.mv3d_sprite){
				this.cameraStick.z=char1.mv3d_sprite.z;
			}
		}else if(this.cameraTargets.length){
			let char = this.getCameraTarget();
			//if(char===$gamePlayer&&$gamePlayer.isInVehicle()){ char=$gamePlayer.vehicle(); }
			this.cameraStick.x=char._realX;
			this.cameraStick.y=char._realY;
			if(char.mv3d_sprite){
				this.cameraStick.z=char.mv3d_sprite.z;
			}
		}
		this.blendPanX.update();
		this.blendPanY.update();
		this.cameraStick.x+=this.blendPanX.currentValue();
		this.cameraStick.y+=this.blendPanY.currentValue();

		// camera yaw, pitch, dist & height
		if(reorient|this.blendCameraPitch.update()|this.blendCameraYaw.update()|this.blendCameraRoll.update()
		|this.blendCameraDist.update()|this.blendCameraHeight.update()|$gameScreen._shake!==0){
			this.cameraNode.pitch = this.blendCameraPitch.currentValue()-90;
			this.cameraNode.yaw = this.blendCameraYaw.currentValue();
			this.camera.roll = this.blendCameraRoll.currentValue();
			this.cameraNode.position.set(0,0,0);
			this.cameraNode.translate(ZAxis,-this.blendCameraDist.currentValue(),LOCALSPACE);
			if(this.camera.mode===ORTHOGRAPHIC_CAMERA){
				const fieldSize = this.getFieldSize();
				this.camera.orthoLeft=-fieldSize.width/2;
				this.camera.orthoRight=fieldSize.width/2;
				this.camera.orthoTop=fieldSize.height/2;
				this.camera.orthoBottom=-fieldSize.height/2;
				//this.camera.zoom=10/this.blendCameraDist.currentValue();
				//this.camera.updateProjectionMatrix();
				//this.camera.maxZ=this.RENDER_DIST;
				//this.camera.minZ=-this.RENDER_DIST;
			}else{
				if(this.cameraNode.z<0){ this.cameraNode.z=0; }
				//this.camera.maxZ=this.RENDER_DIST;
				//this.camera.minZ=0.1;
			}
			this.cameraNode.z += this.blendCameraHeight.currentValue();
			this.cameraNode.translate(XAxis,-$gameScreen._shake/48,LOCALSPACE);
			this.updateDirection();
		}

		//fog
		if(reorient|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()){
			if(mv3d.featureEnabled('alphaFog')){
				this.scene.fogStart=this.blendFogNear.currentValue();
				this.scene.fogEnd=this.blendFogFar.currentValue();
			}else{
				this.scene.fogStart=Math.min(mv3d.RENDER_DIST-1,this.blendFogNear.currentValue());
				this.scene.fogEnd=Math.min(mv3d.RENDER_DIST,this.blendFogFar.currentValue());
			}
			this.scene.fogColor.copyFromFloats(
				this.blendFogColor.r.currentValue()/255,
				this.blendFogColor.g.currentValue()/255,
				this.blendFogColor.b.currentValue()/255,
			);
			if($gameMap.parallaxName()){
				mv3d.scene.clearColor.set(...mv3d.blendFogColor.currentComponents(),0);
			}else{
				mv3d.scene.clearColor.set(...mv3d.blendFogColor.currentComponents(),1);
			}
		}

		//light
		if(reorient|this.blendAmbientColor.update()){
			this.scene.ambientColor.copyFromFloats(
				this.blendAmbientColor.r.currentValue()/255,
				this.blendAmbientColor.g.currentValue()/255,
				this.blendAmbientColor.b.currentValue()/255,
			);
		}

		this.callFeatures('blend',reorient);
	},

});

const _changeParallax = Game_Map.prototype.changeParallax;
Game_Map.prototype.changeParallax = function() {
	_changeParallax.apply(this,arguments);
	if($gameMap.parallaxName()){
		mv3d.scene.clearColor.set(...mv3d.blendFogColor.currentComponents(),0);
	}else{
		mv3d.scene.clearColor.set(...mv3d.blendFogColor.currentComponents(),1);
	}
};


export class Blender{
	constructor(key,dfault){
		this.key=key;
		this.dfault=mv3d.loadData(key,dfault);
		this.value=dfault;
		this.speed=1;
		this.max=Infinity;
		this.min=-Infinity;
		this.cycle=false;
		this.changed=false;
	}
	setValue(target,time=0){
		target = Math.min(this.max,Math.max(this.min,target));
		let diff = target - this.value;
		if(!diff){ return; }
		this.saveValue(this.key,target);
		if(!time){ this.changed=true; this.value=target; }
		if(this.cycle){
			while ( Math.abs(diff)>this.cycle/2 ){
				this.value += Math.sign(diff)*this.cycle;
				diff = target - this.value;
			}
		}
		this.speed = Math.abs(diff)/(60*time);
	}
	currentValue(){ return this.value; }
	targetValue(){ return this.loadValue(this.key); }
	defaultValue(){ return this.dfault; }
	update(){
		const target = this.targetValue();
		if(this.value===target){ 
			if(this.changed){
				this.changed=false;
				return true;
			}else{
				return false;
			}
		}
		const diff = target - this.value;
		if(this.speed > Math.abs(diff)){
			this.value=target;
		}else{
			this.value+=this.speed*Math.sign(diff);
		}
		return true;
	}
	storageLocation(){
		if(!$gameVariables){
			console.warn(`MV3D: Couldn't get Blend storage location.`);
			return {};
		}
		if(!$gameVariables.mv3d){ $gameVariables.mv3d = {}; }
		return $gameVariables.mv3d;
	}
	loadValue(key){
		const storage = this.storageLocation();
		if(!(key in storage)){ return this.dfault; }
		return storage[key];
	}
	saveValue(key,value){
		const storage = this.storageLocation();
		storage[key]=value;
	}
}

export class ColorBlender{
	constructor(key,dfault){
		this.dfault=dfault;
		this.r=new Blender(`${key}_r`,dfault>>16);
		this.g=new Blender(`${key}_g`,dfault>>8&0xff);
		this.b=new Blender(`${key}_b`,dfault&0xff);
	}
	setValue(color,time){
		this.r.setValue(color>>16,time);
		this.g.setValue(color>>8&0xff,time);
		this.b.setValue(color&0xff,time);
	}
	currentValue(){
		return this.r.value<<16|this.g.value<<8|this.b.value;
	}
	targetValue(){
		return this.r.targetValue()<<16|this.g.targetValue()<<8|this.b.targetValue();
	}
	defaultValue(){ return this.dfault; }
	update(){
		let ret=0;
		ret|=this.r.update();
		ret|=this.g.update();
		ret|=this.b.update();
		return Boolean(ret);
	}
	get storageLocation(){ return this.r.storageLocation; }
	set storageLocation(v){
		this.r.storageLocation=v;
		this.g.storageLocation=v;
		this.b.storageLocation=v;
	}
	currentComponents(){
		return [this.r.currentValue()/255,this.g.currentValue()/255,this.b.currentValue()/255];
	}
	targetComponents(){
		return [this.r.targetValue()/255,this.g.targetValue()/255,this.b.targetValue()/255];
	}
}

mv3d.Blender=Blender;
mv3d.ColorBlender=ColorBlender;