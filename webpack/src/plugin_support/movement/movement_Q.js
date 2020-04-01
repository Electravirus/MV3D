import { override, unround, minmax, radtodeg, degtorad, hvtodir } from "../../util";
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
		const zColliders = mv3d.getCollisionHeights(x,y,{layers:true,slopeMin:true});
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
				const slopeZ2 = mv3d.getStackHeight(x,y,l);
				const slopeZ1 = slopeZ2-(conf.slopeHeight||1);
				//const data = Array.from(QMovement.tileBoxes[flag]);
				let data = QMovement.tileBoxes[dcol];
				const key = [x,y,l,'slope'].toString();
				_tileColliders[key]=[];
				if(data){
					if(data[0].constructor!==Array){ data=[data]; }
					for(const box of data){
						const c = new Box_Collider(box[0]||0,box[1]||0,box[2],box[3]);
						c.slopeZ1=slopeZ1; c.slopeZ2=slopeZ2;
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
			configurable:true,enumerable:false, value: this.mv3d_sprite.getCollider(),
		});
		Object.defineProperty(collider,'mv3d_triggerCollider',{
			configurable:true,enumerable:false, value: this.mv3d_sprite.getTriggerCollider(),
		});
	}
	return collider;
});

function QzCollidersOverlap(c1,c2){
	if(!c1.mv3d_collider||!c2.mv3d_collider){ return true; }
	c1=c1.mv3d_collider; c2=c2.mv3d_collider;
	return zCollidersOverlap(c1,c2);
}
function zCollidersOverlap(c1,c2){
	if(c1.z1<c2.z2&&c1.z2>c2.z1 && c1.z1+mv3d.STAIR_THRESH<c2.z2&&c1.z2+mv3d.STAIR_THRESH>c2.z1){
		return true;
	}
	return false;
}

