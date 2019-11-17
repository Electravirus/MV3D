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

	getMaterialOptions(tileId){
		const options={};
		/*
		const ttag = this.getTerrainTag(tileId);
		if(ttag && ttag in this.TTAG_DATA){
			const tagdata = this.TTAG_DATA[ttag];
		}
		*/
		const conf = this.tilesetConfigurations[this.normalizeAutotileId(tileId)];
		if(conf){
			if ('alpha' in conf){ options.alpha=conf.alpha; }
			if ('transparent' in conf){ options.transparent=conf.transparent; }
			if ('glow' in conf){ options.glow=conf.glow; }
		}
		return options;
	},

	getTileConfig(tileId){
		//offsets can come either from terrain tag or tileset notes
		let offsetTop = v2origin;
		let offsetSide = v2origin;
		let offsetInside = null;
		let offsetBottom = null;
		const tilemap=this.getTilemap();
		const ret = {
			topId:null,
			sideId:null,
			insideId:null,
			bottomId:null,
			fringe:tilemap&&tilemap._isHigherTile(tileId)?this.FRINGE_HEIGHT:0,
			fringeHeight:0,
		}
		const ttag = this.getTerrainTag(tileId);
		if(ttag && ttag in this.TTAG_DATA){
			const tagdata = this.TTAG_DATA[ttag];
			offsetTop = tagdata.offsetTop;
			offsetSide = tagdata.offsetSide;
			ret.height=tagdata.height; 
			ret.fringeHeight=tagdata.height;
			ret.shape=tagdata.shape;
		}
		const conf = this.tilesetConfigurations[this.normalizeAutotileId(tileId)];
		if(conf){
			if(conf.offsetTop){ offsetTop=conf.offsetTop; }
			if(conf.offsetSide){ offsetSide=conf.offsetSide; }
			if(conf.offsetInside){ offsetInside=conf.offsetInside; }
			if(conf.offsetBottom){ offsetBottom=conf.offsetBottom; }
			if('topId' in conf){ ret.topId=conf.topId; }
			if('sideId' in conf){ ret.sideId=conf.sideId; }
			if('insideId' in conf){ ret.insideId=conf.insideId; }
			if('bottomId' in conf){ ret.bottomId=conf.bottomId; }
			if(conf.rectTop){ ret.rectTop=conf.rectTop; }
			if(conf.rectSide){ ret.rectSide=conf.rectSide; }
			if(conf.rectInside){ ret.rectInside=conf.rectInside; }
			if(conf.rectBottom){ ret.rectBottom=conf.rectBottom; }
			if('shape' in conf){ ret.shape=conf.shape; }
			if('fringe' in conf){ ret.fringe=conf.fringe; }
			if('height' in conf){
				ret.height=conf.height;
				ret.fringeHeight = conf.height;
			}

			ret.hasInsideConf=Boolean(conf.offsetInside||conf.rectInside||('insideId' in conf));
			ret.hasBottomConf=Boolean(conf.offsetBottom||conf.rectBottom||('bottomId' in conf));
		}
		const tileRange = Tilemap.isAutotile(tileId)?48:1;
		if(ret.topId==null){ ret.topId = tileId+offsetTop.x*tileRange+offsetTop.y*tileRange*8; }
		if(ret.sideId==null){ ret.sideId = tileId+offsetSide.x*tileRange+offsetSide.y*tileRange*8; }
		if(ret.insideId==null){ 
			ret.insideId=ret.sideId;
			if(offsetInside){
				ret.insideId=tileId+offsetInside.x*tileRange+offsetInside.y*tileRange*8;
			}
		}
		if(ret.bottomId==null){
			ret.bottomId=ret.topId;
			if(offsetBottom){
				ret.bottomId=tileId+offsetBottom.x*tileRange+offsetBottom.y*tileRange*8;
			}
		}
		return ret;
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

		let defaultHeight = 0;

		const conf = this.tilesetConfigurations[this.normalizeAutotileId(tileId)];
		const region = $gameMap.regionId(x,y);
		if(l===0 && region && region in mv3d.REGION_DATA){
			let height = this.REGION_DATA[region].height;
			if(conf&&'height' in conf&&conf.height<0){
				height+=conf.height;
			}
			return height;
		}
		if(conf){
			if('height' in conf){
				return conf.height;
			}
			if(this.isSpecialShape(conf.shape)){
				defaultHeight=1;
			}
		}
		const ttag=this.getTerrainTag(tileId);
		if(ttag && ttag in this.TTAG_DATA){
			return this.TTAG_DATA[ttag].height;
		}
		if(this.isWallTile(tileId)){
			return this.WALL_HEIGHT;
		}
		if(tilemap&&tilemap._isTableTile(tileId)){
			return this.TABLE_HEIGHT;
		}
		return defaultHeight;
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
		const tileData=this.getTileData(Math.round(x),Math.round(y));
		let height=0;
		let tileHeight=0;
		for(let l=0; l<=3; ++l){
			const tileId=tileData[l];
			if(this.isTileEmpty(tileId)){ continue; }
			height += tileHeight;
			tileHeight = this.getTileHeight(Math.round(x),Math.round(y),l);
			const data = this.getTileConfig(tileId);
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
			const conf = this.tilesetConfigurations[this.normalizeAutotileId(tileId)];
			if(conf && 'float' in conf){
				float += conf.float;
			}
		}
		return float;
	},

	getFringeHeight(x,y,layerId=3){
		let height = this.getStackHeight(x,y,layerId-1);
		const tileId=this.getTileData(x,y)[layerId];
		const conf = this.tilesetConfigurations[this.normalizeAutotileId(tileId)];
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
			const data = this.getTileConfig(tileId);
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