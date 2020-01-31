import { override } from "../../util";
import mv3d from "../../mv3d";

override(ColliderManager,'update',o=>function(){
	this.hide();
});

override(ColliderManager.container,'update',o=>function(){
	if(this.visible){ o.apply(this,arguments); }
},true);

let _tileColliders={};

override(Game_Map.prototype,'setupMapColliders',o=>function(){
	this._tileCounter = 0;
	_tileColliders={};
	for (let x = 0; x < this.width(); x++)
	for (let y = 0; y < this.height(); y++) {
		const flags = this.tilesetFlags();
		const tiles = mv3d.getTileData(x, y);
		const zColliders = mv3d.getCollisionHeights(x,y);
		const tileCollider_list = _tileColliders[[x,y]]=[];
		for (let i=0; i<zColliders.length; ++i) {
			const tc=new Box_Collider($gameMap.tileWidth(),$gameMap.tileHeight());
			tileCollider_list[i]=tc;
			tc.x=x*$gameMap.tileWidth();
			tc.y=y*$gameMap.tileHeight();
			tc.mv3d_collider = zColliders[i];
		}
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

/*
override(Game_Map.prototype,'getMapCollider',o=>function(x,y,flag){
	const realFlag = flag&0xfff;
});
*/

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

override(Game_CharacterBase.prototype,'collidedWithTile',o=>function(type,collider){
	const collided = o.apply(this,arguments);
	if(!collided){ return false; }
	const sprite = this.mv3d_sprite;
	const tc = collider.mv3d_collider;
	if(!sprite || !tc) { return collided; }
	const cc = sprite.getCollisionHeight();
	if(cc.z1<tc.z2&&cc.z2>tc.z1 && cc.z1+mv3d.STAIR_THRESH<tc.z2&&cc.z2+mv3d.STAIR_THRESH>tc.z1){
		return true;
	}
	return false;
});

let tileCollider=null;

override(Game_CharacterBase.prototype,'collisionCheck',o=>function(x, y, dir, dist, type){
	if (this.isThrough() || this.isDebugThrough()) return true;
	const noCollision = o.apply(this,arguments);
	if(!noCollision){ return false; }
	const collider = this.collider(type);
	const bounds = this._colliders.bounds;
	const x1 = (bounds.center.x+bounds._xMin-1)/$gameMap.tileWidth();
	const y1 = (bounds.center.y+bounds._yMin-1)/$gameMap.tileHeight();
	const x2 = (bounds.center.x+bounds._xMax+1)/$gameMap.tileWidth();
	const y2 = (bounds.center.y+bounds._yMax+1)/$gameMap.tileHeight();
	if(!tileCollider){ tileCollider = new Box_Collider($gameMap.tileWidth(),$gameMap.tileHeight()); }
	for (let tx = Math.floor(x1); tx < Math.ceil(x2); ++tx)
	for (let ty = Math.floor(y1); ty < Math.ceil(y2); ++ty){
		tileCollider.x=tx*$gameMap.tileWidth();
		tileCollider.y=ty*$gameMap.tileHeight();
		if(collider.intersects(tileCollider) && mv3d.tileCollision(this,tx,ty,true,true)){
			return false;
		}
	}
	return true;
});

override(Game_CharacterBase.prototype,'makeCollider',o=>function makeCollider(type, settings){
	o.apply(this,arguments);
	if(!this.mv3d_sprite){ return; }
	this._colliders[type].mv3d_collider=this.mv3d_sprite.getCollider();
	this._colliders[type].mv3d_triggerCollider=this.mv3d_sprite.getTriggerCollider();
});