import mv3d from './mv3d.js';
import { TransformNode, Vector3, StandardMaterial, Texture } from 'babylonjs';
import {ORTHOGRAPHIC_CAMERA} from './mod_babylon.js';
import { radtodeg, override } from './util.js';

Object.assign(mv3d,{
	showBalloon(char){
		if(!char){ char=$gamePlayer.mv3d_sprite; }
		return new Balloon(char);
	}
});

class AnimSprite extends TransformNode{
	constructor(src,w,h,smooth){
		super('animSprite',mv3d.scene);
		this.cellWidth=w; this.cellHeight=h;
		this.cellIndex=0;
		this.isSmooth=smooth;
		this.mesh = mv3d.Meshes.BASIC.clone();
		this.mesh.isPickable=false;
		this.mesh.parent=this;
		this.mesh.setEnabled(false);
		this.material = new StandardMaterial('anim material',mv3d.scene);
		this.mesh.material=this.material;
		this.material.useAlphaFromDiffuseTexture=true;
		//this.material.alphaCutOff = mv3d.ALPHA_CUTOFF;
		this.material.alphaCutOff = 0;
		this.material.disableLighting=true;
		this.material.emissiveColor.set(1,1,1);
		this.material.ambientColor.set(1,1,1);
		this.material.specularColor.set(0,0,0);
		this.loadTexture(src)
	}
	async loadTexture(src){
		this.texture = await mv3d.createTexture(src);
		this.texture.hasAlpha=true;
		this.material.diffuseTexture=this.texture;
		await mv3d.waitTextureLoaded(this.texture);
		this.texture.updateSamplingMode( this.isSmooth
			? Texture.BILINEAR_SAMPLINGMODE
			: Texture.NEAREST_SAMPLINGMODE
		);
		this.textureLoaded=true;
		const size = this.texture.getBaseSize();
		this.cellCols = Math.floor(size.width/this.cellWidth);
	}
	update(){
		if(!this.textureLoaded){ return; }
		if(!this.mesh.isEnabled()){ this.mesh.setEnabled(true); }
		this.pitch = mv3d.blendCameraPitch.currentValue()-90;
		this.yaw = mv3d.blendCameraYaw.currentValue();
		this.texture.crop(
			this.cellIndex%this.cellCols*this.cellWidth,
			Math.floor(this.cellIndex/this.cellCols)*this.cellHeight,
			this.cellWidth, this.cellHeight
		);
	}
	dispose(){
		super.dispose(false,true);
	}
}
mv3d.AnimSprite=AnimSprite;

// Balloons
class Balloon extends AnimSprite{
	constructor(char){
		super('img/system/Balloon.png',48,48,false);
		this.char=char;
	}
	update(){
		if(!this.char){ return; }
		const pos = transformVectorForCharacter(new Vector3(0,0.5+this.char.spriteHeight,0),this.char);
		this.position.copyFrom(pos);
		const bs = this.char.char.mv_sprite._balloonSprite;
		if(!bs){ return; }
		this.cellIndex = (bs._balloonId-1)*8 + Math.max(0,bs.frameIndex());
		super.update();
	}
}
mv3d.Balloon=Balloon;

// depth animations

class DepthAnimation{
	constructor(animation){
		this.animation=animation;
		this.spriteList=[];
		this.char = this.animation._target._character.mv3d_sprite;
		DepthAnimation.list.push(this);
	}
	resetSpriteList(){
		for(const animationSprite of this.spriteList ){
			animationSprite.unused=true;
		}
	}
	clearUnusedSprites(){
		for(let i=this.spriteList.length-1;i>=0;--i){
			const animationSprite = this.spriteList[i];
			if(animationSprite.unused){
				animationSprite.setEnabled(false);
			}
		}
	}
	update(){
		const char = this.char;
		if(!char){ return; }
		const cameraDirection = mv3d.camera.getDirection(mv3d.camera.getTarget());
		this.resetSpriteList();
		const frameData = this.animation._animation.frames[this.animation.currentFrameIndex()];
		if(frameData)
		for(let i=0; i<Math.min(this.animation._cellSprites.length); ++i){
			const cell = this.animation._cellSprites[i];
			if(!cell.visible || !cell.bitmap){ continue; }
			const anim = this.getAnimationSprite(cell.bitmap._url);
			anim.material.alphaMode = mv3d.blendModes[cell.blendMode];

			anim.mesh.roll=radtodeg(cell.rotation);
			const scale = this.animation._mv3d_animationSettings.scale||1;
			anim.mesh.scaling.x=4*cell.scale.x*scale;
			anim.mesh.scaling.y=4*cell.scale.y*scale;
			anim.material.alpha=cell.opacity/255;

			const offsetVector = new Vector3(
				cell.position.x/48*scale,
				getAnimationOffset(this.animation)-cell.position.y/48*scale,
				0);
			const animationOrigin = transformVectorForCharacter(offsetVector,char);
			anim.position.copyFrom(animationOrigin);
			const scale2=Math.pow(scale,2);
			anim.mesh.position.set(
				-cameraDirection.x*0.1*(i+1)*scale2,
				-cameraDirection.y*0.1*(i+1)*scale2,
				-cameraDirection.z*0.1*(i+1)*scale2
			);

			const pattern = frameData[i][0];
			anim.cellIndex=pattern;
			anim.update();
			//console.log(anim.isVisible);
		}
		//console.log(this.spriteList.length);
		this.clearUnusedSprites();
	}
	getAnimationSprite(url){
		let sprite;
		for(const animationSprite of this.spriteList ){
			if(animationSprite._mv3d_sprite_url===url
			&&animationSprite.unused){
				//console.log("Found reusable sprite!", animationSprite);
				animationSprite.unused=false;
				animationSprite.setEnabled(true);
				sprite=animationSprite;
				break;
			}
		}
		if(!sprite){
			sprite = new AnimSprite(url,192,192,true);
			this.spriteList.push(sprite);
			sprite._mv3d_sprite_url=url;
			//sprite.parent=this.char.spriteOrigin;
			const settings = this.animation._mv3d_animationSettings
			if(settings.depth==false&&settings.depth!=null){
				sprite.mesh.renderingGroupId=mv3d.enumRenderGroups.FRONT;
			}
		}
		return sprite;
	}
	remove(){
		for(const animationSprite of this.spriteList ){
			animationSprite.dispose();
		}
		this.spriteList.length=0;
		const index = DepthAnimation.list.indexOf(this);
		if(index>=0){
			DepthAnimation.list.splice(index,1);
		}
	}
}
DepthAnimation.list = [];
mv3d.Animation=DepthAnimation;

