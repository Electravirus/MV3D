import mv3d from './mv3d.js';
import { TransformNode, Mesh, MeshBuilder, Vector3, Vector2, FRONTSIDE, BACKSIDE, WORLDSPACE, LOCALSPACE, DOUBLESIDE, Plane } from "./mod_babylon.js";
import { tileSize, XAxis, YAxis, tileWidth, tileHeight, sleep, snooze, sin, cos } from './util.js';
import { CellMeshBuilder } from './MapCellBuilder.js';

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
		this.characters=[];

		//this.load();
	}
	update(){
		const loopPos = mv3d.loopCoords((this.cx+0.5)*mv3d.CELL_SIZE,(this.cy+0.5)*mv3d.CELL_SIZE);
		this.x=loopPos.x-mv3d.CELL_SIZE/2;
		this.y=loopPos.y-mv3d.CELL_SIZE/2;
	}
	async load(){
		const shapes = mv3d.enumShapes;
		this.builder = new CellMeshBuilder();
		// load all tiles in mesh
		const cellWidth = Math.min(mv3d.CELL_SIZE,$gameMap.width()-this.cx*mv3d.CELL_SIZE);
		const cellHeight = Math.min(mv3d.CELL_SIZE,$gameMap.height()-this.cy*mv3d.CELL_SIZE);
		const ceiling = mv3d.getCeilingConfig();
		for (let y=0; y<cellHeight; ++y)
		for (let x=0; x<cellWidth; ++x){
			ceiling.cull=false;
			const tileData = mv3d.getTileData(this.ox+x,this.oy+y);
			let lastZ=Infinity;
			const cullHeight = mv3d.getCullingHeight(this.ox+x,this.oy+y);
			for (let l=3; l>=0; --l){
				if(mv3d.isTileEmpty(tileData[l])){ continue; }
				let z = mv3d.getStackHeight(this.ox+x,this.oy+y,l);
				const tileConf = mv3d.getTileTextureOffsets(tileData[l],this.ox+x,this.oy+y,l);
				const shape = tileConf.shape;
				tileConf.realId = tileData[l];
				//tileConf.isAutotile = Tilemap.isAutotile(tileData[l]);
				//tileConf.isFringe = mv3d.isStarTile(tileData[l]);
				//tileConf.isTable = mv3d.isTableTile(tileData[l]);
				let wallHeight = mv3d.getTileHeight(this.ox+x,this.oy+y,l)||tileConf.height||0;
				let pitCull = false;
				if(lastZ<z){ pitCull=true; }
				if(!mv3d.getTileFringe(this.ox+x,this.oy+y,l)){
					lastZ=z;
				}
				//z+=tileConf.fringe;
				//if(mv3d.isStarTile(tileData[l])){ z+=tileConf.fringeHeight; }
				if(!shape||shape===shapes.FLAT||shape===shapes.SLOPE){
					const hasWall=wallHeight||l===0;
					const hasBottom=wallHeight>0&&z-wallHeight>cullHeight||tileConf.fringe>0;
					if(!shape||shape===shapes.FLAT){
						if(!pitCull){
							await this.loadTile(tileConf,x,y,z+l*mv3d.LAYER_DIST*!hasWall,l);
						}
						if(hasWall){
							await this.loadWalls(tileConf,x,y,z,l,wallHeight);
						}
						if(hasBottom){
							await this.loadTile(tileConf,x,y,z-wallHeight,l,true);
						}
					}else if(shape===shapes.SLOPE){
						const slopeHeight = tileConf.slopeHeight||1;
						wallHeight -= slopeHeight;
						await this.loadSlope(tileConf,x,y,z,l,slopeHeight);
						if(hasWall){
							await this.loadWalls(tileConf,x,y,z-slopeHeight,l,wallHeight);
						}
						if(hasBottom){
							await this.loadTile(tileConf,x,y,z-slopeHeight-Math.max(0,wallHeight),l,true);
						}
					}
					if(z>=ceiling.height){ ceiling.cull=true; }
				}
				if(shape===shapes.FENCE){
					await this.loadFence(tileConf,x,y,z,l,wallHeight);
				}else if(shape===shapes.CROSS||shape===shapes.XCROSS){
					await this.loadCross(tileConf,x,y,z,l,wallHeight);
				}
			}
			if(!mv3d.isTileEmpty(ceiling.bottom_id) && !ceiling.cull){
				await this.loadTile(ceiling,x,y,ceiling.height,0,true,!ceiling.skylight);
			}

			//if(mv3d.mapReady){ await sleep(); }
			//if(!mv3d.mapLoaded){ this.earlyExit(); return; }
		}
		
		this.mesh=this.builder.build();
		if(this.mesh){
			this.mesh.parent=this;
			this.mesh.alphaIndex=0;
			mv3d.callFeatures('createCellMesh',this.mesh);
		}
		delete this.builder
	}
	dispose(){
		super.dispose(...arguments);
		if(this.mesh){
			mv3d.callFeatures('destroyCellMesh',this.mesh);
		}
	}
	async loadTile(tileConf,x,y,z,l,ceiling=false,double=false){
		const tileId = ceiling?tileConf.bottom_id:tileConf.top_id;
		if(mv3d.isTileEmpty(tileId)){ return; }
		const configRect = ceiling?tileConf.bottom_rect:tileConf.top_rect;
		const isAutotile = Tilemap.isAutotile(tileId)&&!configRect;
		let rects;
		if(configRect){
			rects=[configRect];
		}else{
			rects = mv3d.getTileRects(tileId);
		}
		const tsMaterial = await mv3d.getCachedTilesetMaterialForTile(tileConf,ceiling?'bottom':'top');
		for (const rect of rects){
			this.builder.addFloorFace(tsMaterial,rect.x,rect.y,rect.width,rect.height,
				x + (rect.ox|0)/tileSize() - 0.25*isAutotile,
				y + (rect.oy|0)/tileSize() - 0.25*isAutotile,
				z,
				1-isAutotile/2, 1-isAutotile/2, {flip:ceiling,double:double}
			);
		}
	}
	async loadWalls(tileConf,x,y,z,l,wallHeight){
		for (const np of MapCell.neighborPositions){
			await this.loadWall(tileConf,x,y,z,l,wallHeight,np);
		}
	}
	async loadWall(tileConf,x,y,z,l,wallHeight,np){
		const isFringe = mv3d.isStarTile(tileConf.realId)||tileConf.fringe>0;
		// don't render walls on edge of map (unless it loops)
		if( !mv3d.getMapConfig('edge',true) )
		if((this.ox+x+np.x>=$dataMap.width||this.ox+x+np.x<0)&&!$gameMap.isLoopHorizontal()
		||(this.oy+y+np.y>=$dataMap.height||this.oy+y+np.y<0)&&!$gameMap.isLoopVertical()){
			return;
		}

		let neededHeight=wallHeight;
		let tileId=tileConf.side_id,configRect,texture_side='side';
		if(mv3d.isTileEmpty(tileId)){ return; }
		
		const neighborHeight = mv3d.getCullingHeight(this.ox+x+np.x,this.oy+y+np.y,tileConf.depth>0?3:l,{
			ignorePits:!(tileConf.depth>0),
		});
		neededHeight = z-neighborHeight;
		if(neededHeight>0&&(l>0||isFringe)){ neededHeight=Math.min(wallHeight,neededHeight); }

		if(tileConf.depth>0&&neededHeight<0){
			if(mv3d.tileHasPit(this.ox+x+np.x,this.oy+y+np.y,l)){ return; }
			//if(mv3d.isTilePit(this.ox+x+np.x,this.oy+y+np.y,l)){ return; }
			neededHeight = Math.max(neededHeight,-tileConf.depth);
			if(tileConf.hasInsideConf){
				texture_side='inside';
			}
		}
		else if(neededHeight<=0){ return; }

		if(texture_side==='inside'){
			tileId=tileConf.inside_id;
			if(tileConf.inside_rect){ configRect = tileConf.inside_rect; }
		}else{
			if(tileConf.side_rect){ configRect = tileConf.side_rect; }
		}

		const tsMaterial = await mv3d.getCachedTilesetMaterialForTile(tileConf,texture_side);

		const wallPos = new Vector3( x+np.x/2, y+np.y/2, z );
		const rot = -Math.atan2(np.x, np.y);
		if(configRect || !Tilemap.isAutotile(tileId)){
			const rect = configRect ? configRect : mv3d.getTileRects(tileId)[0];
			const builderOptions={};
			if(neededHeight<0){ builderOptions.flip=true; }
			this.builder.addWallFace(tsMaterial,rect.x,rect.y,rect.width,rect.height,
				wallPos.x,
				wallPos.y,
				z - neededHeight/2,
				1,Math.abs(neededHeight), rot, builderOptions
			);
		}else{ // Autotile
			//const npl=MapCell.neighborPositions[(+ni-1).mod(4)];
			//const npr=MapCell.neighborPositions[(+ni+1).mod(4)];
			const npl=new Vector2(-np.y,np.x);
			const npr=new Vector2(np.y,-np.x);
			const leftHeight = mv3d.getCullingHeight(this.ox+x+npl.x,this.oy+y+npl.y,l,{dir:Input._makeNumpadDirection(npl.x,npl.y)});
			const rightHeight = mv3d.getCullingHeight(this.ox+x+npr.x,this.oy+y+npr.y,l,{dir:Input._makeNumpadDirection(npr.x,npr.y)});
			const {x:bx,y:by} = this.getAutotileCorner(tileId,tileConf.realId,true);
			let wallParts=Math.max(1,Math.abs(Math.round(neededHeight*2)));
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
					}else{
						hasLeftEdge = leftHeight<z-az*partHeight;
						hasRightEdge = rightHeight<z-az*partHeight;
					}
					let sx,sy;
					sx=bx*tileSize();
					sy=by*tileSize();
					sx=(bx+(ax>0?0.5+hasRightEdge:1-hasLeftEdge))*tileSize();
					if(mv3d.isWaterfallTile(tileId)){
						sy=(by+az%2/2)*tileSize();
					}else if(mv3d.isTableTile(tileId)){
						sy=(by+5/3)*tileSize();
					}else{
						sy=(by+(az===0?0:az===wallParts-1?1.5:1-az%2*0.5))*tileSize();
					}
					const builderOptions={};
					if(neededHeight<0){ builderOptions.flip=true; }
					this.builder.addWallFace(tsMaterial,sx,sy,sw,sh,
						wallPos.x+0.25*ax*Math.cos(rot),
						wallPos.y+0.25*ax*Math.sin(rot),
						z - neededHeight*(neededHeight<0) - partHeight/2 - partHeight*az,
						0.5,partHeight, rot, builderOptions
					);
				}
			}
		}
	}
	async loadFence(tileConf,x,y,z,l,wallHeight){
		const tileId = tileConf.side_id;
		if(mv3d.isTileEmpty(tileId)){ return; }
		const configRect = tileConf.side_rect;
		const tsMaterial = await mv3d.getCachedTilesetMaterialForTile(tileConf,'side');
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
				const {x:bx,y:by} = this.getAutotileCorner(tileId,tileConf.realId,true);
				for (let az=0;az<=1;++az){
					this.builder.addWallFace(tsMaterial,
						(edge ? (bx+rightSide*1.5) : (bx+1-rightSide*0.5) )*tileWidth(),
						(by+az*1.5)*tileHeight(),
						tileWidth()/2, tileHeight()/2,
						x+np.x/4,
						y+np.y/4,
						z-wallHeight/4-az*wallHeight/2,
						0.5,wallHeight/2, -rot, {double:true, abnormal:mv3d.ABNORMAL}
					);
				}
			}else{
				const rect = configRect ? configRect : mv3d.getTileRects(tileId)[0];
				this.builder.addWallFace(tsMaterial,
					rect.x+rect.width/2*rightSide,
					rect.y,
					rect.width/2, rect.height,
					x+np.x/4,
					y+np.y/4,
					z-wallHeight/2,
					0.5,wallHeight, rot, {double:true}
				);
			}
		}
	}
	async loadCross(tileConf,x,y,z,l,wallHeight){
		const tileId = tileConf.side_id;
		if(mv3d.isTileEmpty(tileId)){ return; }
		const configRect = tileConf.side_rect;
		const tsMaterial = await mv3d.getCachedTilesetMaterialForTile(tileConf,'side');
		const isAutotile = Tilemap.isAutotile(tileId);
		let rects;
		if(configRect){
			rects=[configRect];
		}else{
			rects = mv3d.getTileRects(tileId);
		}
		const rot = tileConf.shape===mv3d.enumShapes.XCROSS ? Math.PI/4 : 0;
		const partHeight = isAutotile ? wallHeight/2 : wallHeight;
		for (let i=0; i<=1; ++i){
			for (const rect of rects){
				const irot = -Math.PI/2*i+rot;
				const trans= -0.25*isAutotile+(rect.ox|0)/tileWidth();
				this.builder.addWallFace(tsMaterial,
					rect.x,rect.y,rect.width,rect.height,
					x+trans*Math.cos(irot),
					y+trans*Math.sin(irot),
					z - (rect.oy|0)/tileHeight()*wallHeight - partHeight/2,
					1-isAutotile/2,partHeight, irot, {double:true, abnormal:mv3d.ABNORMAL}
				);
			}
		}
	}
	async loadSlope(tileConf,x,y,z,l,slopeHeight){
		//const rot = Math.random()*Math.PI*2;
		//const rot = Math.round((Math.random()*Math.PI*2)/(Math.PI/2))*Math.PI/2;
		const rot=mv3d.getSlopeDirection(this.ox+x,this.oy+y,l);
		const n1=new Vector2(-sin(rot+Math.PI),cos(rot+Math.PI));
		if(mv3d.getCullingHeight(this.ox+x+n1.x,this.oy+y+n1.y,l)<z){
			await this.loadWall(tileConf,x,y,z,l+1,slopeHeight,n1);
		}
		const n2=new Vector2(n1.y,-n1.x);
		if(mv3d.getCullingHeight(this.ox+x+n2.x,this.oy+y+n2.y,l)<z){
			await this.loadSlopeSide(tileConf,x+n2.x/2,y+n2.y/2,z,l,slopeHeight,rot+Math.PI/2);
		}
		const n3=new Vector2(-n1.y,n1.x);
		if(mv3d.getCullingHeight(this.ox+x+n3.x,this.oy+y+n3.y,l)<z){
			await this.loadSlopeSide(tileConf,x+n3.x/2,y+n3.y/2,z,l,slopeHeight,rot+Math.PI/2,{flip:true});
		}
		await this.loadSlopeTop(tileConf,x,y,z,l,slopeHeight,rot);
	}
	async loadSlopeTop(tileConf,x,y,z,l,slopeHeight,rot){
		const tileId=tileConf.top_id;
		const tsMaterial = await mv3d.getCachedTilesetMaterialForTile(tileConf,'top');
		const isAutotile = Tilemap.isAutotile(tileId)&&!tileConf.top_rect;
		if(isAutotile){
			const rects = mv3d.getTileRects(tileId);
			for (let i=0;i<rects.length;++i){
				const rect = rects[i];
				const ix=(i+1)%2*-2+1, iy=(Math.floor(i/2)+1)%2*2-1;
				const hx=Math.max(0,sin(rot)*ix)*slopeHeight/2;
				const hy=Math.max(0,cos(rot)*iy)*slopeHeight/2;
				this.builder.addSlopeFace(tsMaterial,rect.x,rect.y,rect.width,rect.height,
					x + rect.ox/tileSize() - 0.25,
					y + rect.oy/tileSize() - 0.25,
					z - slopeHeight + hx + hy,
					0.5, slopeHeight/2, rot, {autotile:true}
				);
			}
		}else{
			const rect = tileConf.top_rect?tileConf.top_rect:mv3d.getTileRects(tileId)[0];
			this.builder.addSlopeFace(tsMaterial,rect.x,rect.y,rect.width,rect.height,
				x, y, z - slopeHeight,
				1, slopeHeight, rot, {}
			);
		}
	}
	async loadSlopeSide(tileConf,x,y,z,l,slopeHeight,rot,options={}){
		const tileId=tileConf.side_id;
		const tsMaterial = await mv3d.getCachedTilesetMaterialForTile(tileConf,'side');
		const isAutotile = Tilemap.isAutotile(tileId)&&!tileConf.side_rect;
		let rect;
		if(isAutotile){
			const {x:bx,y:by} = this.getAutotileCorner(tileId,tileConf.realId,true);
			rect={x:(bx+0.5)*tileWidth(),y:(by+0.5)*tileHeight(),width:tileWidth(),height:tileHeight()};
		}else{
			rect = tileConf.side_rect?tileConf.side_rect:mv3d.getTileRects(tileId)[0];
		}
		this.builder.addSlopeSide(tsMaterial,rect.x,rect.y,rect.width,rect.height,
			x, y, z - slopeHeight,
			1, slopeHeight, rot, options
		);
	}
	getAutotileCorner(tileId,realId=tileId,excludeTop=true){
		const kind = Tilemap.getAutotileKind(tileId);
		let tx = kind%8;
		let ty = Math.floor(kind / 8);
		if(tileId===realId && mv3d.isWallTile(tileId)==1){ ++ty; }
		var bx,by;
		bx=tx*2;
		by=ty;
		if(Tilemap.isTileA1(tileId)){
			if(kind<4){
				bx=6*Math.floor(kind/2);
				by=3*(kind%2) + excludeTop;
			}else{
				bx=8*Math.floor(tx/4) + (kind%2)*6;
				by=ty*6 + Math.floor(tx%4/2)*3 + excludeTop*!(tx%2);
				//if(excludeTop&&!(kind%2)){ by+=1; }
			}
			if(excludeTop&&kind>=4&&!(kind%2)){ by+=1; }
		}else if(Tilemap.isTileA2(tileId)){
			by=(ty-2)*3 + excludeTop;
		}else if (Tilemap.isTileA3(tileId)){
			by=(ty-6)*2;
		}else if (Tilemap.isTileA4(tileId)){
			if(excludeTop){
				by=Math.ceil((ty-10)*2.5+0.5);
			}else{
				by=(ty-10)*2.5+(ty%2?0.5:0);
			}
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


