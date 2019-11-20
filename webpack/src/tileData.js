import mv3d from './mv3d.js';
import { v2origin, tileSize } from './util.js';

Object.assign(mv3d,{

	_tilemap:null,
	getTilemap(){
		if(SceneManager._scene&&SceneManager._scene._spriteset){
			this._tilemap = SceneManager._scene._spriteset._tilemap;
		}
		return this._tilemap;
	},

	getSetNumber(id){
		if(Tilemap.isAutotile(id)){
			return Tilemap.isTileA1(id)?0
				: Tilemap.isTileA2(id)?1 : Tilemap.isTileA3(id)?2 : 3;
		}else{
			return Tilemap.isTileA5(id)?4:5+Math.floor(id/256);
		}
	},

	getTerrainTag(tileId){
		return $gameMap.tilesetFlags()[tileId]>>12;
	},

	getMaterialOptions(tileId,x,y,l){
		const options={};
		/*
		const ttag = this.getTerrainTag(tileId);
		if(ttag && ttag in this.TTAG_DATA){
			const tagdata = this.TTAG_DATA[ttag];
		}
		*/
		const conf = this.getTileConfig(tileId,x,y,l);
		if(conf){
			if ('alpha' in conf){ options.alpha=conf.alpha; }
			if ('transparent' in conf){ options.transparent=conf.transparent; }
			if ('glow' in conf){ options.glow=conf.glow; }
		}
		return options;
	},

	getTileAnimationData(tileId){
		const animData={animX:0,animY:0};
		if(Tilemap.isTileA1(tileId)){
			const kind = Tilemap.getAutotileKind(tileId);
			animData.animX=kind<=1?2:kind<=3?0:kind%2?0:2;
			animData.animY=kind<=3?0:kind%2?1:0; 
		}
		return animData;
	},

	getTileConfig(tileId,x,y,l){
		const conf = {};
		const ttag = this.getTerrainTag(tileId);
		if(ttag && ttag in this.TTAG_DATA){
			Object.assign(conf,this.TTAG_DATA[ttag]);
		}
		const ts_conf = this.tilesetConfigurations[this.normalizeAutotileId(tileId)];
		if(ts_conf){
			Object.assign(conf,ts_conf);
		}
		if(l===0){
			const region = $gameMap.regionId(x,y);
			if(region && region in mv3d.REGION_DATA){
				Object.assign(conf,this.REGION_DATA[region]);
			}
		}
		return conf;
	},

	getTileTextureOffsets(tileId,x,y,l){
		const conf = this.getTileConfig(tileId,x,y,l);
		const tileRange = Tilemap.isAutotile(tileId)?48:1;
		const tilemap = this.getTilemap();
		conf.hasInsideConf=Boolean(conf.offsetInside||conf.rectInside||('insideId' in conf));
		conf.hasBottomConf=Boolean(conf.offsetBottom||conf.rectBottom||('bottomId' in conf));
		if(conf.topId==null){ 
			conf.topId=tileId;
			if(conf.offsetTop){
				conf.topId = tileId+conf.offsetTop.x*tileRange+conf.offsetTop.y*tileRange*8;
			}
		 }
		if(conf.sideId==null){
			conf.sideId=tileId;
			if(conf.offsetSide){
				conf.sideId = tileId+conf.offsetSide.x*tileRange+conf.offsetSide.y*tileRange*8;
			}
		}
		if(conf.insideId==null){ 
			conf.insideId=conf.sideId;
			if(conf.offsetInside){
				conf.insideId=tileId+conf.offsetInside.x*tileRange+conf.offsetInside.y*tileRange*8;
			}
		}
		if(conf.bottomId==null){
			conf.bottomId=conf.topId;
			if(conf.offsetBottom){
				conf.bottomId=tileId+conf.offsetBottom.x*tileRange+conf.offsetBottom.y*tileRange*8;
			}
		}
		conf.fringeHeight=conf.height||0;
		if(conf.fringe==null){
			conf.fringe = !this.isTileEmpty(tileId)&&tilemap&&tilemap._isHigherTile(tileId)?this.FRINGE_HEIGHT:0;
		}
		return conf;
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
		if(this.isTileEmpty(tileId)){ return 0; }
		// finge tiles don't stack normally. fringeHeight property should be used when drawing them.
		const tilemap=this.getTilemap();
		if(tilemap&&tilemap._isHigherTile(tileId)){ return 0; }

		const conf =this.getTileConfig(tileId,x,y,l);
		if('regionHeight' in conf){
			let height = conf.regionHeight;
			if(conf.height<0){ height += conf.height; }
			return height;
		}
		if('height' in conf){
			return conf.height;
		}

		if(this.isWallTile(tileId)){
			return this.WALL_HEIGHT;
		}
		if(tilemap&&tilemap._isTableTile(tileId)){
			return this.TABLE_HEIGHT;
		}
		if(this.isSpecialShape(conf.shape)){
			return 1;
		}
		return 0;
	},

	getStackHeight(x,y,layerId=3){
		let height=0;
		for(let l=0; l<=layerId; ++l){
			height+=this.getTileHeight(x,y,l);
		}
		return height;
	},

	getWalkHeight(x,y){
		// get the height of characters for given x,y coord. Uses float coords. Should support ramps.
		const rx=Math.round(x), ry=Math.round(y);
		const tileData=this.getTileData(rx,ry);
		let height=0;
		let tileHeight=0;
		for(let l=0; l<=3; ++l){
			const tileId=tileData[l];
			if(this.isTileEmpty(tileId)){ continue; }
			height += tileHeight;
			tileHeight = this.getTileHeight(rx,ry,l);
			const data = this.getTileConfig(tileId,rx,ry,l);
			const shape = data.shape;
			if(!this.isSpecialShape(shape)){
				height+=tileHeight;
				tileHeight=0;
			}
		}
		return height;
		
	},

	getFloatHeight(x,y){
		const tileData=this.getTileData(x,y);
		let float=0;
		for(let l=0; l<=3; ++l){
			const tileId=tileData[l];
			if(this.isTileEmpty(tileId)){ continue; }
			const conf = this.getTileConfig(tileId,x,y,l);
			if(conf && 'float' in conf){
				float += conf.float;
			}
		}
		return float;
	},

	getFringeHeight(x,y,l=3){
		let height = this.getStackHeight(x,y,l-1);
		const tileId=this.getTileData(x,y)[l];
		const conf = this.getTileConfig(tileId,x,y,l);
		if(conf && this.getTilemap()._isHigherTile(tileId)){
			return height + (conf.fringe||this.FRINGE_HEIGHT) + (conf.height||0);
		}
		return 0;
	},

	getCullingHeight(x,y,layerId=3,ignorePits=false){
		const tileData=this.getTileData(x,y);
		let height=0;
		for(let l=0; l<=layerId; ++l){
			const tileId=tileData[l];
			const data = this.getTileConfig(tileId,x,y,l);
			const shape = data.shape;
			if(this.isSpecialShape(shape)){
				return height;
			}
			if(ignorePits&&data.height<0){
				height-=data.height;
			}
			height+=this.getTileHeight(x,y,l);
		}
		return height;
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
		return Boolean(this.getTilemap()._isTableTile(tileId));
	},

	isFringeTile(tileId){
		return Boolean(this.getTilemap()._isHigherTile(tileId));
	},

	isWaterfallTile(tileId){
		const kind = Tilemap.getAutotileKind(tileId);
		return Tilemap.isTileA1(tileId)&&kind>=4&&kind%2;
	},

	isSpecialShape(shape){
		const shapes = mv3d.configurationShapes;
		return shape===shapes.FENCE||shape===shapes.CROSS||shape===shapes.XCROSS;
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