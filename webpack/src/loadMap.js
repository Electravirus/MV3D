import mv3d from './mv3d.js';
import { MapCell } from './mapCell.js';
import { sleep } from './util.js';
import { Vector2 } from 'babylonjs';

Object.assign(mv3d,{

	mapLoaded: false,
	mapReady: false,
	clearMap(){
		this.mapLoaded=false;
		this.clearMapCells();
		for (let i=this.characters.length-1; i>=0; --i){
			this.characters[i].dispose(false,true);
		}
		this.characters.length=0;
		this.resetCameraTarget();

		this.callFeatures('clearMap');
	},
	clearMapCells(){
		// clear materials and textures
		for (const key in this.textureCache){
			this.textureCache[key].dispose();
		}
		for (const key in this.materialCache){
			this.materialCache[key].dispose();
		}
		this.animatedTextures.length=0;
		this.textureCache={};
		this.materialCache={};
		// clear map cells
		for (const key in this.cells){
			this.cells[key].dispose(false,true);
		}
		this.cells={};
		// clear model cache
		this.clearModelCache();
	},
	reloadMap(){
		this.clearMapCells();
		if(mv3d.mapReady) { this.updateMap(); }
		this.callFeatures('reloadMap');
	},

	loadMap(){
		//this.cameraStick.x=$gamePlayer._realX;
		//this.cameraStick.y=$gamePlayer._realY;
		this.updateBlenders();
		this.updateMap();
		this.createCharacters();
		this.rememberCameraTarget();

		this.callFeatures('loadMap');
	},

	async updateMap(){
		if(this.mapUpdating){ return; }
		this.mapLoaded=true;
		this.mapUpdating=true;
		// unload Far cells
		for (const key in this.cells){
			this.cells[key].unload=true;
		}
		// get range of cells based on render distance
		const bounds = {
			left:Math.floor((this.cameraStick.x-this.renderDist)/this.CELL_SIZE),
			right:Math.floor((this.cameraStick.x+this.renderDist)/this.CELL_SIZE),
			top:Math.floor((this.cameraStick.y-this.renderDist)/this.CELL_SIZE),
			bottom:Math.floor((this.cameraStick.y+this.renderDist)/this.CELL_SIZE),
		}
		//clamp cell range to map
		if(this.getMapConfig('edge')!=='clamp'){
			if(!this.loopHorizontal()){
				bounds.left=Math.max(0,bounds.left);
				bounds.right=Math.min(bounds.right,Math.ceil(this.mapWidth()/this.CELL_SIZE)-1);
			}
			if(!this.loopVertical()){
				bounds.top=Math.max(0,bounds.top);
				bounds.bottom=Math.min(bounds.bottom,Math.ceil(this.mapHeight()/this.CELL_SIZE)-1);
			}
		}
		const cellsToLoad=[];
		for (let ix=bounds.left;ix<=bounds.right;++ix)
		for (let iy=bounds.top;iy<=bounds.bottom;++iy){
			let cx=ix, cy=iy;
			if(this.loopHorizontal()){ cx = cx.mod(Math.ceil(this.mapWidth()/this.CELL_SIZE)); }
			if(this.loopVertical()){ cy = cy.mod(Math.ceil(this.mapHeight()/this.CELL_SIZE)); }
			const key = [cx,cy].toString();
			if(key in this.cells){
				this.cells[key].unload=false;
			}else{
				cellsToLoad.push(new Vector2(cx,cy));
			}
		}
		for (const key in this.cells){
			if(mv3d.UNLOAD_CELLS && this.cells[key].unload){
				this.cells[key].dispose();
				delete this.cells[key];
			}
		}
		const cameraCellPos = new Vector2(Math.round(this.cameraStick.x/this.CELL_SIZE-0.5),Math.round(this.cameraStick.y/this.CELL_SIZE-0.5));
		cellsToLoad.sort((a,b)=>Vector2.DistanceSquared(a,cameraCellPos)-Vector2.DistanceSquared(b,cameraCellPos));
		if(this.mapReady){
			cellsToLoad.length=Math.min(25,cellsToLoad.length);
		}
		for (const cellpos of cellsToLoad){
			let {x:cx,y:cy} = cellpos;
			await this.loadMapCell(cx,cy);
			if(this.mapReady){ await sleep(10); }
			if(!this.mapLoaded){ this.endMapUpdate(); return; }
		}
		this.endMapUpdate();
	},

	endMapUpdate(){
		this.mapUpdating=false;
		this.mapReady=true;
	},

	async loadMapCell(cx,cy){
		const key = [cx,cy].toString();
		if(key in this.cells){ return; }
		const cell = new MapCell(cx,cy);
		this.cells[key]=cell;
		await cell.load();
	},

	_cellsNeedingIntensiveUpdate:[],
	intensiveUpdate(){
		if(this._cellsNeedingIntensiveUpdate.length===0){ return; }
		const now = performance.now();
		let cell,index=null;
		for (cell of this._cellsNeedingIntensiveUpdate){
			if(now-cell._lastIntensiveUpdate<=300){ continue; }
			index=this._cellsNeedingIntensiveUpdate.indexOf(cell);
			break;
		}
		if(index==null||index<0){ return; }
		this._cellsNeedingIntensiveUpdate.splice(index,1);
		cell._lastIntensiveUpdate=now;
		cell._needsIntensiveUpdate=false;
		for(let character of cell.characters){
			character.intensiveUpdate();
		}
		mv3d.scene.sortLightsByPriority();
	}

});