override(ColliderManager,'getCollidersNear',o=>function getCollidersNear(collider, only, debug){
	// Q colliders
	let isBreak=false;
	const near = o.call(this,collider,c=>{
		if(QzCollidersOverlap(collider,c)===false){ return false; }
		if(collider.mv3d_collider){
			const cx = Math.round(c.x/QMovement.tileSize);
			const cy = Math.round(c.y/QMovement.tileSize);
			if(collider.mv3d_collider.char){
				// if we're standing on a character, ignore Q colliders.
				//const platform = collider.mv3d_collider.char.getPlatform();
				const platform = collider.mv3d_collider.char.getPlatform(cx,cy);
				if(platform.char){ return false; }
			}
			if(c.mv3d_collider){
				// ignore Q colliders not on current layer
				const tileLayers = mv3d.getTileLayers(cx,cy,collider.mv3d_collider.z1+mv3d.STAIR_THRESH);
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
	const x1 = (collider.x+collider._offset.x-1)/QMovement.tileSize;
	const y1 = (collider.y+collider._offset.y-1)/QMovement.tileSize;
	const x2 = (collider.x+collider._offset.x+collider.width+1)/QMovement.tileSize;
	const y2 = (collider.y+collider._offset.y+collider.height+1)/QMovement.tileSize;
	if (collider.mv3d_collider)
	for (let tx = Math.floor(x1); tx < Math.ceil(x2); ++tx)
	for (let ty = Math.floor(y1); ty < Math.ceil(y2); ++ty){
		const colliderList=_tileColliders[[tx,ty]];
		const xCollider = _tileColliders[[tx,ty,'x']];
		let slopeColliders = null;
		let isWall=false;
		const tileLayers = mv3d.getTileLayers(tx,ty,collider.mv3d_collider.z1+mv3d.STAIR_THRESH);
		for(const l of tileLayers){
			if( mv3d.getTilePassage(tx,ty,l)===mv3d.enumPassage.WALL ){ isWall=true; }
			const slopeKey = [tx,ty,l,'slope'].toString();
			if(slopeKey in _tileColliders){ slopeColliders = _tileColliders[slopeKey]; }
		}
		let shouldCollide=false;
		if(xCollider&&collider.mv3d_collider.char){
			const char = collider.mv3d_collider.char;
			const opts = {slopeMin:true};
			const platform = char.getPlatform(tx,ty,opts);
			opts.platform=platform;
			// collide if falling
			if(char.falling&&!char.char._mv3d_isFlying()){ shouldCollide=true; }
			// x passage
			else if(isWall && !platform.char){
				shouldCollide=true;
			}
			// collide slopes
			else if (slopeColliders && !char.platform.char && !platform.char){
				for (const c of slopeColliders){
					if(mv3d.WALK_OFF_EDGE && char.z>c.slopeZ1){ continue; }
					let value=true;
					if(only){ value = only(c); }
					if(value!==false){
						near.push(c);
						if(value==='break'){ return near; }
						continue;
					}
				}
			}
			// collide ledges
			else if(!mv3d.WALK_OFF_EDGE && !char.char._mv3d_isFlying() && (!char.platform||!char.platform.isSlope)
			&& unround(Math.abs(char.getPlatformFloat(tx,ty,opts)-char.targetElevation))>mv3d.STAIR_THRESH){
				shouldCollide=true;
			}
			
			if(shouldCollide){
				let value=true;
				if(only){ value = only(xCollider); }
				if(value!==false){
					near.push(xCollider);
					if(value==='break'){ return near; }
					continue;
				}
			}
		}
		// collide with wall
		if(colliderList) for(let i = 0; i<colliderList.length; ++i){
			if(QzCollidersOverlap(collider,colliderList[i])){
				if(only){
					const value = only(colliderList[i]);
					if(value!==false){ near.push(colliderList[i]); }
					if(value==='break'){ return near; }
				}else{
					near.push(colliderList[i]);
				}
			}
		}
	}
	return near;
});

override(ColliderManager,'getCharactersNear',o=>function(collider, only){
	return o.call(this,collider,char=>{
		const sprite = char.mv3d_sprite; if(!sprite){ return true; }
		const c1 = collider.mv3d_collider;
		const c2 = $gameTemp._mv3d_Q_getCharactersTriggerHeight?sprite.getTriggerHeight():sprite.getCollisionHeight();
		if(!c1||!c2){ return true; }
		if(zCollidersOverlap(c1,c2)===false){ return false; }
		if(only){ return only(char); }
		return true;
	});
});

override(Game_Player.prototype,'startMapEvent',o=>function(x,y,triggers,normal){
	$gameTemp._mv3d_Q_getCharactersTriggerHeight=true;
	o.apply(this,arguments);
	$gameTemp._mv3d_Q_getCharactersTriggerHeight=false;
});

mv3d.Character.prototype.getPlatform=function(x=this.char._realX,y=this.char._realY,opts={}){
	const px = (x-0.5)*QMovement.tileSize;
	const py = (y-0.5)*QMovement.tileSize;
	const collider = this.char.collider();

	const x1 = (px+collider._offset.x+1)/QMovement.tileSize;
	const y1 = (py+collider._offset.y+1)/QMovement.tileSize;
	const x2 = (px+collider._offset.x+collider.width-1)/QMovement.tileSize;
	const y2 = (py+collider._offset.y+collider.height-1)/QMovement.tileSize;
	
	const platform = [
		//mv3d.getPlatformForCharacter(this,x,y),
		mv3d.getPlatformForCharacter(this,x1,y1,opts),
		mv3d.getPlatformForCharacter(this,x2,y1,opts),
		mv3d.getPlatformForCharacter(this,x2,y2,opts),
		mv3d.getPlatformForCharacter(this,x1,y2,opts),
	].reduce((a,b)=>a.z2>=b.z2?a:b);
	return platform;
};

mv3d.getEventsAt=function(x,y){
	let events;
	try{
		events = ColliderManager._characterGrid[Math.round(x)][Math.round(y)];
	}catch(err){
		return [];
	}
	if(!events){ return []; }
	return events.filter(event=>{
		if(!(event instanceof Game_Event) || event.isThrough()){ return false; }
		return true;
	});
};

mv3d.setDestination=function(x,y){
	$gameTemp.setPixelDestination(Math.round(x*$gameMap.tileWidth()), Math.round(y*$gameMap.tileHeight()));
};

const _clearMouseMove = Game_Player.prototype.clearMouseMove;
Game_Player.prototype.clearMouseMove=function(){
	_clearMouseMove.apply(this,arguments);
	if(this._pathfind){
		this.clearPathfind();
	}
}


const _QdiagMap={
	1: [4, 2], 3: [6, 2],
	7: [4, 8], 9: [6, 8]
};
const _QMoveVH=o=>function(dir) {
	if($gameMap.offGrid()){
		this.mv3d_QMoveRadian(dir);
		return;
	}
	dir=mv3d.transformDirection(dir);
	if(dir%2){
		const diag = _QdiagMap[dir];
		this.moveDiagonally(diag[0], diag[1]);
	}else{
		this.moveStraight(dir);
	}
	
};
override(Game_Player.prototype,'moveInputHorizontal',_QMoveVH);
override(Game_Player.prototype,'moveInputVertical',_QMoveVH);
override(Game_Player.prototype,'moveInputDiagonal',_QMoveVH);

Game_Player.prototype.mv3d_QMoveRadian=function(dir,dist=this.moveTiles()){
	this.moveRadian(-degtorad(mv3d.blendCameraYaw.currentValue()+90+mv3d.dirToYaw(dir)),dist);
	//this.mv3d_setDirection(mv3d.transformDirection(dir));
};

override(Game_Character.prototype,'moveRadian',o=>function(radian, dist){
	o.apply(this,arguments);
	const d = mv3d.yawToDir(radtodeg(-radian)-90,true);
	this.mv3d_setDirection(d);
});

override(Game_Character.prototype,'moveDiagonally',o=>function(h,v){
	o.apply(this,arguments);
	const d = hvtodir(h,v);
	this.mv3d_setDirection(d);
});

if(Game_Follower.prototype.updateMoveList)
override(Game_Follower.prototype,'updateMoveList',o=>function(){
	const move = this._moveList[0];
	o.apply(this,arguments);
	if(!move){ return; }
	this.mv3d_setDirection(move[3]);
});