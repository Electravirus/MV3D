import { override, unround } from "../../util";
import mv3d from "../../mv3d";
import { Feature } from "../../features";

override(ColliderManager,'update',o=>function(){
	this.hide();
});

override(ColliderManager.container,'update',o=>function(){
	if(this.visible){ o.apply(this,arguments); }
},true);

let _tileColliders={};
mv3d.getQTileColliders=()=>_tileColliders;

function mv3d_makeTileCollider(x,y,zcollider){
	const tc=new Box_Collider($gameMap.tileWidth(),$gameMap.tileHeight());
	tc.x=x*$gameMap.tileWidth();
	tc.y=y*$gameMap.tileHeight();
	tc.mv3d_collider=zcollider;
	return tc;
}

override(Game_Map.prototype,'setupMapColliders',o=>function(){
	this._tileCounter = 0;
	_tileColliders={};
	for (let x = 0; x < this.width(); x++)
	for (let y = 0; y < this.height(); y++) {
		const flags = this.tilesetFlags();
		const tiles = mv3d.getTileData(x, y);
		const zColliders = mv3d.getCollisionHeights(x,y,{layers:true});
		const tileCollider_list = _tileColliders[[x,y]]=[];
		for (let i=0; i<zColliders.length; ++i) {
			tileCollider_list[i]=mv3d_makeTileCollider(x,y,zColliders[i]);
		}
		_tileColliders[[x,y,'x']]=mv3d_makeTileCollider(x,y,{z1:-Infinity,z2:Infinity});
		for (let l = 0; l < tiles.length; ++l) {
			const flag = flags[tiles[l]];
			const passage = mv3d.getTilePassage(tiles[l],x,y,l);
			if(passage===mv3d.enumPassage.THROUGH){ continue; }
			let mv3d_collider;
			if(zColliders.layers[l]){
				mv3d_collider=zColliders.layers[l];
				mv3d_collider.passage=passage;
			}
			let data = this.getMapCollider(x, y, flag);
			if (!data){ continue; }
			if (data[0].constructor === Array) {
				for (var j = 0; j < data.length; j++) {
					data[j].mv3d_collider=mv3d_collider;
					data[j].isRegionCollider=true;
					this.makeTileCollider(x, y, flag, data[j], j);
				}
			} else {
				data.mv3d_collider=mv3d_collider;
				data.isQCollider=true;
				this.makeTileCollider(x, y, flag, data, 0);
			}
		}
	}
});

override(Game_Map.prototype,'makeTileCollider',o=>function(x,y,flag,boxData,index){
	const collider = o.apply(this,arguments);
	if(boxData.mv3d_collider){
		if(boxData.isRegionCollider){
			collider.mv3d_collider = {
				z1: -Infinity,
				z2: Infinity,
			};
		}else if(boxData.isQCollider){
			collider.mv3d_collider = {
				z1: boxData.mv3d_collider.z2,
				z2: boxData.mv3d_collider.z2 + mv3d.STAIR_THRESH + 0.01,
			};
		}else{
			collider.mv3d_collider = boxData.mv3d_collider;
		}
	}
	return collider;
});

override(Game_CharacterBase.prototype,'collider',o=>function collider(){
	const collider = o.apply(this,arguments);
	if(!this.mv3d_sprite){ return collider; }
	if(!collider.mv3d_collider){
		collider.mv3d_collider=this.mv3d_sprite.getCollider();
		collider.mv3d_triggerCollider=this.mv3d_sprite.getTriggerCollider();
	}
	return collider;
});

function zCollidersOverlap(c1,c2){
	if(!c1.mv3d_collider||!c2.mv3d_collider){ return true; }
	c1=c1.mv3d_collider; c2=c2.mv3d_collider;
	if(c1.z1<c2.z2&&c1.z2>c2.z1 && c1.z1+mv3d.STAIR_THRESH<c2.z2&&c1.z2+mv3d.STAIR_THRESH>c2.z1){
		return true;
	}
	return false;
}

override(ColliderManager,'getCollidersNear',o=>function getCollidersNear(collider, only, debug){
	let isBreak=false;
	const near = o.call(this,collider,c=>{
		if(zCollidersOverlap(collider,c)===false){ return false; }
		if(only){
			const value = only(c);
			if(value==='break'){isBreak=true;}
			return value;
		}
		return true;
	},debug);
	if(isBreak){ return near; }
	const x1 = (collider.x+collider._offset.x-1)/QMovement.tileSize;
	const y1 = (collider.y+collider._offset.y-1)/QMovement.tileSize;
	const x2 = (collider.x+collider._offset.x+collider.width+1)/QMovement.tileSize;
	const y2 = (collider.y+collider._offset.y+collider.height+1)/QMovement.tileSize;
	for (let tx = Math.floor(x1); tx < Math.ceil(x2); ++tx)
	for (let ty = Math.floor(y1); ty < Math.ceil(y2); ++ty){
		if(collider.mv3d_collider){
			let skip=false;
			const char = collider.mv3d_collider.char;
			if(char){
				const platform = char.getPlatform(tx,ty);
				if(platform.char){ skip=true; }
			}
			const tileLayers = mv3d.getTileLayers(tx,ty,collider.mv3d_collider.z1+mv3d.STAIR_THRESH);
			const tileCollider = _tileColliders[[tx,ty,'x']];
			if(tileCollider&&!skip)for(const l of tileLayers){
				const passage = mv3d.getTilePassage(tx,ty,l);
				let shouldCollide=false;
				if(passage===mv3d.enumPassage.WALL){
					shouldCollide=true;
				}else if(char && !mv3d.WALK_OFF_EDGE && !char.char._mv3d_isFlying()){
					const floatz = mv3d.getPlatformFloatForCharacter(char,tx,ty);
					if(unround(Math.abs(floatz-char.targetElevation))>mv3d.STAIR_THRESH){
						shouldCollide=true;
					}
				}
				if(shouldCollide){
					let value=true;
					if(only){ value = only(tileCollider); }
					if(value!==false){
						near.push(tileCollider);
						if(value==='break'){ return near; }
						continue;
					}
				}
			}
		}
		const colliderList=_tileColliders[[tx,ty]];
		if(colliderList) for(let i = 0; i<colliderList.length; ++i){
			if(zCollidersOverlap(collider,colliderList[i])){
				if(only){
					const value = only(colliderList[i]);
					if(value!==false){ near.push(colliderList[i]); }
					if(value==='break'){ break; }
				}else{
					near.push(colliderList[i]);
				}
			}
		}
	}
	return near;
});

override(ColliderManager,'getCharactersNear',o=>function getCharactersNear(collider, only){
	return o.call(this,collider,char=>{
		if(zCollidersOverlap(collider,char.collider())===false){ return false; }
		if(only){ return only(char); }
		return true;
	});
});

mv3d.Character.prototype.getPlatform=function(x=this.char._realX,y=this.char._realY){
	const collider = this.char.collider();
	this.platform = mv3d.getPlatformForCharacter(this,x,y);
	return this.platform;
}