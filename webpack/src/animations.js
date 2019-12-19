import mv3d from './mv3d.js';
import { Sprite, SpriteManager, TransformNode, Vector3 } from './mod_babylon.js';

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

// Animations
class Animation{
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
				animationSprite.dispose();
				this.spriteList.splice(i,1);
			}
		}
	}
	update(){
		this.resetSpriteList();
		const frameData = this.animation._animation.frames[this.animation.currentFrameIndex()];
		for(let i=0; i<this.animation._cellSprites.length; ++i){
			const cell = this.animation._cellSprites[i];
			if(!cell.visible || !cell.bitmap){ continue; }
			const sprite = this.getAnimationSprite(cell.bitmap._url, mv3d.blendModes[cell.blendMode]);
			sprite.x=this.animation._target._character._realX;
			sprite.y=this.animation._target._character._realY;
			sprite.width=4*cell.scale.x;
			sprite.height=4*cell.scale.y;
			const pattern = frameData[i][0];
			sprite.cellIndex=pattern;
			console.log(sprite);
		}
		this.clearUnusedSprites();
	}
	getAnimationSprite(url,blendMode){
		let sprite;
		for(const animationSprite of this.spriteList ){
			if(animationSprite.url===url
			&&animationSprite._manager.blendMode===blendMode
			&&animationSprite.unused){
				animationSprite.unused=false;
				sprite=animationSprite;
			}
		}
		if(!sprite){
			const manager = this.getManager(url,blendMode);
			sprite = new Sprite('animationSprite',manager);
			this.spriteList.push(sprite);
		}
		return sprite;
	}
	getManager(url,blendMode){
		const key = `${blendMode}|${url}`;
		if(!this.managers[key]){
			this.managers[key] = new SpriteManager('animationManager',url,16,192,mv3d.scene);
			this.managers[key].texture.onLoadObservable.addOnce(()=>{
				this.managers[key].texture.updateSamplingMode(1);
			});
			this.managers[key].renderingGroupId=1;
			this.managers[key].alphaMode=blendMode;
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

const _createScreenFlashSprite = Sprite_Animation.prototype.createScreenFlashSprite;
Sprite_Animation.prototype.createScreenFlashSprite=function(){
	_createScreenFlashSprite.apply(this,arguments);
	if(!mv3d.mapDisabled){
		mv3d.pixiSprite.addChild(this._screenFlashSprite);
	}
};

const _animation_initialize = Sprite_Animation.prototype.initialize;
Sprite_Animation.prototype.initialize = function() {
	_animation_initialize.apply(this,arguments);
	this.mv3d_animation=new Animation(this);
};

const _animation_remove = Sprite_Animation.prototype.remove;
Sprite_Animation.prototype.remove=function(){
	if(!mv3d.mapDisabled){
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
	if(!mv3d.mapDisabled){
		this._screenFlashSprite.x = 0;
		this._screenFlashSprite.y = 0;
	}
};