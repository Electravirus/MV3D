import mv3d from './mv3d.js';
import { Sprite, SpriteManager, TransformNode, Vector3, ORTHOGRAPHIC_CAMERA } from './mod_babylon.js';

Object.assign(mv3d,{
	showAnimation(char){
		if(!char){ char=$gamePlayer.mv3d_sprite; }
	},
	showBalloon(char){
		if(!char){ char=$gamePlayer.mv3d_sprite; }
		return new Balloon(char);
	}
});

// Balloons
class Balloon extends Sprite{
	constructor(char){
		super('balloon',Balloon.Manager());
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
	}
	dispose(){
		super.dispose();
		const index = Balloon.list.indexOf(this);
		if(index>=0){
			Balloon.list.splice(index,1);
		}
		if(this._manager.markedForDisposal&&!this._manager.sprites.length){
			this._manager.dispose();
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

// mod animations

const _start_animation = Sprite_Base.prototype.startAnimation;
Sprite_Base.prototype.startAnimation = function(){
	_start_animation.apply(this,arguments);
	if(mv3d.mapDisabled){ return; }
	const animationSprite = this._animationSprites[this._animationSprites.length-1];
	mv3d.pixiSprite.addChild(animationSprite);
};

const _animation_updateScreenFlash=Sprite_Animation.prototype.updateScreenFlash;
Sprite_Animation.prototype.updateScreenFlash = function() {
	_animation_updateScreenFlash.apply(this,arguments);
	if(!mv3d.mapDisabled){
		this._screenFlashSprite.x = 0;
		this._screenFlashSprite.y = 0;
	}
};

const _update_animation_sprites = Sprite_Base.prototype.updateAnimationSprites;
Sprite_Base.prototype.updateAnimationSprites = function() {
	_update_animation_sprites.apply(this,arguments);
	if(mv3d.mapDisabled||!this._animationSprites.length){ return; }
	if(!this._character.mv3d_sprite){ return; }
	for (const animationSprite of this._animationSprites){

		const p = animationSprite._animation.position;
		const offset = new Vector3(0,p==3?0:p===1?0.5:p===0?1:0,0);
		const animationOrigin = Vector3.TransformCoordinates(offset,this._character.mv3d_sprite.mesh.getWorldMatrix());
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