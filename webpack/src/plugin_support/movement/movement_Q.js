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

function mv3d_makeTileCollider(x,y,zcollider,extra){
	const tc=new Box_Collider($gameMap.tileWidth(),$gameMap.tileHeight());
	tc.x=x*$gameMap.tileWidth();
	tc.y=y*$gameMap.tileHeight();
	tc.mv3d_collider=zcollider;
	tc.mv3d_collider_type=extra;
	return tc;
}

const infiniteHeightCollider={z1:-Infinity,z2:Infinity};

override(Game_Map.prototype,'setupMapColliders',o=>function(){
	this._tileCounter = 0;
	_tileColliders={};
	for (let x = 0; x < this.width(); x++)
	for (let y = 0; y < this.height(); y++) {
		const px = x * this.tileWidth(), py = y * this.tileHeight();
		const flags = this.tilesetFlags();
		const tiles = mv3d.getTileData(x, y);
		const zColliders = mv3d.getCollisionHeights(x,y,{layers:true});
		const tileCollider_list = _tileColliders[[x,y]]=[];
		for (let i=0; i<zColliders.length; ++i) {
			tileCollider_list[i]=mv3d_makeTileCollider(x,y,zColliders[i],'mv3d');
		}
		_tileColliders[[x,y,'x']]=mv3d_makeTileCollider(x,y,infiniteHeightCollider,'mv3d_x');
		for (let l = 0; l < tiles.length; ++l) {
			const flag = flags[tiles[l]];
			const passage = mv3d.getTilePassage(tiles[l],x,y,l);
			if(passage===mv3d.enumPassage.THROUGH){ continue; }
			const conf = mv3d.getTileConfig(x,y,l);
			if(conf.shape===mv3d.enumShapes.SLOPE){
				const rampData = mv3d.getRampData(x,y,l,conf);
				let dcol=0;
				if(!mv3d.canPassRamp(2,rampData)){ dcol|=0b0001; }
				if(!mv3d.canPassRamp(4,rampData)){ dcol|=0b0010; }
				if(!mv3d.canPassRamp(6,rampData)){ dcol|=0b0100; }
				if(!mv3d.canPassRamp(8,rampData)){ dcol|=0b1000; }
				dcol+=1536;
				//const data = Array.from(QMovement.tileBoxes[flag]);
				let data = QMovement.tileBoxes[dcol];
				const key = [x,y,l,'slope'].toString();
				_tileColliders[key]=[];
				if(data){
					if(data[0].constructor!==Array){ data=[data]; }
					for(const box of data){
						const c = new Box_Collider(box[0]||0,box[1]||0,box[2],box[3]);
						c.moveTo(px,py);
						c.mv3d_collider=infiniteHeightCollider;
						_tileColliders[key].push(c);
					}
				}
			}
			let mv3d_collider;
			if(zColliders.layers[l]){
				mv3d_collider=zColliders.layers[l];
				mv3d_collider.passage=passage;
				mv3d_collider.l=l;
			}
			let data = this.getMapCollider(x, y, flag);
			if (!data){ continue; }
			data=Array.from(data);
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
},true);

override(Game_Map.prototype,'makeTileCollider',o=>function(x,y,flag,boxData,index){
	const collider = o.apply(this,arguments);
	if(boxData.mv3d_collider){
		if(boxData.isRegionCollider){
			collider.mv3d_collider = infiniteHeightCollider;
		}else if(boxData.isQCollider){
			collider.mv3d_collider = {z1:-Infinity,z2:Infinity};
			if(boxData.mv3d_collider){
				collider.mv3d_collider.l = boxData.mv3d_collider.l;
			}
			/*
			collider.mv3d_collider = {
				z1: boxData.mv3d_collider.z2,
				z2: boxData.mv3d_collider.z2 + mv3d.STAIR_THRESH + 0.01,
			};
			*/
		}else{
			collider.mv3d_collider = boxData.mv3d_collider;
		}
	}
	return collider;
},true);

override(Game_CharacterBase.prototype,'collider',o=>function collider(){
	const collider = o.apply(this,arguments);
	if(!this.mv3d_sprite){ return collider; }
	if(!collider.mv3d_collider){
		Object.defineProperty(collider,'mv3d_collider',{
			configurable:true, value: this.mv3d_sprite.getCollider(),
		});
		Object.defineProperty(collider,'mv3d_triggerCollider',{
			configurable:true, value: this.mv3d_sprite.getTriggerCollider(),
		});
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
/*
override(ColliderManager,'getCollidersNear',o=>function getCollidersNear(collider, only, debug){
	// Q colliders
	let isBreak=false;
	const cx = Math.round(collider.x/QMovement.tileSize);
	const cy = Math.round(collider.y/QMovement.tileSize);
	const near = o.call(this,collider,c=>{
		if(zCollidersOverlap(collider,c)===false){ return false; }
		if(collider.mv3d_collider){
			if(collider.mv3d_collider.char){
				// if we're standing on a character, ignore Q colliders.
				const platform = collider.mv3d_collider.char.getPlatform(cx,cy);
				if(platform.char){ return false; }
			}
			if(c.mv3d_collider){
				// ignore Q colliders not on current layer
				const cx2 = Math.round(c.x/QMovement.tileSize);
				const cy2 = Math.round(c.y/QMovement.tileSize);
				const tileLayers = mv3d.getTileLayers(cx2,cy2,collider.mv3d_collider.z1+mv3d.STAIR_THRESH);
				if(!tileLayers.includes(c.mv3d_collider.l)){ return false; }
			}
		}
		if(only){
			const value = only(c);
			if(value==='break'){isBreak=true;}
			return value;
		}
		return true;
	},debug);
	if(isBreak){ return near; }
});
*/
override(ColliderManager,'getCollidersNear',o=>function getCollidersNear(collider, only, debug){
	let isBreak=false;
	const near = o.call(this,collider,c=>{
		if(zCollidersOverlap(collider,c)===false){ return false; }
		if(collider.mv3d_collider&&c.mv3d_collider){
			const cx = Math.round(c.x/QMovement.tileSize);
			const cy = Math.round(c.y/QMovement.tileSize);
			if(collider.mv3d_collider.char){
				const platform = collider.mv3d_collider.char.getPlatform(cx,cy);
				if(platform.char){ return false; }
			}
			const tileLayers = mv3d.getTileLayers(cx,cy,collider.mv3d_collider.z1+mv3d.STAIR_THRESH);
			if(!tileLayers.includes(c.mv3d_collider.l)){ return false; }
		}
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
	const cx = Math.round(collider.x/QMovement.tileSize);
	const cy = Math.round(collider.y/QMovement.tileSize);
	let isSlope = false, hadSlope = false, onChar = false;
	if(collider.mv3d_collider){
		isSlope = mv3d.isRampAt(cx,cy,collider.mv3d_collider.z1);
		if(collider.mv3d_collider.char){
			const char = collider.mv3d_collider.char;
			const platform = char.getPlatform(cx,cy);
			if(platform.char){ onChar=true; }
		}
	}

	for (let tx = Math.floor(x1); tx < Math.ceil(x2); ++tx)
	for (let ty = Math.floor(y1); ty < Math.ceil(y2); ++ty){

		let char,d;
		if(collider.mv3d_collider&&collider.mv3d_collider.char){
			char = collider.mv3d_collider.char;
			d = 10-Input._makeNumpadDirection(Math.sign(tx-Math.round(char.x)),Math.sign(ty-Math.round(char.y)));
		}
		let hasSlope;

		if(collider.mv3d_collider){

			const tileLayers = mv3d.getTileLayers(tx,ty,collider.mv3d_collider.z1+mv3d.STAIR_THRESH);
			if(!onChar)for(const l of tileLayers){
				if([tx,ty,l,'slope'] in _tileColliders){ hasSlope=true; hadSlope=true; break; }
			}

			let shouldCollide=false;
			let skip=false;
			if(char){
				const platform = char.getPlatform(tx,ty);
				if(platform.char){
					skip=true;
					if(!mv3d.WALK_OFF_EDGE && !char.char._mv3d_isFlying()
					&& unround(Math.abs(platform.z2-char.targetElevation))>mv3d.STAIR_THRESH){
						shouldCollide=true;
					}
				}
				if(char.falling&&!char.char._mv3d_isFlying()){ shouldCollide=true; }
			}
			const tileCollider = _tileColliders[[tx,ty,'x']];
			if(tileCollider&&!skip&&!shouldCollide){
				
				for(const l of tileLayers){
					const passage = mv3d.getTilePassage(tx,ty,l);
					let slopeColliders;
					// x passage
					if(passage===mv3d.enumPassage.WALL){
						shouldCollide=true; break;
					// slope walls
					}else if(!mv3d.WALK_OFF_EDGE && (slopeColliders = _tileColliders[[tx,ty,l,'slope']])){
						for (const c of slopeColliders){
							let value=true;
							if(only){ value = only(c); }
							if(value!==false){
								near.push(c);
								if(value==='break'){ return near; }
								continue;
							}
						}
					}else if(!onChar&&(isSlope||hadSlope)){
						continue;
					// don't walk off edges
					}else if(char && !mv3d.WALK_OFF_EDGE && !char.char._mv3d_isFlying()){
						const floatz = mv3d.getPlatformFloatForCharacter(char,tx,ty);
						if(unround(Math.abs(floatz-char.targetElevation))>mv3d.STAIR_THRESH){
							shouldCollide=true; break;
						}
					}
				}
			}
			// add tileCollider if shouldCollide
			if(tileCollider&&shouldCollide){
				let value=true;
				if(only){ value = only(tileCollider); }
				if(value!==false){
					near.push(tileCollider);
					if(value==='break'){ return near; }
					continue;
				}
			}
		}
		// collide with walls
		const colliderList=_tileColliders[[tx,ty]];
		if(colliderList&&!hasSlope&&!isSlope) for(let i = 0; i<colliderList.length; ++i){
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
	const px = (x-0.5)*QMovement.tileSize;
	const py = (y-0.5)*QMovement.tileSize;
	const collider = this.char.collider();

	const x1 = (px+collider._offset.x+1)/QMovement.tileSize;
	const y1 = (py+collider._offset.y+1)/QMovement.tileSize;
	const x2 = (px+collider._offset.x+collider.width-1)/QMovement.tileSize;
	const y2 = (py+collider._offset.y+collider.height-1)/QMovement.tileSize;
	
	this.platform = [
		mv3d.getPlatformForCharacter(this,x1,y1),
		mv3d.getPlatformForCharacter(this,x2,y1),
		mv3d.getPlatformForCharacter(this,x2,y2),
		mv3d.getPlatformForCharacter(this,x1,y2),
	].reduce((a,b)=>a.z2>=b.z2?a:b);
	return this.platform;
}

