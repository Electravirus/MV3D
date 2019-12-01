import mv3d from "./mv3d.js";
import { Mesh, VertexData } from "./mod_babylon.js";

export class CellMeshBuilder{
	constructor(){
		this.submeshBuilders={};
	}
	build(){
		const submeshBuildersArray=Object.values(this.submeshBuilders);
		if(!submeshBuildersArray.length){ return null; }
		const submeshes = submeshBuildersArray.map(builder=>builder.build());
		const mesh = Mesh.MergeMeshes(submeshes,true,undefined,undefined,false,true);
		return mesh;
	}
	getBuilder(material){
		if(!(material.name in this.submeshBuilders)){
			this.submeshBuilders[material.name] = new SubMeshBuilder(material);
		}
		return this.submeshBuilders[material.name];
	}
	addWallFace(material,tx,ty,tw,th,x,y,z,w,h,rot,options={}){
		const builder = this.getBuilder(material);
		const uvRect = SubMeshBuilder.getUvRect(material.diffuseTexture,tx,ty,tw,th);
		builder.addWallFace(x,y,z,w,h,rot,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addWallFace(x,y,z,w,h,rot,uvRect,options);
		}
	}
	addFloorFace(material,tx,ty,tw,th,x,y,z,w,h,flip){
		const builder = this.getBuilder(material);
		const uvRect = SubMeshBuilder.getUvRect(material.diffuseTexture,tx,ty,tw,th);
		builder.addFloorFace(x,y,z,w,h,flip,uvRect);
	}
}

class SubMeshBuilder{
	constructor(material){
		this.material=material;
		this.positions=[];
		this.indices=[];
		this.normals=[];
		this.uvs=[];
	}
	build(){
		const mesh = new Mesh('cell mesh', mv3d.scene);
		//VertexData.ComputeNormals(this.positions,this.indices,this.normals);
		const vdata = new VertexData();
		vdata.positions=this.positions;
		vdata.indices=this.indices;
		vdata.normals=this.normals;
		vdata.uvs=this.uvs;
		vdata.applyToMesh(mesh);
		mesh.material=this.material;
		return mesh;
	}
	addWallFace(x,z,y,w,h,rot,uvr,options){
		z=-z;y=y;
		const xf=Math.round(Math.cos(rot)*1000)/1000;
		const zf=Math.round(Math.sin(rot)*1000)/1000;
		const ww=w/2, hh=h/2;
		const positions = [
			x-ww*xf, y+hh, z+ww*zf,
			x+ww*xf, y+hh, z-ww*zf,
			x-ww*xf, y-hh, z+ww*zf,
			x+ww*xf, y-hh, z-ww*zf,
		];
		const normals=[ -zf,0,-xf, -zf,0,-xf, -zf,0,-xf, -zf,0,-xf ];
		const uvs = [
			uvr.x1,uvr.y1,
			uvr.x2,uvr.y1,
			uvr.x1,uvr.y2,
			uvr.x2,uvr.y2,
		];
		const indices=[1,0,2,1,2,3];
		if(options.flip){
			indices.reverse();
			for(let i=0;i<normals.length;++i){ normals[i]*=-1; }
		}
		this.pushNewData(positions,indices,normals,uvs);
	}
	addFloorFace(x,z,y,w,h,flip,uvr){
		z=-z;y=y;
		const f=flip*-2+1;
		const ww=f*w/2, hh=h/2;
		const positions = [
			x-ww, y, z+hh,
			x+ww, y, z+hh,
			x-ww, y, z-hh,
			x+ww, y, z-hh,
		];
		const normals=[ 0,f,0, 0,f,0, 0,f,0, 0,f,0 ];
		const uvs = [
			uvr.x1,uvr.y1,
			uvr.x2,uvr.y1,
			uvr.x1,uvr.y2,
			uvr.x2,uvr.y2,
		];
		const indices=[1,0,2,1,2,3];
		this.pushNewData(positions,indices,normals,uvs);
	}
	pushNewData(positions,indices,normals,uvs){
		this.indices.push(...indices.map(i=>i+this.positions.length/3));
		this.positions.push(...positions);
		this.normals.push(...normals);
		this.uvs.push(...uvs);
	}
	static getUvRect(tsTexture,x,y,w,h){
		const { width, height } = tsTexture.getBaseSize();
		if(mv3d.EDGE_FIX){ x+=mv3d.EDGE_FIX;y+=mv3d.EDGE_FIX;w-=mv3d.EDGE_FIX*2;h-=mv3d.EDGE_FIX*2; }
		return {
			x1:x/width,
			y1:(height-y)/height,
			x2:(x+w)/width,
			y2:(height-y-h)/height,
		};
	}
}