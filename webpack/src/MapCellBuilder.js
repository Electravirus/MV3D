import mv3d from "./mv3d.js";
import { Mesh, VertexData } from 'babylonjs';
import { cos, sin, PI } from "./util.js";

export class CellMeshBuilder{
	constructor(){
		this.submeshBuilders={};
	}
	build(){
		const submeshBuildersArray=Object.values(this.submeshBuilders);
		if(!submeshBuildersArray.length){ return null; }
		const submeshes = submeshBuildersArray.map(builder=>builder.build());
		const totalVertices = submeshes.reduce((total,mesh)=>{
			if(typeof total!=='number'){ total=total.getTotalVertices(); }
			return total+mesh.getTotalVertices();
		});
		const mesh = Mesh.MergeMeshes(submeshes,true,totalVertices>64000,undefined,false,true);
		return mesh;
	}
	getBuilder(material){
		if(!(material.name in this.submeshBuilders)){
			this.submeshBuilders[material.name] = new SubMeshBuilder(material);
		}
		return this.submeshBuilders[material.name];
	}
	addWallFace(material,rect,x,y,z,w,h,rot,options={}){
		const builder = this.getBuilder(material);
		const uvRect = SubMeshBuilder.getUvRect(material.diffuseTexture,rect);
		builder.addWallFace(x,y,z,w,h,rot,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addWallFace(x,y,z,w,h,rot,uvRect,options);
		}
	}
	addFloorFace(material,rect,x,y,z,w,h,options={}){
		const builder = this.getBuilder(material);
		const uvRect = SubMeshBuilder.getUvRect(material.diffuseTexture,rect);
		builder.addFloorFace(x,y,z,w,h,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addFloorFace(x,y,z,w,h,uvRect,options);
		}
	}
	addSlopeFace(material,rect,x,y,z,w,h,rot,options={}){
		const builder = this.getBuilder(material);
		const uvRect = SubMeshBuilder.getUvRect(material.diffuseTexture,rect);
		builder.addSlopeFace(x,y,z,w,h,rot,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addSlopeFace(x,y,z,w,h,rot,uvRect,options);
		}
	}
	addSlopeSide(material,rect,x,y,z,w,h,rot,options={}){
		const builder = this.getBuilder(material);
		const uvRect = SubMeshBuilder.getUvRect(material.diffuseTexture,rect);
		builder.addSlopeSide(x,y,z,w,h,rot,uvRect,options);
		if(options.double){
			options.flip=!options.flip;
			builder.addSlopeSide(x,y,z,w,h,rot,uvRect,options);
		}
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
		const xf=cos(rot);
		const zf=sin(rot);
		const ww=w/2, hh=h/2;
		const positions = [
			x-ww*xf, y+hh, z+ww*zf,
			x+ww*xf, y+hh, z-ww*zf,
			x-ww*xf, y-hh, z+ww*zf,
			x+ww*xf, y-hh, z-ww*zf,
		];
		let normals = [ -zf,0,-xf, -zf,0,-xf, -zf,0,-xf, -zf,0,-xf ];
		const uvs = SubMeshBuilder.getDefaultUvs(uvr);
		const indices=SubMeshBuilder.getDefaultIndices();
		if(options.flip){ SubMeshBuilder.flipFace(indices,normals); }
		if(options.abnormal){ normals=[ 0,1,0, 0,1,0, 0,1,0, 0,1,0]; }
		this.pushNewData(positions,indices,normals,uvs);
	}
	addFloorFace(x,z,y,w,h,uvr,options){
		z=-z;y=y;
		//const f=Boolean(options.flip)*-2+1;
		//const ww=f*w/2, hh=h/2;
		const ww=w/2, hh=h/2;
		const positions = [
			x-ww, y, z+hh,
			x+ww, y, z+hh,
			x-ww, y, z-hh,
			x+ww, y, z-hh,
		];
		//const normals=[ 0,f,0, 0,f,0, 0,f,0, 0,f,0 ];
		const normals=[ 0,1,0, 0,1,0, 0,1,0, 0,1,0 ];
		const uvs = SubMeshBuilder.getDefaultUvs(uvr);
		const indices=SubMeshBuilder.getDefaultIndices();
		if(options.flip){ SubMeshBuilder.flipFace(indices,normals); }
		this.pushNewData(positions,indices,normals,uvs);
	}
	addSlopeFace(x,z,y,w,h,rot,uvr,options){
		z=-z;y=y;
		const xf=cos(rot);
		const zf=sin(rot);
		const ww=w/2, hh=h/2;
		const positions = options.autotile ? [
			x-ww, y+hh+hh*Math.round(sin(-rot+PI*1/4)), z+ww,
			x+ww, y+hh+hh*Math.round(sin(-rot+PI*3/4)), z+ww,
			x-ww, y+hh+hh*Math.round(sin(-rot+PI*7/4)), z-ww,
			x+ww, y+hh+hh*Math.round(sin(-rot+PI*5/4)), z-ww,
		] : [
			x-ww*xf+ww*zf, y+h, z+ww*zf+ww*xf,
			x+ww*xf+ww*zf, y+h, z-ww*zf+ww*xf,
			x-ww*xf-ww*zf, y, z+ww*zf-ww*xf,
			x+ww*xf-ww*zf, y, z-ww*zf-ww*xf,
		];
		const hn=Math.pow(2,-h);
		const ihn=1-hn;
		const normals=[ -zf*ihn,hn,-xf*ihn, -zf*ihn,hn,-xf*ihn, -zf*ihn,hn,-xf*ihn, -zf*ihn,hn,-xf*ihn ];
		let uvs = SubMeshBuilder.getDefaultUvs(uvr);
		const indices=SubMeshBuilder.getDefaultIndices();
		if(options.flip){ SubMeshBuilder.flipFace(indices,normals); }
		this.pushNewData(positions,indices,normals,uvs);
	}
	addSlopeSide(x,z,y,w,h,rot,uvr,options){
		z=-z;y=y;
		const xf=cos(rot);
		const zf=sin(rot);
		const ww=w/2, hh=h/2;
		const positions = [
			x-ww*xf, y+h, z+ww*zf,
			x-ww*xf, y, z+ww*zf,
			x+ww*xf, y, z-ww*zf,
		];
		const normals=[ -zf,0,-xf, -zf,0,-xf, -zf,0,-xf ];
		const uvs = [
			uvr.x1,uvr.y1,
			uvr.x1,uvr.y2,
			uvr.x2,uvr.y2,
		];
		const indices=[0,1,2];
		if(options.flip){ SubMeshBuilder.flipFace(indices,normals); }
		this.pushNewData(positions,indices,normals,uvs);
	}
	pushNewData(positions,indices,normals,uvs){
		this.indices.push(...indices.map(i=>i+this.positions.length/3));
		this.positions.push(...positions);
		this.normals.push(...normals);
		this.uvs.push(...uvs);
	}
	static getUvRect(tsTexture,rect){
		const { width, height } = tsTexture.getBaseSize();
		rect = mv3d.finalizeTextureRect(rect,width,height);
		let {x,y,width:w,height:h} = rect;
		if(mv3d.EDGE_FIX){ x+=mv3d.EDGE_FIX;y+=mv3d.EDGE_FIX;w-=mv3d.EDGE_FIX*2;h-=mv3d.EDGE_FIX*2; }
		return {
			x1:x/width,
			y1:(height-y)/height,
			x2:(x+w)/width,
			y2:(height-y-h)/height,
		};
	}
	static getDefaultUvs(uvr){
		return [
			uvr.x1,uvr.y1,
			uvr.x2,uvr.y1,
			uvr.x1,uvr.y2,
			uvr.x2,uvr.y2,
		];
	}
	static getDefaultIndices(){ return [1,0,2,1,2,3]; }
	static flipFace(indices,normals){
		indices.reverse();
		for(let i=0;i<normals.length;++i){ normals[i]*=-1; }
	}
}