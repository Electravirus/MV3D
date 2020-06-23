import mv3d from './mv3d.js';
import { ZAxis, XAxis, radtodeg } from "./util.js";
import { Ray, Vector3, Vector2 } from 'babylonjs';
import { ORTHOGRAPHIC_CAMERA, LOCALSPACE } from './mod_babylon.js';

const raycastPredicate=mesh=>{
	if(!mesh.isEnabled() || !mesh.isVisible || !mesh.isPickable || mesh.character){ return false; }
	return true;
}

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

	cameraTrack:null,
	cameraTrackTime:0,
	cameraTrackMode:0,
	setCameraTrack(target,time=0,mode=3){
		if(!target){ this.cameraTrack=null; return; }
		this.cameraTrack=target;
		this.cameraTrackTime=time;
		this.cameraTrackMode=mode;
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
		this.blendCameraZoom = new Blender('cameraZoom',1);
		this.blendCameraDist.min=0;
		this.blendCameraHeight = new Blender('cameraHeight',0.7);
		this.blendAmbientColor = new ColorBlender('ambientColor',this.AMBIENT_COLOR);
		this.blendPanX = new Blender('panX',0);
		this.blendPanY = new Blender('panY',0);
		this.blendCameraTransition = new Blender('cameraTransition',0);
		this.blendResolutionScale = new Blender('resolutionScale',mv3d.RES_SCALE);
	},

    updateBlenders(reorient){
		this.updateCameraMode();
		// camera target & pan
		if(!this.cameraTargets.length){
			if($gamePlayer){
				this.cameraTargets[0]=$gamePlayer;
			}
		}

		// camera tracking
		if(this.cameraTrack && this.cameraTrack!==this.cameraTargets[0]){
			if(this.cameraTrackMode&1){
				const yaw = radtodeg(Math.atan2(-(this.cameraTrack._realY-this.cameraStick.y),this.cameraTrack._realX-this.cameraStick.x))-90;
				if(this.blendCameraYaw.targetValue()!==yaw){ this.blendCameraYaw.setValue(yaw,this.cameraTrackTime); }
			}
			if(this.cameraTrackMode&2){
				const dist = Vector2.Distance(new Vector2(this.cameraTrack._realX,this.cameraTrack._realY), new Vector2(this.cameraStick.absolutePosition.x,-this.cameraStick.absolutePosition.z));
				const zdist = this.cameraTrack.z - this.cameraStick.absolutePosition.y;
				const pitch = radtodeg(Math.atan(zdist/dist)) + 90;
				if(this.blendCameraPitch.targetValue()!==pitch && isFinite(pitch)){ this.blendCameraPitch.setValue(pitch,this.cameraTrackTime); }
			}
		}

		// camera following
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
		|this.blendCameraDist.update()|this.blendCameraHeight.update()|this.blendCameraZoom.update()
		|$gameScreen._shake!==0
		|(mv3d.cameraCollision.type&&$gamePlayer.mv3d_positionUpdated)){
			this.cameraNode.pitch = this.blendCameraPitch.currentValue()-90;
			this.cameraNode.yaw = this.blendCameraYaw.currentValue();
			this.cameraNode.roll = this.blendCameraRoll.currentValue();
			this.cameraNode.position.set(0,0,0);
			let dist = this.blendCameraDist.currentValue();
			if(mv3d.cameraCollision.type){
				let doCollide = true;
				if(mv3d.cameraCollision.type>1){
					this.cameraNode.translate(ZAxis,-dist,LOCALSPACE);
					const gpos = mv3d.globalPosition(this.cameraNode);
					this.cameraNode.position.set(0,0,0);
					const z = mv3d.getWalkHeight(gpos.x,-gpos.z);
					if(gpos.y>z){doCollide=false;}
					//if(Date.now()%10===0)console.log(gpos,z);
				}
				if(doCollide){
					const raycastOrigin = new Vector3().copyFrom(this.cameraStick.position);
					raycastOrigin.y+=this.blendCameraHeight.currentValue()+0.1;
					const ray = new Ray(raycastOrigin, Vector3.TransformCoordinates(mv3d.camera.getTarget().negate(),mv3d.getRotationMatrix(mv3d.camera)),dist);
					const intersections = mv3d.scene.multiPickWithRay(ray,raycastPredicate);
					for (const intersection of intersections){
						if(!intersection.hit){ continue; }
						let material = intersection.pickedMesh.material; if(!material){ continue; }
						if(material.subMaterials){
							material = material.subMaterials[intersection.pickedMesh.subMeshes[intersection.subMeshId].materialIndex];
						}
						if(material.mv3d_through){ continue; }
						dist=intersection.distance;
						break;
					}
				}
			}
			if(this.cameraCollision.smooth){
				if(this.camera.dist==null){this.camera.dist=dist;}
				this.camera.dist=this.camera.dist+(dist-this.camera.dist)/2;
				dist=this.camera.dist;
			}
			this.cameraNode.translate(ZAxis,-dist,LOCALSPACE);
			if(this.camera.mode===ORTHOGRAPHIC_CAMERA){
				const fieldSize = this.getFieldSize();
				this.camera.orthoLeft=-fieldSize.width/2;
				this.camera.orthoRight=fieldSize.width/2;
				this.camera.orthoTop=fieldSize.height/2;
				this.camera.orthoBottom=-fieldSize.height/2;
			}else{
				if(this.cameraNode.z<0){ this.cameraNode.z=0; }
			}
			this.cameraNode.z += this.blendCameraHeight.currentValue();
			this.cameraNode.translate(XAxis,-$gameScreen._shake/48,LOCALSPACE);
			this.updateDirection();
			this.updateFov();

			if(mv3d.DYNAMIC_NORMALS && (reorient||this.blendCameraPitch.updated||(this.blendSunColor&&this.blendSunColor.updated)) ){
				this.updateDynamicNormals();
			}
		}

		//fog
		if(reorient|this.blendFogColor.update()|this.blendFogNear.update()|this.blendFogFar.update()){
			if(mv3d.hasAlphaFog){
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
			mv3d.updateClearColor();
			mv3d.updateRenderDist();
		}

		//light
		if(reorient|this.blendAmbientColor.update()){
			this.scene.ambientColor.copyFromFloats(
				this.blendAmbientColor.r.currentValue()/255,
				this.blendAmbientColor.g.currentValue()/255,
				this.blendAmbientColor.b.currentValue()/255,
			);
		}

		// res scale
		if(reorient|this.blendResolutionScale.update()){
			const resScale=this.blendResolutionScale.currentValue();
			mv3d.RES_SCALE=resScale;
			mv3d.pixiSprite.scale.set(1/resScale,1/resScale);
			mv3d.updateCanvas();
		}

		this.callFeatures('blend',reorient);
	},

	updateClearColor(){
		if($gameMap.parallaxName()||mv3d.hasSkybox){
			if(mv3d.hasAlphaFog){
				mv3d.scene.clearColor.set(...mv3d.blendFogColor.currentComponents(),0);
			}else{
				mv3d.scene.clearColor.set(0,0,0,0);
			}
		}else{
			mv3d.scene.clearColor.set(...mv3d.blendFogColor.currentComponents(),1);
		}
	},

});

