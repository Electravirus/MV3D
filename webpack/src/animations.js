import mv3d from './mv3d.js';
import { Sprite, SpriteManager, TransformNode, Vector3, ORTHOGRAPHIC_CAMERA, StandardMaterial } from './mod_babylon.js';

Object.assign(mv3d,{
	showAnimation(char){
		if(!char){ char=$gamePlayer.mv3d_sprite; }
	},
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
		this.mesh.parent=this;
		this.mesh.setEnabled(false);
		this.material = new StandardMaterial('anim material',mv3d.scene);
		this.mesh.material=this.material;
		this.material.useAlphaFromDiffuseTexture=true;
		this.material.alphaCutOff = mv3d.ALPHA_CUTOFF;
		this.material.emissiveColor.set(1,1,1);
		this.material.specularColor.set(0,0,0);
		this.loadTexture(src)
	}
	async loadTexture(src){
		this.texture = await mv3d.createTexture(src);
		this.texture.hasAlpha=true;
		this.material.diffuseTexture=this.texture;
		await mv3d.waitTextureLoaded(this.texture);
		if(!this.isSmooth){ this.texture.updateSamplingMode(1); }
		this.textureLoaded=true;
		const size = this.texture.getBaseSize();
		this.cellCols = Math.floor(size.width/this.cellWidth);
	}
	update(){
		if(!this.textureLoaded){ return; }
		if(!this.mesh.isEnabled()){ this.mesh.setEnabled(true); }
		this.mesh.pitch = mv3d.blendCameraPitch.currentValue()-90;
		this.mesh.yaw = mv3d.blendCameraYaw.currentValue();
		this.texture.crop(
			this.cellIndex%this.cellCols*this.cellWidth,
			Math.floor(this.cellIndex/this.cellCols)*this.cellHeight,
			this.cellWidth, this.cellHeight, true
		);
	}
	dispose(){
		super.dispose(false,true);
	}
}

// Balloons
class Balloon extends AnimSprite{
	constructor(char){
		super('img/system/Balloon.png',48,48,false);
		Balloon.list.push(this);
		this.char=char;
	}
	update(){
		if(!this.char){ return; }
		const pos = Vector3.TransformCoordinates(new Vector3(0,1+(0.5/this.char.mesh.scaling.y),0),this.char.mesh.getWorldMatrix());
		this.position.copyFrom(pos);
		const bs = this.char.char.mv_sprite._balloonSprite;
		if(!bs){ return; }
		this.cellIndex = (bs._balloonId-1)*8 + Math.max(0,bs.frameIndex());
		super.update();
	}
	dispose(){
		super.dispose();
		const index = Balloon.list.indexOf(this);
		if(index>=0){
			Balloon.list.splice(index,1);
		}
	}
}

Balloon.list=[];
Balloon.Manager=function(){
	if(!Balloon.manager || Balloon.manager.mapId!=$gameMap.mapId() || Balloon.manager._capacity<$gameMap.events().length){
		if(Balloon.manager){
			if(Balloon.manager.sprites.length){
				Balloon.manager.markedForDisposal=true;
			}else{
				Balloon.manager.dispose();
			}
		}
		Balloon.manager = new SpriteManager('balloonManager', 'img/system/Balloon.png',$gameMap.events().length,48,mv3d.scene);
		Balloon.manager.texture.onLoadObservable.addOnce(()=>{
			Balloon.manager.texture.updateSamplingMode(1);
		});
		Balloon.manager.mapId=$gameMap.mapId();
	}
	return Balloon.manager;
}

// depth animations

class DepthAnimation{
	constructor(animation){
		this.animation=animation;
		this.spriteList=[];
		this.managers={};
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
				animationSprite.isVisible=false;
				animationSprite.dispose();
				this.spriteList.splice(i,1);
			}
		}
	}
	update(){
		const char = this.animation._target._character.mv3d_sprite;
		if(!char){ return; }
		this.resetSpriteList();
		const frameData = this.animation._animation.frames[this.animation.currentFrameIndex()];
		if(frameData)
		for(let i=0; i<Math.min(this.animation._cellSprites.length); ++i){
			const cell = this.animation._cellSprites[i];
			if(!cell.visible || !cell.bitmap){ continue; }
			const anim = this.getAnimationSprite(cell.bitmap._url, mv3d.blendModes[cell.blendMode]);

			anim.angle=-cell.rotation;
			anim.invertU=cell.scale.x<0;
			const scale = this.animation._mv3d_animationSettings.scale||1;
			anim.width=4*Math.abs(cell.scale.x)*scale;
			anim.height=4*Math.abs(cell.scale.y)*scale;

			const offsetVector = new Vector3(
				cell.position.x/48*scale,
				getAnimationOffset(this.animation)-cell.position.y/48*scale,
				0);
			const animationOrigin = Vector3.TransformCoordinates(offsetVector,char.mesh.getWorldMatrix());

			anim.position.set(
				animationOrigin.x+char.billboardOffset.x*0.1,
				animationOrigin.y,
				animationOrigin.z-char.billboardOffset.y*0.1
			);

			const pattern = frameData[i][0];
			anim.cellIndex=pattern;
		}
		//console.log(this.spriteList.length);
		this.clearUnusedSprites();
	}
	getAnimationSprite(url,blendMode){
		let sprite;
		for(const animationSprite of this.spriteList ){
			if(animationSprite._mv3d_sprite_url===url
			&&animationSprite._mv3d_sprite_blendMode===blendMode
			&&animationSprite.unused){
				//console.log("Found reusable sprite!", animationSprite)
				animationSprite.unused=false;
				animationSprite.isVisible=true;
				sprite=animationSprite;
				break;
			}
		}
		if(!sprite){
			const manager = this.getManager(url,blendMode);
			sprite = new Sprite('animationSprite',manager);
			this.spriteList.push(sprite);
			sprite._mv3d_sprite_url=url;
			sprite._mv3d_sprite_blendMode=blendMode;
			console.log(manager);
		}
		return sprite;
	}
	getManager(url,blendMode){
		const key = `${blendMode}|${url}`;
		if(!this.managers[key]){
			this.managers[key] = new SpriteManager('animationManager',url,16,192,mv3d.scene);
			//this.managers[key].texture.onLoadObservable.addOnce(()=>{
			//	this.managers[key].texture.updateSamplingMode(1);
			//});
			if(!this.animation._mv3d_animationSettings.depth){
				this.managers[key].renderingGroupId=1;
			}
			this.managers[key].blendMode=blendMode;
		}
		return this.managers[key];
	}
	remove(){
		for(const animationSprite of this.spriteList ){
			animationSprite.dispose();
		}
		this.spriteList.length=0;
		for(const key in this.managers){
			this.managers[key].dispose();
		}
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
		mv3d.pixiSprite.addChild(animationSprite._screenFlashSprite);
		return;
	}
	mv3d.pixiSprite.addChild(animationSprite);
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
		const animationOrigin = Vector3.TransformCoordinates(offsetVector,this._character.mv3d_sprite.mesh.getWorldMatrix());
		const pos = mv3d.getScreenPosition(animationOrigin);
		const dist = Vector3.Distance(mv3d.camera.globalPosition,animationOrigin);
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