function transformVectorForCharacter(vector,char){
	if(!char.isEmpty&&char.shape===mv3d.enumShapes.SPRITE){
		return Vector3.TransformCoordinates(vector,mv3d.getUnscaledMatrix(char.model.mesh));
	}else{
		return Vector3.TransformCoordinates(vector,mv3d.getTranslationMatrix(char.model.mesh));
	}
}


// mod animations

const _start_animation = Sprite_Character.prototype.startAnimation;
Sprite_Character.prototype.startAnimation = function(){
	_start_animation.apply(this,arguments);
	if(mv3d.mapDisabled||!(SceneManager._scene instanceof Scene_Map)){ return; }
	const animationSprite = this._animationSprites[this._animationSprites.length-1];
	animationSprite._mv3d_animationSettings=this._character._mv3d_animationSettings;
	delete this._character._mv3d_animationSettings;
	if(animationSprite._mv3d_animationSettings){
		animationSprite.mv3d_animation=new DepthAnimation(animationSprite);
		mv3d.pixiContainer.addChild(animationSprite._screenFlashSprite);
		return;
	}
	mv3d.pixiContainer.addChild(animationSprite);
};

const _animation_remove = Sprite_Animation.prototype.remove;
Sprite_Animation.prototype.remove=function(){
	if(!mv3d.mapDisabled && this.mv3d_animation){
		if(this._screenFlashSprite){
			this.addChild(this._screenFlashSprite);
		}
		this.mv3d_animation.remove();
	}
	_animation_remove.apply(this,arguments);
};

const _map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate=function(){
	_map_terminate.apply(this,arguments);
	for(let i=DepthAnimation.list.length-1;i>=0;--i){
		DepthAnimation.list[i].remove();
	}
};


const _animation_updateScreenFlash=Sprite_Animation.prototype.updateScreenFlash;
Sprite_Animation.prototype.updateScreenFlash = function() {
	_animation_updateScreenFlash.apply(this,arguments);
	if(!mv3d.mapDisabled&&(SceneManager._scene instanceof Scene_Map)){
		this._screenFlashSprite.x = 0;
		this._screenFlashSprite.y = 0;
	}
};

function getAnimationOffset(animation){
	const p = animation._animation.position;
	const offset = p===3?0:1-p/2;
	const char = animation._target._character;
	if(!char.mv3d_sprite){ return offset; }
	return offset * char.mv3d_sprite.spriteHeight;
}

const _update_animation_sprites = Sprite_Character.prototype.updateAnimationSprites;
Sprite_Character.prototype.updateAnimationSprites = function() {
	_update_animation_sprites.apply(this,arguments);
	if(mv3d.mapDisabled||!this._animationSprites.length||!(SceneManager._scene instanceof Scene_Map)){ return; }
	if(!this._character.mv3d_sprite){ return; }
	for (const animationSprite of this._animationSprites){
		if(animationSprite.mv3d_animation){ continue; }
		if(animationSprite._animation.position===3){
			animationSprite.update();
			continue;
		}

		const offsetVector = new Vector3(0, getAnimationOffset(animationSprite), 0);
		const animationOrigin = transformVectorForCharacter(offsetVector,this._character.mv3d_sprite);
		const pos = mv3d.getScreenPosition(animationOrigin);
		const dist = Vector3.Distance(
			BABYLON.Vector3.TransformCoordinates(mv3d.camera.position,mv3d.getTranslationMatrix(mv3d.camera)),
			animationOrigin);
		const scale = mv3d.camera.mode===ORTHOGRAPHIC_CAMERA ? mv3d.getScaleForDist() : mv3d.getScaleForDist(dist);

		animationSprite.behindCamera = pos.behindCamera;
		animationSprite.update();
		animationSprite.x=pos.x;
		animationSprite.y=pos.y;
		animationSprite.scale.set(scale,scale);
	}
};

const _update_cell = Sprite_Animation.prototype.updateCellSprite;
Sprite_Animation.prototype.updateCellSprite = function(sprite,cell) {
	_update_cell.apply(this,arguments);
	if(this.behindCamera){ sprite.visible=false; }
};