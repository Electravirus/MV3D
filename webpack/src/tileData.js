import mv3d from './mv3d.js';
import { v2origin, tileSize, degtorad, sin, tileWidth, cos, tileHeight, overload } from './util.js';
import { MapCell } from './mapCell.js';

Object.assign(mv3d,{

	_tilemap:null,
	getTilemap(){
		if(SceneManager._scene&&SceneManager._scene._spriteset){
			this._tilemap = SceneManager._scene._spriteset._tilemap;
		}
		return this._tilemap;
	},
	getDataMap(){
		if($dataMap){ this._dataMap=$dataMap }
		return this._dataMap;
	},

	getRegion(x,y){
		return this.getTileId(x,y,5);
	},

	getSetNumber(id){
		if(Tilemap.isAutotile(id)){
			return Tilemap.isTileA1(id)?0
				: Tilemap.isTileA2(id)?1 : Tilemap.isTileA3(id)?2 : 3;
		}else{
			return Tilemap.isTileA5(id)?4:5+Math.floor(id/256);
		}
	},

	getShadowBits(x,y){
		const dataMap = this.getDataMap();
		return dataMap.data[(4 * dataMap.height + y) * dataMap.width + x] || 0;
	},

	getTerrainTag(tileId){
		return $gameMap.tilesetFlags()[tileId]>>12;
	},

	getTilePassage:overload({
		1(tileId){ return this.getTilePassage(tileId,this.getTileConfig(tileId)); },
		2(tileId,conf){
			if('pass' in conf){
				return conf.pass;
			}
			const flag = $gameMap.tilesetFlags()[tileId];
			if( (flag&0x10) ){ return this.enumPassage.THROUGH; }
			if( (flag&0x0f)===0x0f ){ return this.enumPassage.WALL; }
			else{ return this.enumPassage.FLOOR; }
		},
		3(x,y,l){
			const tileId=this.getTileId(x,y,l);
			return this.getTilePassage(tileId,this.getTileConfig(tileId,x,y,l));
		},
		default(tileId,x,y,l){
			return this.getTilePassage(tileId,this.getTileConfig(tileId,x,y,l));
		}
	}),

	getMaterialOptions(conf,side){
		const options={};
		if ('alpha' in conf){ options.alpha=conf.alpha; }
		if ('glow' in conf){ options.glow=conf.glow; }
		if(side){
			if(`${side}_alpha` in conf){ options.alpha=conf[`${side}_alpha`]; }
			if(`${side}_glow` in conf){ options.glow=conf[`${side}_glow`]; }
		}
		if('alpha' in options){ options.transparent=true; }
		return options;
	},

	getTileAnimationData(tileConf,side){
		const tileId=tileConf[`${side}_id`];
		if(`${side}_animData` in tileConf){
			return tileConf[`${side}_animData`];
		}
		const animData={animX:0,animY:0};
		if(Tilemap.isTileA1(tileId)){
			const kind = Tilemap.getAutotileKind(tileId);
			animData.animX=kind<=1?2:kind<=3?0:kind%2?0:2;
			animData.animY=kind<=3?0:kind%2?1:0; 
		}
		return animData;
	},

	getTileConfig:overload({
		3(x,y,l){ return this.getTileConfig(this.getTileData(x,y)[l],x,y,l); },
		default(tileId,x,y,l){
			const conf = {};
			if(!this.isTileEmpty(tileId)){
				const ttag = this.getTerrainTag(tileId);
				if(ttag && ttag in this.TTAG_DATA){
					Object.assign(conf,this.TTAG_DATA[ttag]);
				}
				const ts_conf = this.tilesetConfigurations[this.normalizeAutotileId(tileId)];
				if(ts_conf){
					Object.assign(conf,ts_conf);
				}
			}
			if(l===0){
				const region = this.getRegion(x,y);
				if(region && region in mv3d.REGION_DATA){
					Object.assign(conf,this.REGION_DATA[region]);
				}
			}
			return conf;
		},
	}),

	getTileTextureOffsets(tileId,x,y,l){
		const conf = this.getTileConfig(tileId,x,y,l);
		const tileRange = Tilemap.isAutotile(tileId)?48:1;
		const tilemap = this.getTilemap();
		conf.hasInsideConf=Boolean(conf.inside_offset||conf.rectInside||('inside_id' in conf));
		conf.hasBottomConf=Boolean(conf.bottom_offset||conf.rectBottom||('bottom_id' in conf));
		if(conf.top_id==null){ 
			conf.top_id=tileId;
			if(conf.top_offset){
				conf.top_id = tileId+conf.top_offset.x*tileRange+conf.top_offset.y*tileRange*8;
			}
		 }
		if(conf.side_id==null){
			conf.side_id=tileId;
			if(conf.side_offset){
				conf.side_id = tileId+conf.side_offset.x*tileRange+conf.side_offset.y*tileRange*8;
			}
		}
		if(conf.inside_id==null){ 
			conf.inside_id=conf.side_id;
			if(conf.inside_offset){
				conf.inside_id=tileId+conf.inside_offset.x*tileRange+conf.inside_offset.y*tileRange*8;
			}
		}
		if(conf.bottom_id==null){
			conf.bottom_id=conf.top_id;
			if(conf.bottom_offset){
				conf.bottom_id=tileId+conf.bottom_offset.x*tileRange+conf.bottom_offset.y*tileRange*8;
			}
		}
		return conf;
	},

	getTileId(x,y,l=0){
		const dataMap = this.getDataMap();
		return dataMap.data[(l * dataMap.height + y) * dataMap.width + x] || 0
	},

	getTileData(x,y){
		if(!$dataMap || !$dataMap.data){ return [0,0,0,0]; }
		const data = $dataMap.data;
		const width = $dataMap.width;
		const height = $dataMap.height;
		if($gameMap.isLoopHorizontal()){
			x=x.mod(width);
		}
		if($gameMap.isLoopVertical()){
			y=y.mod(height);
		}
		if(x<0||x>=width||y<0||y>=height){ return [0,0,0,0]; }
		const tileData=[];
		for (let z=0;z<4;++z){//4 tile layers. Ignore shadow bits.
			tileData[z] = data[(z * height + y) * width + x] || 0;
		}
		return tileData;
	},


	getTileHeight(x,y,l=0){
		if(!$dataMap){ return 0; }

		if($gameMap.isLoopHorizontal()){ x=x.mod($dataMap.width); }
		if($gameMap.isLoopVertical()){ y=y.mod($dataMap.height); }

		const tileId=this.getTileData(x,y)[l];
		if(this.isTileEmpty(tileId)&&l>0){ return 0; }
		// finge tiles don't stack normally. fringeHeight property should be used when drawing them.
		//if(this.isStarTile(tileId)){ return 0; }

		const shapes=this.enumShapes;
		const conf =this.getTileConfig(tileId,x,y,l);
		let height = 0;
		if('height' in conf){
			height = conf.height;
		}else if(this.isWallTile(tileId)){
			height = this.WALL_HEIGHT;
		}else if(this.isTableTile(tileId)){
			height = this.TABLE_HEIGHT;
		}else if(this.isSpecialShape(conf.shape)){
			switch(conf.shape){
				case shapes.SLOPE: height=0; break;
				default: height=1; break;
			}
		}
		if('depth' in conf){
			height -= conf.depth;
		}
		if(conf.shape===shapes.SLOPE){
			height += conf.slopeHeight||1;
		}
		return height;
	},

	getStackHeight(x,y,layerId=3){
		let height=0;
		for(let l=0; l<=layerId; ++l){
			height += this.getTileFringe(x,y,l);
			height += this.getTileHeight(x,y,l);
		}
		return height;
	},

	getSlopeDirection(x,y,l,fullData=false){
		const stackHeight = this.getStackHeight(x,y,l);
		const tileId = this.getTileData(x,y)[l];
		const conf = this.getTileConfig(tileId,x,y,l);
		const slopeHeight = conf.slopeHeight||1;
		const neighborPositions = MapCell.neighborPositions;
		const flag = $gameMap.tilesetFlags()[tileId];
		const shadowBits = this.getShadowBits(x,y);
		const shadowBitDirections=[0,0b0011,0b1010,0b0101,0b1100];
		//const shadowBitDirections=[0,0b1100,0b0101,0b1010,0b0011];
		let direction;
		for(let i=0;i<neighborPositions.length;++i){
			const n=neighborPositions[i];
			const d={neighbor: n,favor:0};
			d.dir = 5-3*n.y+n.x;
			const nHeights = this.getCollisionHeights(x+n.x,y+n.y,{slopeMax:true});
			const oHeights = this.getCollisionHeights(x-n.x,y-n.y,{slopeMin:true});
			if(nHeights.some(c=>Math.abs(stackHeight-slopeHeight-c.z2)<=mv3d.STAIR_THRESH)){ d.favor+=1; }
			if(oHeights.some(c=>Math.abs(stackHeight-c.z2)<=mv3d.STAIR_THRESH)){ d.favor+=1; }
			if(flag&(1<<(d.dir/2-1))){ d.favor=-2; }
			if(flag&(1<<((10-d.dir)/2-1))){ d.favor=-1; }
			if((shadowBits&shadowBitDirections[d.dir/2])===shadowBitDirections[d.dir/2]){ d.favor=30; }
			if(conf.slopeDirection===d.dir){ d.favor=100; }
			if(!direction||d.favor>direction.favor){ direction=d; }
		}
		direction.rot=degtorad(180-this.dirToYaw(direction.dir));
		if(fullData){ return direction; }
		return direction.rot;
	},

	getWalkHeight(x,y,ignoreSlopes=false){
		// get the height of characters for given x,y coord. Uses float coords. Should support ramps.
		const rx=Math.round(x), ry=Math.round(y);
		const tileData=this.getTileData(rx,ry);
		let height=0;
		let lastHeight=0;
		for(let l=0; l<=3; ++l){
			const tileId=tileData[l];
			if(this.isTileEmpty(tileId)&&l>0){ continue; }
			height += lastHeight;
			const data = this.getTileConfig(tileId,rx,ry,l);
			const shape = data.shape;
			if(shape===this.enumShapes.SLOPE){
				if(ignoreSlopes){
					lastHeight=data.slopeHeight||1;
					height+=this.getTileHeight(rx,ry,l) - lastHeight;
				}else{
					const slopeHeight = this.getSlopeHeight(x,y,l,data);
					height+=this.getTileHeight(rx,ry,l)-(data.slopeHeight||1)+slopeHeight;
					lastHeight=0;
				}
			}else{
				lastHeight = this.getTileHeight(rx,ry,l);
			}
			lastHeight += this.getTileFringe(rx,ry,l);
			if(!this.isSpecialShape(shape)){
				height+=lastHeight;
				lastHeight=0;
			}
		}
		return height;
		
	},

	getSlopeHeight(x,y,l,data=null){
		const rx=Math.round(x), ry=Math.round(y);
		if(data==null){ data = this.getTileConfig(this.getTileData(rx,ry)[l],rx,ry,l); }
		const rot=this.getSlopeDirection(rx,ry,l);
		const xf=sin(rot), yf=-cos(rot);
		let px=(x+0.5)%1, py=(y+0.5)%1;
		if(Math.sign(xf<0)){ px=1-px; }
		if(Math.sign(yf<0)){ py=1-py; }
		const sf=Math.abs(xf)*px + Math.abs(yf)*py;
		return (data.slopeHeight||1)*sf;
	},

	getCollisionHeights(x,y,opts={}){
		const rx=Math.round(x),ry=Math.round(y);
		let z = 0;
		const collisions=[{z1:-Infinity,z2:0}];
		if(opts.layers){ collisions.layers=[]; }
		const tileData=this.getTileData(rx,ry);
		for(let l=0; l<=3; ++l){
			let h = this.getTileHeight(rx,ry,l);
			const tileId=tileData[l];
			const conf = this.getTileConfig(tileId,rx,ry,l);
			const shape = conf.shape;
			const passage = this.getTilePassage(tileId,conf);
			let skip = false;
			if(passage===this.enumPassage.THROUGH){
				h=0; skip=true;
			}else if(shape===this.enumShapes.SLOPE){
				if(opts.slopeMax){
					h = h;
				}else if(opts.slopeMin){
					h = h-(conf.slopeHeight||1);
				}else{
					h = h-(conf.slopeHeight||1)+this.getSlopeHeight(x,y,l,conf);
				}
			}
			const fringe = this.getTileFringe(rx,ry,l);
			z+=fringe;
			if(skip){ continue; }
			if(h<0){
				if(fringe+h<0){
					collisions[collisions.length-1].z2+=fringe+h;
				}
			}else if(l===0){
				collisions[0].z2=z+h;
			}else{
				collisions.push({z1:z,z2:z+h});
			}
			z+=h;
			if(opts.layers){ collisions.layers[l]=collisions[collisions.length-1]; }
			if(shape===this.enumShapes.SLOPE){ collisions[collisions.length-1].isSlope=true; }
		}
		return collisions;
	},

	getTileLayers(x,y,z,gte=true){
		let closest_diff = Infinity;
		let layers = [0];
		let h=0;
		//const tileData = this.getTileData(x,y);
		for (let l=0; l<=3; ++l){
			//if($gameMap.tilesetFlags()[tileData[l]]&0x10){ continue; }
			if(this.getTilePassage(x,y,l)===this.enumPassage.THROUGH){ continue; }
			const fringe=this.getTileFringe(x,y,l);
			const height=this.getTileHeight(x,y,l);
			const conf = this.getTileConfig(x,y,l);
			h+=fringe+height;
			const isSlope=conf.shape===this.enumShapes.SLOPE;
			if(isSlope){
				h-=conf.slopeHeight||1;
			}
			const diff = z-h;
			if( gte ? z>=h : z>h ){
				if(diff<closest_diff||isSlope&&diff<=closest_diff){
					layers=[l];
					closest_diff=diff;
				}else if(diff===closest_diff){
					layers.push(l);
				}
			}
		}
		return layers;
	},

	getFloatHeight(x,y,z=null,gte=true){
		const tileData=this.getTileData(x,y);
		const layers = z==null?[0,1,2,3]:this.getTileLayers(x,y,z,gte);
		let float=0;
		for(const l of layers){
			const tileId=tileData[l];
			if(this.isTileEmpty(tileId)){ continue; }
			const conf = this.getTileConfig(tileId,x,y,l);
			if(conf && 'float' in conf){
				float += conf.float;
			}
		}
		return float;
	},

	getStackFringeHeight(x,y,l=3){
		return this.getStackHeight(x,y,l);
	},

	getTileFringe(x,y,l){
		const tileId=this.getTileData(x,y)[l];
		if(this.isTileEmpty(tileId)){ return 0; }
		const conf = this.getTileConfig(tileId,x,y,l);
		if(conf && 'fringe' in conf){ return conf.fringe; }
		if(this.isStarTile(tileId)){
			return this.FRINGE_HEIGHT;
		}
		return 0;
	},

	getCullingHeight(x,y,layerId=3,opts={}){
		const tileData=this.getTileData(x,y);
		let height=0;
		for(let l=0; l<=layerId; ++l){
			if(this.getTileFringe(x,y,l)){ return height; }
			const tileId=tileData[l];
			const data = this.getTileConfig(tileId,x,y,l);
			const shape = data.shape;
			if(this.isSpecialShape(shape)){
				if(shape===this.enumShapes.SLOPE){
					height+=this.getTileHeight(x,y,l);
					if(!opts.dir||opts.dir!==this.getSlopeDirection(x,y,l,true).dir){
						height-=data.slopeHeight||1;
					}
				}
				return height;
			}
			if(opts.ignorePits&&data.depth>0){
				height+=data.depth;
			}
			height+=this.getTileHeight(x,y,l);
		}
		return height;
	},

	tileHasPit(x,y,layerId=3){
		const tileData=this.getTileData(x,y);
		for(let l=0; l<=layerId; ++l){
			const tileId=tileData[l];
			const conf = this.getTileConfig(tileId,x,y,l);
			if(conf.depth>0){ return true; }
		}
		return false;
	},

	isTilePit(x,y,l){
		const tileId=this.getTileData(x,y)[l];
		const conf = this.getTileConfig(tileId,x,y,l);
		return conf.depth>0;
	},

	getTileRects(tileId){
		const rects = [];
		const tilemap=this.getTilemap();
		const isTable=tilemap._isTableTile(tileId);
		tilemap._drawTile({addRect:(sheetId,sx,sy,dx,dy,width,height,animX,animY)=>{
			rects.push({setN:sheetId,x:sx,y:sy,width:width,height:height,ox:dx,oy:dy});
		}}, tileId, 0,0);
		if (isTable) for (let i=rects.length-1;i>=0;--i){
			if(rects[i].oy>tileSize()/2){
				rects[i-1].y+=tileSize()*2/3;
				rects.splice(i,1);
			}
		}
		return rects;
	},

	isTileEmpty(tileId){
		return !tileId||tileId===1544;
	},

	isWallTile(tileId){
		const kind = Tilemap.getAutotileKind(tileId);
		const ty = Math.floor(kind / 8);
		const isWall = Tilemap.isTileA3(tileId) || Tilemap.isTileA4(tileId);
		if (isWall && ty%2){ return 2; }
		return isWall;
	},

	isTableTile(tileId){
		return Boolean(Tilemap.isTileA2(tileId) && ($gameMap.tilesetFlags()[tileId] & 0x80));
	},

	isStarTile(tileId){
		return Boolean($gameMap.tilesetFlags()[tileId] & 0x10);
	},

	isWaterfallTile(tileId){
		const kind = Tilemap.getAutotileKind(tileId);
		return Tilemap.isTileA1(tileId)&&kind>=4&&kind%2;
	},

	isSpecialShape(shape){
		const shapes = mv3d.enumShapes;
		return shape===shapes.FENCE||shape===shapes.CROSS||shape===shapes.XCROSS||shape===shapes.SLOPE;
	},
	isPlatformShape(shape){
		const shapes = mv3d.enumShapes;
		return shape==null||shape===shapes.FLAT||shape===shapes.SLOPE;
	},

	constructTileId(img,x,y){
		const key = `TILE_ID_${img.toUpperCase()}`
		let tileId = key in Tilemap ? Tilemap[key] : 0;
		const tileRange = Tilemap.isAutotile(tileId) ? 48 : 1;
		tileId += Number(x)*tileRange + Number(y)*tileRange*8;
		return tileId;
	},
	normalizeAutotileId(tileId){
		if(!Tilemap.isAutotile(tileId)){ return tileId; }
		const kind = Tilemap.getAutotileKind(tileId);
		return Tilemap.TILE_ID_A1 + kind*48;
	},

});