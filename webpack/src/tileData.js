import mv3d from './mv3d.js';
import { v2origin, tileSize, degtorad, sin, tileWidth, cos, tileHeight, overload, minmax, file } from './util.js';
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
	mapWidth(){ return this.getDataMap().width; },
	mapHeight(){ return this.getDataMap().height; },
	loopHorizontal(){ return this.getDataMap().scrollType&2; },
	loopVertical(){ return this.getDataMap().scrollType&1; },

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
	SETNUMBERS:{A1:0,A2:1,A3:2,A4:3,A5:4,B:5,C:6,D:7,E:8},
	SETNAMES:['A1','A2','A3','A4','A5','B','C','D','E'],
	getSetName(id){
		return this.SETNAMES[this.getSetNumber(id)];
	},
	getTsImgUrl(name){
		if(name in this.SETNUMBERS){
			const setN = this.SETNUMBERS[name];
			const tsName = $gameMap.tileset().tilesetNames[setN];
			if(!tsName){ return file(mv3d.MV3D_FOLDER,`${mv3d.TEXTURE_ERROR}.png`); }
			return ImageManager.loadTileset(tsName)._url;
		}
		return file(mv3d.MV3D_FOLDER,name);
	},

	getShadowBits(x,y){
		return this.getTileId(x,y,4);
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
		this._tileTextureOffset(conf,'top',tileId,tileId);
		this._tileTextureOffset(conf,'side',tileId,tileId);
		this._tileTextureOffset(conf,'inside',tileId,'side');
		this._tileTextureOffset(conf,'bottom',tileId,'top');
		this._tileTextureOffset(conf,'north',tileId,'side');
		this._tileTextureOffset(conf,'south',tileId,'side');
		this._tileTextureOffset(conf,'east',tileId,'side');
		this._tileTextureOffset(conf,'west',tileId,'side');
		if(!('pass' in conf)){
			conf.pass = this.getTilePassage(tileId,conf);
		}
		return conf;
	},

	_tileTextureOffset(conf,side,tileId,dfault){
		const tileRange = Tilemap.isAutotile(tileId)?48:1;
		let id = conf[`${side}_id`];
		if(id==null){
			let offset = conf[`${side}_offset`];
			if(offset){
				id=conf[`${side}_id`]=tileId+offset.x*tileRange+offset.y*tileRange*8;
			}else{
				if(typeof dfault === 'string'){
					id=conf[`${side}_id`]=conf[`${dfault}_id`];
					conf[`${side}_img`]=conf[`${dfault}_img`];
					if(`${dfault}_rect` in conf){ conf[`${side}_rect`]=conf[`${dfault}_rect`]; }
				}else{
					id=conf[`${side}_id`]=dfault;
				}
			}
		}
		let img = conf[`${side}_img`];
		if(img==null){
			conf[`${side}_img`]=this.getSetName(id);
		}
	},

	getTileId(x,y,l=0){
		const dataMap = this.getDataMap(); if(!dataMap){ return 0; }
		const {data,width,height} = dataMap;
		if(this.loopHorizontal()){ x=x.mod(width); }
		if(this.loopVertical()){ y=y.mod(height); }
		if(x<0||x>=width||y<0||y>=height){
			if(this.getMapConfig('edge')==='clamp'){
				const clamp = this.getMapConfig('edgeData',1);
				if(x>=width){ x=width+(x-width).mod(clamp)-clamp; }
				else if(x<0){x=x.mod(clamp);}
				if(y>=height){ y=height+(y-height).mod(clamp)-clamp; }
				else if(y<0){y=y.mod(clamp);}
			}else{
				return 0; 
			}
		}
		return data[(l * height + y) * width + x] || 0
	},

	getTileData(x,y){
		const dataMap = this.getDataMap(); if(!dataMap){ return [0,0,0,0]; }
		const {data,width,height} = dataMap;
		if(this.loopHorizontal()){
			x=x.mod(width);
		}
		if(this.loopVertical()){
			y=y.mod(height);
		}
		if(x<0||x>=width||y<0||y>=height){
			if(this.getMapConfig('edge')==='clamp'){
				const clamp = this.getMapConfig('edgeData',1);
				if(x>=width){ x=width+(x-width).mod(clamp)-clamp; }
				else if(x<0){x=x.mod(clamp);}
				if(y>=height){ y=height+(y-height).mod(clamp)-clamp; }
				else if(y<0){y=y.mod(clamp);}
			}else{
				return [0,0,0,0]; 
			}
		}
		if(x<0||x>=width||y<0||y>=height){ return [0,0,0,0]; }
		const tileData=[];
		for (let z=0;z<4;++z){//4 tile layers. Ignore shadow bits.
			tileData[z] = data[(z * height + y) * width + x] || 0;
		}
		return tileData;
	},


	getTileHeight(x,y,l=0){

		if(this.loopHorizontal()){ x=x.mod(this.mapWidth()); }
		if(this.loopVertical()){ y=y.mod(this.mapHeight()); }

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

	getTileRot(tileConf,x,y){
		const shadowBits = this.getShadowBits(x,y);
		if(shadowBits in this._SHADOW_ROTS){ return this._SHADOW_ROTS[shadowBits]; }
		return this.getConfig(tileConf,'rot',0);
	},
	_SHADOW_ROTS: {
		0b0011: 180,
		0b1010: 90,
		0b0101: 270,
		0b1100: 0,
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

	getWalkHeight(x,y){
		// get top height at x,y. Used for jumping and initializing z.
		const heights = this.getCollisionHeights(x,y);
		return heights[heights.length-1].z2;
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
		const heights = mv3d.getCollisionHeights(x,y,{layers:true,slopeMin:true}).layers;
		let closest_diff = Infinity;
		let layers = [0];
		for (let l=0; l<=3; ++l){
			if(!(l in heights)){ continue; }
			const conf = this.getTileConfig(x,y,l);
			const isSlope=conf.shape===this.enumShapes.SLOPE;
			const h = heights[l].z2;
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
		const dataMap=this.getDataMap();
		if( !this.getMapConfig('edge',true) &&
			(!this.loopHorizontal()&&(x<0||x>=dataMap.width)
			||!this.loopVertical()&&(y<0||y>=dataMap.height))
			){ return Infinity; }
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
					const slopeDir = this.getSlopeDirection(x,y,l,true).dir;
					if((!opts.dir||opts.dir!==slopeDir)
					&&(!opts.dir2||opts.dir2!==slopeDir)){
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
		return shape===shapes.FENCE||shape===shapes.WALL||shape===shapes.CROSS||shape===shapes.XCROSS||shape===shapes['8CROSS']||shape===shapes.SLOPE;
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