const _changeParallax = Game_Map.prototype.changeParallax;
Game_Map.prototype.changeParallax = function() {
	_changeParallax.apply(this,arguments);
	mv3d.updateClearColor();
};


export class Blender{
	constructor(key,dfault,track=true){
		this.key=key;
		this.dfault=mv3d.loadData(key,dfault);
		this.value=dfault;
		this.speed=1;
		this.max=Infinity;
		this.min=-Infinity;
		this.cycle=false;
		if(track){
			Blender.list.push(this);
		}
	}
	setValue(target,time=0,normalize=true){
		target = Math.min(this.max,Math.max(this.min,target));
		let diff = target - this.value;
		if(this.cycle){
			while( target>this.cycle ){ target-=this.cycle; }
			while( target<-this.cycle ){ target+=this.cycle; }
			this.value=target - diff;
		}
		this.saveValue(this.key,target);
		if(!time){ this.instantChanged=true; this.value=target; }
		if(normalize&&this.cycle){
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
			if(this.instantChanged){
				this.updated=true;
				delete this.instantChanged;
				return true;
			}else{
				this.updated=false;
				return false;
			}
		}
		const diff = target - this.value;
		if(isNaN(this.speed)){ this.speed=Infinity; }
		if(this.speed > Math.abs(diff)){
			this.value=target;
		}else{
			this.value+=this.speed*Math.sign(diff);
		}
		this.updated=true;
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
	static reset(){
		for (const blender of Blender.list){
			blender.speed=Infinity;
		}
	}
}
Blender.list = [];

export class ColorBlender{
	constructor(key,dfault,track=true){
		this.dfault=dfault;
		this.r=new Blender(`${key}_r`,dfault>>16,track);
		this.g=new Blender(`${key}_g`,dfault>>8&0xff,track);
		this.b=new Blender(`${key}_b`,dfault&0xff,track);
	}
	get updated(){
		return this.r.updated||this.g.updated||this.b.updated;
	}
	setValue(color,time){
		this.r.setValue(color>>16,time);
		this.g.setValue(color>>8&0xff,time);
		this.b.setValue(color&0xff,time);
	}
	averageCurrentValue(){
		return (this.r.value+this.g.value+this.b.value)/3|0;
	}
	averageTargetValue(){
		return (this.r.targetValue()+this.g.targetValue()+this.b.targetValue())/3|0;
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