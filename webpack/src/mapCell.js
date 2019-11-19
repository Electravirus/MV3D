import mv3d from './mv3d.js';
import { TransformNode, Mesh, MeshBuilder, Vector3, Vector2, FRONTSIDE, BACKSIDE, WORLDSPACE, LOCALSPACE, DOUBLESIDE, Plane } from "./mod_babylon.js";
import { tileSize, XAxis, YAxis, tileWidth, tileHeight, sleep, snooze } from './util.js';

const SOURCEPLANE_GROUND = new Plane(0, 1, -Math.pow(0.1,100), 0);
const SOURCEPLANE_WALL = new Plane(0,0,-1,0);

export class MapCell extends TransformNode{
	constructor(cx,cy){
		const key = [cx,cy].toString();
		super(`MapCell[${key}]`,mv3d.scene);
		this.parent=mv3d.map;
		//mv3d.cells[key]=this;
		this.cx=cx; this.cy=cy;
		this.ox=cx*mv3d.CELL_SIZE; this.oy=cy*mv3d.CELL_SIZE;
		this.x=this.ox; this.y=this.oy;
		this.key=key;

		//this.load();
	}
	update(){
		const loopPos = mv3d.loopCoords((this.cx+0.5)*mv3d.CELL_SIZE,(this.cy+0.5)*mv3d.CELL_SIZE);
		this.x=loopPos.x-mv3d.CELL_SIZE/2;
		this.y=loopPos.y-mv3d.CELL_SIZE/2;
	}
	getCachedMesh(width=1,height=1,side=FRONTSIDE,isWall=false){
		const key = `${width},${height}|${side}|${+isWall}`;
		let mesh;
		if(key in MapCell.meshCache){
			mesh=MapCell.meshCache[key].clone();
		}else{
			mesh = MeshBuilder.CreatePlane('tile',{
				sideOrientation: side,
				width:width, height:height,
				//subdivisions:1,
				sourcePlane: isWall ? SOURCEPLANE_WALL : SOURCEPLANE_GROUND,
			},mv3d.scene);
			MapCell.meshCache[key]=mesh;
			mv3d.scene.removeMesh(mesh);
			mesh=mesh.clone();
		}
		this.submeshes.push(mesh);
		mesh.parent=this;
		return mesh;
	}
	createMesh(width=1,height=1,side=FRONTSIDE, isWall=false){
		const mesh = MeshBuilder.CreatePlane('tile',{
			sideOrientation: side,
			width:width, height:height,
			//subdivisions:1,
			sourcePlane: isWall ? SOURCEPLANE_WALL : SOURCEPLANE_GROUND,
		},mv3d.scene);
		this.submeshes.push(mesh);
		mesh.parent=this;
		return mesh;
	}
	async load(){
		const shapes = mv3d.configurationShapes;
		this.submeshes=[];
		// load all tiles in mesh
		const cellWidth = Math.min(mv3d.CELL_SIZE,$gameMap.width()-this.cx*mv3d.CELL_SIZE);
		const cellHeight = Math.min(mv3d.CELL_SIZE,$gameMap.height()-this.cy*mv3d.CELL_SIZE);
		const ceiling = {
			bottomId: mv3d.getMapConfig('ceiling',0),
			height:  mv3d.getMapConfig('ceilingHeight',mv3d.CEILING_HEIGHT),
			cull: false,
		}
		for (let y=0; y<cellHeight; ++y)
		for (let x=0; x<cellWidth; ++x){
			ceiling.cull=false;
			let nlnowall = 0; // the number of layers in a row that haven't had walls.
			const tileData = mv3d.getTileData(this.ox+x,this.oy+y);
			for (let l=0; l<4; ++l){
				if(mv3d.isTileEmpty(tileData[l])){ continue; }
				let z = mv3d.getStackHeight(this.ox+x,this.oy+y,l);
				const tileConf = mv3d.getTileTextureOffsets(tileData[l],x,y,l);
				const shape = tileConf.shape;
				tileConf.realId = tileData[l];
				//tileConf.isAutotile = Tilemap.isAutotile(tileData[l]);
				//tileConf.isFringe = mv3d.isFringeTile(tileData[l]);
				//tileConf.isTable = mv3d.isTableTile(tileData[l]);
				const wallHeight = mv3d.getTileHeight(this.ox+x,this.oy+y,l)||tileConf.height||0;
				z+=tileConf.fringe;
				if(mv3d.isFringeTile(tileData[l])){ z+=tileConf.fringeHeight; }
				if(!shape||shape===shapes.FLAT){
					this.loadTile(tileConf,x,y,z,l);
					//decide if we need to draw bottom of tile
					if(tileConf.hasBottomConf||tileConf.height>0&&(l>0||tileConf.fringe>0)){

					}
					//decide whether to draw walls
					if(wallHeight){
						this.loadWalls(tileConf,x,y,z,l,wallHeight + nlnowall*mv3d.LAYER_DIST);
						nlnowall=0;
					}else{
						++nlnowall;
					}
					if(z>=ceiling.height){ ceiling.cull=true; }
				}else{ nlnowall=0; }
				if(shape===shapes.FENCE){
					this.loadFence(tileConf,x,y,z,l,wallHeight);
				}else if(shape===shapes.CROSS||shape===shapes.XCROSS){
					this.loadCross(tileConf,x,y,z,l,wallHeight);
				}
			}
			if(!mv3d.isTileEmpty(ceiling.bottomId) && !ceiling.cull){
				this.loadTile(ceiling,x,y,ceiling.height,0,true);
			}

			await sleep();
			if(!mv3d.mapLoaded){ this.earlyExit(); return; }
		}
		// merge meshes
		if(this.submeshes.length){
			this.submeshes.forEach(mesh=>mesh.parent=null);
			this.mesh=Mesh.MergeMeshes(this.submeshes,true,undefined,undefined,false,true);
		}else{
			console.warn("MV3D: Created empty map cell!");
			this.mesh = new Mesh("empty mesh",mv3d.scene);
		}
		this.mesh.parent=this;
		delete this.submeshes;
	}
	earlyExit(){
		console.warn(`MV3D: Map cleared before cell[${this.cx},${this.cy}] finished loading.`)
		if(this.submeshes){
			for (const mesh of this.submeshes){
				mesh.dispose();
			}
			this.submeshes.length=0;
		}

	}
	loadTile(tileConf,x,y,z,l,ceiling=false){
		const tileId = ceiling?tileConf.bottomId:tileConf.topId;
		const configRect = ceiling?tileConf.rectTop:tileConf.rectBottom;
		const isAutotile = Tilemap.isAutotile(tileId);
		const setN = mv3d.getSetNumber(tileId);
		let rects;
		if(configRect){
			rects=[configRect];
		}else{
			rects = mv3d.getTileRects(tileId);
		}
		for (const rect of rects){
			const mesh = this.getCachedMesh(1-isAutotile/2,1-isAutotile/2,ceiling?BACKSIDE:FRONTSIDE);
			mesh.material = mv3d.getCachedTileMaterial(setN,rect.x,rect.y,rect.width,rect.height, mv3d.getMaterialOptions(tileId));
			mesh.x = x + (rect.ox|0)/tileSize() - 0.25*isAutotile;
			mesh.y = y + (rect.oy|0)/tileSize() - 0.25*isAutotile;
			mesh.z = z + l*mv3d.LAYER_DIST;
		}
	}
	loadWalls(tileConf,x,y,z,l,wallHeight){
		const realWallHeight = wallHeight;
		const isFringe = mv3d.isFringeTile(tileConf.realId);
		for (let ni=0; ni<MapCell.neighborPositions.length; ++ni){
			const np = MapCell.neighborPositions[ni];
			// don't render walls on edge of map (unless it loops)
			if( !mv3d.getMapConfig('edge',true) )
			if((this.ox+x+np.x>=$dataMap.width||this.ox+x+np.x<0)&&!$gameMap.isLoopHorizontal()
			||(this.oy+y+np.y>=$dataMap.height||this.oy+y+np.y<0)&&!$gameMap.isLoopVertical()){
				continue;
			}
			if(tileConf.height<0 && z<mv3d.getStackHeight(this.ox+x+np.x,this.oy+y+np.y,l)){
				wallHeight=tileConf.height;
			}else{
				wallHeight=realWallHeight;
			}
			let tileId=tileConf.sideId;
			let configRect;
			if(wallHeight<0 && tileConf.hasInsideConf){
				tileId=tileConf.insideId;
				if(tileConf.rectInside){ configRect = tileConf.rectInside; }
			}else{
				if(tileConf.rectSide){ configRect = tileConf.rectSide; }
			}
			const setN = mv3d.getSetNumber(tileId);

			let neededHeight=wallHeight;
			if(isFringe){
				const neighborHeight = mv3d.getFringeHeight(this.ox+x+np.x,this.oy+y+np.y,l);
				if(neighborHeight===z){ continue; }
			}else{
				const neighborHeight = mv3d.getCullingHeight(this.ox+x+np.x,this.oy+y+np.y,l,!(tileConf.height<0));
				if(wallHeight>0&&neighborHeight>=z
				||wallHeight<0&&neighborHeight<=z){ continue; }
				//neededHeight = Math.min(wallHeight, z-neighborHeight);
				neededHeight = Math.min(Math.abs(wallHeight), Math.abs(z-neighborHeight))*Math.sign(wallHeight);
			}
			const sign = Math.sign(neededHeight);
			const wallPos = new Vector3( x+np.x/2, y+np.y/2, z );
			const rot = Math.atan2(np.x, np.y);
			if(configRect || !Tilemap.isAutotile(tileId)){
				const rect = configRect ? configRect : mv3d.getTileRects(tileId)[0];
				const mesh = this.getCachedMesh(1,neededHeight,FRONTSIDE,true);
				if(neededHeight<0){ mesh.scaling.y*=-1; }
				mesh.material = mv3d.getCachedTileMaterial(setN,rect.x,rect.y,rect.width,rect.height, mv3d.getMaterialOptions(tileId));
				//mesh.rotate(XAxis,-Math.PI/2,WORLDSPACE);
				mesh.rotate(YAxis,-rot,WORLDSPACE);
				mesh.x=wallPos.x;
				mesh.y=wallPos.y;
				mesh.z= z - neededHeight/2;
			}else{ // Autotile
				const npl=MapCell.neighborPositions[(+ni-1).mod(4)];
				const npr=MapCell.neighborPositions[(+ni+1).mod(4)];
				const leftHeight = mv3d.getStackHeight(this.ox+x+npl.x,this.oy+y+npl.y,l);
				const rightHeight = mv3d.getStackHeight(this.ox+x+npr.x,this.oy+y+npr.y,l);
				const {x:bx,y:by} = this.getAutotileCorner(tileId,tileConf.realId);
				let wallParts=Math.abs(Math.round(neededHeight*2));
				let partHeight=Math.abs(neededHeight/wallParts);
				let sw = tileSize()/2;
				let sh = tileSize()/2;
				if(mv3d.isTableTile(tileConf.realId)){
					sh=tileSize()/3;
					wallParts=1;
					partHeight=wallHeight;
					//partHeight=neededHeight;
				}
				for (let ax=-1; ax<=1; ax+=2){
					for(let az=0;az<wallParts;++az){
						let hasLeftEdge,hasRightEdge;
						if(mv3d.isTableTile(tileConf.realId)){
							hasLeftEdge = leftHeight!=z;
							hasRightEdge = rightHeight!=z;
						}if(wallHeight<0){
							hasLeftEdge = true;
							hasRightEdge = true;
						}else{
							hasLeftEdge = leftHeight<z-az*partHeight;
							hasRightEdge = rightHeight<z-az*partHeight;
						}
						let sx,sy;
						sx=bx*tileSize();
						sy=by*tileSize();
						sx=(bx+(ax>0?0.5+hasRightEdge:1-hasLeftEdge))*tileSize();
						if(neededHeight<0){
							sx=(bx+(ax>0?0+hasLeftEdge:1.5-hasRightEdge))*tileSize();
						}
						if(mv3d.isWaterfallTile(tileId)){
							sy=(by+az%2/2)*tileSize();
						}else if(mv3d.isTableTile(tileId)){
							sy=(by+5/3)*tileSize();
						}else{
							sy=(by+(az===0?0:az===wallParts-1?1.5:1-az%2*0.5))*tileSize();
						}
						const mesh = this.getCachedMesh(0.5,partHeight,wallHeight<0?BACKSIDE:FRONTSIDE,true);
						//mesh.rotate(XAxis,-Math.PI/2,WORLDSPACE);
						mesh.rotate(YAxis,-rot,WORLDSPACE);
						mesh.x=wallPos.x;
						mesh.y=wallPos.y;
						mesh.z= z - partHeight*sign/2 - partHeight*sign*az + l*mv3d.LAYER_DIST;
						mesh.translate(XAxis,0.25*ax,LOCALSPACE);
						mesh.material = mv3d.getCachedTileMaterial(setN,sx,sy,sw,sh, mv3d.getMaterialOptions(tileId));
					}
				}
			}
		}
	}
	loadFence(tileConf,x,y,z,l,wallHeight){
		const tileId = tileConf.sideId;
		const configRect = tileConf.rectSide;
		const setN = mv3d.getSetNumber(tileId);
		const isAutotile = Tilemap.isAutotile(tileId);
		const edges = [];
		for (let ni=0; ni<MapCell.neighborPositions.length; ++ni){
			const np = MapCell.neighborPositions[ni];
			const neighborHeight = mv3d.getTileHeight(this.ox+x+np.x,this.oy+y+np.y,l);
			if(neighborHeight!==wallHeight){ edges.push(ni); }
		}
		for (let ni=0; ni<MapCell.neighborPositions.length; ++ni){
			const np = MapCell.neighborPositions[ni];

			const edge = edges.includes(ni);
			if(edge&&edges.length<4&&!isAutotile){ continue; }

			const rightSide = np.x>0||np.y>0;
			let rot = Math.atan2(np.x, np.y)+Math.PI/2;
			if(rightSide){
				rot-=Math.PI;
			}

			if(isAutotile&&!configRect){
				const {x:bx,y:by} = this.getAutotileCorner(tileId,tileConf.realId);
				for (let az=0;az<=1;++az){
					const mesh = this.getCachedMesh(0.5,wallHeight/2,DOUBLESIDE,true);
					//mesh.rotate(XAxis,-Math.PI/2,WORLDSPACE);
					mesh.rotate(YAxis,-rot,WORLDSPACE);
					mesh.material = mv3d.getCachedTileMaterial(setN,
						(edge ? (bx+rightSide*1.5) : (bx+1-rightSide*0.5) )*tileWidth(),
						(by+az*1.5)*tileHeight(),
						tileWidth()/2,
						tileHeight()/2,
						mv3d.getMaterialOptions(tileId));
					mesh.x=x+np.x/4;
					mesh.y=y+np.y/4;
					mesh.z=z-wallHeight/4-az*wallHeight/2;
				}
			}else{
				const rect = configRect ? configRect : mv3d.getTileRects(tileId)[0];
				const mesh = this.getCachedMesh(0.5,wallHeight,DOUBLESIDE,true);
				//mesh.rotate(XAxis,-Math.PI/2,WORLDSPACE);
				mesh.rotate(YAxis,-rot,WORLDSPACE);
				mesh.material = mv3d.getCachedTileMaterial(setN,
					rect.x+rect.width/2*rightSide,
					rect.y,
					rect.width/2,
					rect.height,
					mv3d.getMaterialOptions(tileId));
					mesh.x=x+np.x/4;
					mesh.y=y+np.y/4;
					mesh.z=z-wallHeight/2;
			}
		}
	}
	loadCross(tileConf,x,y,z,l,wallHeight){
		const tileId = tileConf.sideId;
		const configRect = tileConf.rectSide;
		const setN = mv3d.getSetNumber(tileId);
		const isAutotile = Tilemap.isAutotile(tileId);
		let rects;
		if(configRect){
			rects=[configRect];
		}else{
			rects = mv3d.getTileRects(tileId);
		}
		const rot = tileConf.shape===mv3d.configurationShapes.XCROSS ? Math.PI/4 : 0;
		const partHeight = isAutotile ? wallHeight/2 : wallHeight;
		for (let i=0; i<=1; ++i){
			for (const rect of rects){
				const mesh = this.getCachedMesh(1-isAutotile/2,partHeight,DOUBLESIDE,true);
				mesh.x = x;
				mesh.y = y;
				mesh.z = z - (rect.oy|0)/tileHeight()*wallHeight - partHeight/2;
				mesh.rotate(YAxis,-Math.PI/2*i+rot,WORLDSPACE);
				mesh.translate(XAxis,-0.25*isAutotile+(rect.ox|0)/tileWidth(),LOCALSPACE);
				mesh.material = mv3d.getCachedTileMaterial(setN,rect.x,rect.y,rect.width,rect.height, mv3d.getMaterialOptions(tileId));
			}
		}
	}
	getAutotileCorner(tileId,realId=tileId){
		const kind = Tilemap.getAutotileKind(tileId);
		let tx = kind%8;
		let ty = Math.floor(kind / 8);
		if(tileId===realId && mv3d.isWallTile(tileId)==1){ ++ty; }
		var bx,by;
		bx=tx*2;
		by=ty;
		if(Tilemap.isTileA1(tileId)){
			if(kind<4){
				by=3*(kind%2)+1;
				bx=6*Math.floor(kind/2);
			}else{
				bx=8*Math.floor(tx/4) + (kind%2)*6;
				by=ty*6 + Math.floor(tx%4/2)*3 + 1-(tx%2);
			}
		}else if(Tilemap.isTileA2(tileId)){
			by=(ty-2)*3+1;
		}else if (Tilemap.isTileA3(tileId)){
			by=(ty-6)*2;
		}else if (Tilemap.isTileA4(tileId)){
			by=(ty-10)*2.5+(ty%2?0.5:0);
		}
		return {x:bx,y:by};
	}
}
MapCell.neighborPositions = [
	new Vector2( 0, 1),
	new Vector2( 1, 0),
	new Vector2( 0,-1),
	new Vector2(-1, 0),
];
MapCell.meshCache={};

class MapCellFinalized {
	
}

class MapCellBuilder {

}