"use strict";

/**
 * a geometry contains all information about a mesh, vertices, texturecoordinates etc. etc.
 * @external CGL
 * @namespace Geometry
 * @param {String} name
 * @class
 * @example
 * // create a triangle with all attributes
 * const geom=new CGL.Geometry("triangle"),
 * 
 * geom.vertices = [
 *      0.0,           sizeH.get(),  0.0,
 *     -sizeW.get(),  -sizeH.get(),  0.0,
 *      sizeW.get(),  -sizeH.get(),  0.0 ];
 * 
 * geom.vertexNormals = [
 *      0.0,  0.0,  1.0,
 *      0.0,  0.0,  1.0,
 *      0.0,  0.0,  1.0 ];
 * 
 * geom.tangents = [
 *     1,0,0,
 *     1,0,0,
 *     1,0,0 ];
 * 
 * geom.biTangents = [
 *     0,1,0,
 *     0,1,0,
 *     0,1,0 ];
 * 
 * geom.texCoords = [
 *      0.5,  0.0,
 *      1.0,  1.0,
 *      0.0,  1.0, ];
 * 
 * geom.verticesIndices = [
 *     0, 1, 2 ];
 * 
 */
CGL.Geometry=function(name)
{
    this.name=name;
    this.faceVertCount=3;
    this._vertices=[];
    this.verticesIndices=[];
    this.texCoords=new Float32Array();
    this.texCoordsIndices=[];
    this.vertexNormals=[];
    this.tangents=[];
    this.biTangents=[];
    this.barycentrics=[];
    this.morphTargets=[];
    this.vertexColors=[];
    this._attributes={};

    Object.defineProperty(this, 'vertices', {
      get: function() {
        return this._vertices;
      },
      set: function(v) {
        this.setVertices(v);
      }
    });
};

/**
 * @function clear
 * @memberof Geometry
 * @instance
 * @description clear all buffers/set them to length 0
 */
CGL.Geometry.prototype.clear=function()
{
    this.vertices=new Float32Array([]);
    this.verticesIndices.length=0;
    this.texCoords=new Float32Array([]);
    this.texCoordsIndices.length=0;
    this.vertexNormals.length=0;
};

/**
 * @function getAttributes
   @memberof Geometry
 * @instance
 * @return {Array<Object>} returns array of attribute objects
 */
CGL.Geometry.prototype.getAttributes=function()
{
    return this._attributes;
};

/**
 * @function getAttribute
 * @memberof Geometry
 * @instance
 * @param {String} name
 * @return {Object}
 */
CGL.Geometry.prototype.getAttribute=function(name)
{
    for(var i in this._attributes)
    {
        if(this._attributes[i].name==name)return this._attributes[i];
    }
    return null;
};

/**
 * @function setAttribute
 * @description create an attribute
 * @memberof Geometry
 * @instance
 * @param {String} name
 * @param {Array} data
 * @param {Number} itemsize
 */
CGL.Geometry.prototype.setAttribute=function(name,arr,itemSize)
{
    var attrType='';
    if(itemSize==1)attrType='float';
    else if(itemSize==2)attrType='vec2';
    else if(itemSize==3)attrType='vec3';
    else if(itemSize==4)attrType='vec4';

    var attr={
        name:name,
        data:arr,
        itemSize:itemSize,
        type:attrType
    };

    this._attributes[name]=attr;
};

/**
 * @function setVertices
 * @memberof Geometry
 * @instance
 * @description set vertices
 * @param {Array|Float32Array} data [x,y,z,x,y,z,...]
 */
CGL.Geometry.prototype.setVertices=function(arr)
{
    if(arr instanceof Float32Array)this._vertices=arr;
        else this._vertices=new Float32Array(arr);
};

/**
 * @function setTexCoords
 * @memberof Geometry
 * @instance
 * @description set texcoords
 * @param {Array|Float32Array} data [u,v,u,v,...]
 */
CGL.Geometry.prototype.setTexCoords=function(arr)
{
    if(arr instanceof Float32Array)this.texCoords=arr;
        else this.texCoords=new Float32Array(arr);
};

CGL.Geometry.prototype.testIndices=function()
{
    var foundError=false;
    for(var i=0;i<this.verticesIndices.length;i++)
    {
        if(this.verticesIndices[i*3+0]>=this._vertices.length/3 ||
            this.verticesIndices[i*3+1]>=this._vertices.length/3 ||
            this.verticesIndices[i*3+2]>=this._vertices.length/3)
        {
            foundError=true;
            console.log("index error!");
        }
    }
};

// deprecated
CGL.Geometry.prototype.calcNormals=function(smooth)
{
    var options={};
    if(!smooth) this.unIndex();

    this.calculateNormals(options);
};

CGL.Geometry.prototype.setPointVertices=function(verts)
{
    if(verts.length%3!==0)
    {
        console.error('CGL MESH : SetPointVertices: Array must be multiple of three.');
        return;
    }

    if(!(verts instanceof Float32Array)) this.vertices=new Float32Array(verts);
        else this.vertices=verts;

    if(!(this.texCoords instanceof Float32Array)) this.texCoords=new Float32Array(verts.length/3*2);

    // this.texCoords.length=verts.length/3*2;
    this.verticesIndices.length=verts.length/3;
    // this.verticesIndices=[];

    for(i=0;i<verts.length/3;i++)
    {
        this.verticesIndices[i]=i;
        this.texCoords[i*2]=0;
        this.texCoords[i*2+1]=0;
    }
};



CGL.Geometry.prototype.merge=function(geom)
{
    if(!geom)return;
    var oldIndizesLength=this.verticesIndices.length;
    var vertLength=this.vertices.length/3;

    this.verticesIndices.length=this.verticesIndices.length+geom.verticesIndices.length;
    for(var i=0;i<geom.verticesIndices.length;i++)
    {
        this.verticesIndices[oldIndizesLength+i]=geom.verticesIndices[i]+vertLength;
    }

    this.vertices=CABLES.UTILS.float32Concat(this.vertices,geom.vertices);
    this.texCoords=CABLES.UTILS.float32Concat(this.texCoords,geom.texCoords);
    this.vertexNormals=CABLES.UTILS.float32Concat(this.vertexNormals,geom.vertexNormals);
    this.tangents=CABLES.UTILS.float32Concat(this.vertexNormals,geom.tangents);
    this.bitangents=CABLES.UTILS.float32Concat(this.vertexNormals,geom.bitangents);
};

CGL.Geometry.prototype.copy=function()
{
    var i=0;
    var geom=new CGL.Geometry();
    geom.faceVertCount=this.faceVertCount;

    // geom.vertices.length=this.vertices.length;
    // for(i=0;i<this.vertices.length;i++) geom.vertices[i]=this.vertices[i];
    geom.setVertices(this._vertices.slice(0));
    
    geom.verticesIndices.length=this.verticesIndices.length;
    for(i=0;i<this.verticesIndices.length;i++) geom.verticesIndices[i]=this.verticesIndices[i];

    geom.texCoords=new Float32Array(this.texCoords.length);
    for(i=0;i<this.texCoords.length;i++) geom.texCoords[i]=this.texCoords[i];

    geom.texCoordsIndices.length=this.texCoordsIndices.length;
    for(i=0;i<this.texCoordsIndices.length;i++) geom.texCoordsIndices[i]=this.texCoordsIndices[i];

    geom.vertexNormals.length=this.vertexNormals.length;
    for(i=0;i<this.vertexNormals.length;i++) geom.vertexNormals[i]=this.vertexNormals[i];

    if(this.tangents)
    {
        geom.tangents=[];
        geom.tangents.length=this.tangents.length;
        for(i=0;i<this.tangents.length;i++) geom.tangents[i]=this.tangents[i];
    }

    if(this.biTangents)
    {
        geom.biTangents=[];
        geom.biTangents.length=this.biTangents.length;
        for(i=0;i<this.biTangents.length;i++) geom.biTangents[i]=this.biTangents[i];
    }

    geom.barycentrics.length=this.barycentrics.length;
    for(i=0;i<this.barycentrics.length;i++) geom.barycentrics[i]=this.barycentrics[i];

    geom.morphTargets.length=this.morphTargets.length;
    for(i=0;i<this.morphTargets.length;i++) geom.morphTargets[i]=this.morphTargets[i];

    geom.vertexColors.length=this.vertexColors.length;
    for(i=0;i<this.vertexColors.length;i++) geom.vertexColors[i]=this.vertexColors[i];

    return geom;
};

CGL.Geometry.prototype.calculateNormals=function(options)
{
    var u=vec3.create();
    var v=vec3.create();
    var n=vec3.create();
    var i=0;

    function calcNormal(triangle)
    {
        vec3.subtract(u,triangle[0],triangle[1]);
        vec3.subtract(v,triangle[0],triangle[2]);
        vec3.cross(n,u,v);
        vec3.normalize(n,n);

        if(options && options.forceZUp)
        {
            if(n[2]<0)
            {
                n[0]*=-1;
                n[1]*=-1;
                n[2]*=-1;
            }
        }
        return n;
    }

    this.getVertexVec=function(which)
    {
        var vec=[0,0,0];
        vec[0]=this.vertices[which*3+0];
        vec[1]=this.vertices[which*3+1];
        vec[2]=this.vertices[which*3+2];
        return vec;
    };

    if(!(this.vertexNormals instanceof Float32Array) || this.vertexNormals.length!=this.vertices.length) this.vertexNormals=new Float32Array(this.vertices.length);


    for(i=0;i<this.vertices.length;i++)
    {
        this.vertexNormals[i]=0;
    }
    
    if(!this.isIndexed())
    {
        var norms=[];
        for(i=0;i<this.vertices.length;i+=9)
        {
            var triangle=[
                [this.vertices[i+0],this.vertices[i+1],this.vertices[i+2]],
                [this.vertices[i+3],this.vertices[i+4],this.vertices[i+5]],
                [this.vertices[i+6],this.vertices[i+7],this.vertices[i+8]]
            ];

            var n=calcNormal(triangle);
            norms.push(
                n[0],n[1],n[2],
                n[0],n[1],n[2],
                n[0],n[1],n[2]);
        }
        this.vertexNormals=norms;
    }
    else
    {
        
        var faceNormals=[];
        faceNormals.length=this.verticesIndices.length/3;

        for(i=0;i<this.verticesIndices.length;i+=3)
        {
            var triangle=[
                this.getVertexVec(this.verticesIndices[i+0]),
                this.getVertexVec(this.verticesIndices[i+1]),
                this.getVertexVec(this.verticesIndices[i+2])
                ];
    
            faceNormals[i/3]=calcNormal(triangle);
    
            this.vertexNormals[this.verticesIndices[i+0]*3+0]+=faceNormals[i/3][0];
            this.vertexNormals[this.verticesIndices[i+0]*3+1]+=faceNormals[i/3][1];
            this.vertexNormals[this.verticesIndices[i+0]*3+2]+=faceNormals[i/3][2];
    
            this.vertexNormals[this.verticesIndices[i+1]*3+0]+=faceNormals[i/3][0];
            this.vertexNormals[this.verticesIndices[i+1]*3+1]+=faceNormals[i/3][1];
            this.vertexNormals[this.verticesIndices[i+1]*3+2]+=faceNormals[i/3][2];
    
            this.vertexNormals[this.verticesIndices[i+2]*3+0]+=faceNormals[i/3][0];
            this.vertexNormals[this.verticesIndices[i+2]*3+1]+=faceNormals[i/3][1];
            this.vertexNormals[this.verticesIndices[i+2]*3+2]+=faceNormals[i/3][2];
        }
    
        for(i=0;i<this.verticesIndices.length;i+=3) // faces
        {
            for(var k=0;k<3;k++) //triangles
            {
                var vv=[
                    this.vertexNormals[this.verticesIndices[i+k]*3+0],
                    this.vertexNormals[this.verticesIndices[i+k]*3+1],
                    this.vertexNormals[this.verticesIndices[i+k]*3+2]
                    ];
                vec3.normalize(vv,vv);
                this.vertexNormals[this.verticesIndices[i+k]*3+0]=vv[0];
                this.vertexNormals[this.verticesIndices[i+k]*3+1]=vv[1];
                this.vertexNormals[this.verticesIndices[i+k]*3+2]=vv[2];
            }
        }
    }


};

/** 
 * Calculates tangents & bitangents with the help of uv-coordinates. Adapted from
 * Lengyel, Eric. “Computing Tangent Space Basis Vectors for an Arbitrary Mesh”.
 * Terathon Software 3D Graphics Library.
 * https://fenix.tecnico.ulisboa.pt/downloadFile/845043405449073/Tangent%20Space%20Calculation.pdf
 *
 * @function calcTangentsBitangents
 * @memberof Geometry
 * @instance
 */
CGL.Geometry.prototype.calcTangentsBitangents = function () {
    if (!this.vertices.length) {
        throw new Error("Cannot calculate tangents/bitangents without vertices.");
    }
    if (!this.vertexNormals.length) {
        throw new Error("Cannot calculate tangents/bitangents without normals.");
    }
    if (!this.texCoords.length) {
        throw new Error("Cannot calculate tangents/bitangents without texture coordinates.");
    }
    if (!this.verticesIndices.length) {
        throw new Error("Cannot calculate tangents/bitangents without vertex indices.");
    }
    // this code assumes that we have three indices per triangle
    if (this.verticesIndices.length % 3 !== 0) throw new Error("Vertex indices mismatch!");

    const triangleCount = this.verticesIndices.length / 3;
    const vertexCount = this.vertices.length / 3;

    this.tangents = new Float32Array(this.vertexNormals.length);
    this.biTangents = new Float32Array(this.vertexNormals.length);

    // temporary buffers
    var tempVertices = [];
    tempVertices.length = vertexCount * 2;

    const v1 = vec3.create();
    const v2 = vec3.create();
    const v3 = vec3.create();

    const w1 = vec2.create();
    const w2 = vec2.create();
    const w3 = vec2.create();

    const sdir = vec3.create();
    const tdir = vec3.create();

      // for details on calculation, see article referenced above
      for (var tri = 0; tri < triangleCount; tri += 1) {

        // indices of the three vertices for a triangle
        const i1 = this.verticesIndices[tri * 3];
        const i2 = this.verticesIndices[tri * 3 + 1];
        const i3 = this.verticesIndices[tri * 3 + 2];

        // vertex position as vec3
        vec3.set(v1, this.vertices[i1 * 3], this.vertices[i1 * 3 + 1], this.vertices[i1 * 3 + 2]);
        vec3.set(v2, this.vertices[i2 * 3], this.vertices[i2 * 3 + 1], this.vertices[i2 * 3 + 2]);
        vec3.set(v3, this.vertices[i3 * 3], this.vertices[i3 * 3 + 1], this.vertices[i3 * 3 + 2]);

        // texture coordinate as vec2
        vec2.set(w1, this.texCoords[i1 * 2], this.texCoords[i1 * 2 + 1]);
        vec2.set(w2, this.texCoords[i2 * 2], this.texCoords[i2 * 2 + 1]);
        vec2.set(w3, this.texCoords[i3 * 2], this.texCoords[i3 * 2 + 1]);


        const x1 = v2[0] - v1[0];
        const x2 = v3[0] - v1[0];
        const y1 = v2[1] - v1[1];
        const y2 = v3[1] - v1[1];
        const z1 = v2[2] - v1[2];
        const z2 = v3[2] - v1[2];

        const s1 = w2[0] - w1[0];
        const s2 = w3[0] - w1[0];
        const t1 = w2[1] - w1[1];
        const t2 = w3[1] - w1[1];

        const r = 1.0 / (s1 * t2 - s2 * t1);

        vec3.set(
            sdir,
            (t2 * x1 - t1 * x2) * r,
            (t2 * y1 - t1 * y2) * r,
            (t2 * z1 - t1 * z2) * r
        );

        vec3.set(
            tdir,
            (s1 * x2 - s2 * x1) * r,
            (s1 * y2 - s2 * y1) * r,
            (s1 * z2 - s2 * z1) * r
        );

        tempVertices[i1] = sdir;
        tempVertices[i2] = sdir;
        tempVertices[i3] = sdir;

        tempVertices[i1 + vertexCount] = tdir;
        tempVertices[i2 + vertexCount] = tdir;
        tempVertices[i3 + vertexCount] = tdir;
    }

    const normal = vec3.create();
    const tempVert = vec3.create();
    const tan = vec3.create();
    const bitan = vec3.create();
    const temp1 = vec3.create();
    const temp2 = vec3.create();
    const crossPd = vec3.create();
    const normalized = vec3.create();

    for (var vert = 0; vert < vertexCount; vert += 1) {
        vec3.set(normal, this.vertexNormals[vert * 3], this.vertexNormals[vert * 3 + 1], this.vertexNormals[vert * 3 + 2]);
        vec3.set(tempVert, tempVertices[vert][0], tempVertices[vert][1], tempVertices[vert][2]);
        
        // Gram-Schmidt orthagonalize
        const _dp = vec3.dot(normal, tempVert);
        vec3.scale(temp1, normal, _dp);
        vec3.subtract(
            temp2,
            tempVert,
            temp1
            );

        vec3.normalize(normalized, temp2);

        vec3.cross(crossPd, normal, tempVert);

        const intermDot = vec3.dot(crossPd, tempVertices[vert + vertexCount]);


        const w = intermDot < 0.0 ? -1.0 : 1.0;

        vec3.scale(tan, normalized, 1/w);
        vec3.cross(bitan, normal, tan);

        this.tangents[vert * 3 + 0] = tan[0];
        this.tangents[vert * 3 + 1] = tan[1];
        this.tangents[vert * 3 + 2] = tan[2];
        this.biTangents[vert * 3 + 0] = bitan[0];
        this.biTangents[vert * 3 + 1] = bitan[1];
        this.biTangents[vert * 3 + 2] = bitan[2];
    }

}

CGL.Geometry.prototype.isIndexed=function()
{
    return this.verticesIndices.length!=0;
};


/**
 * @function unIndex
 * @memberof Geometry
 * @instance
 * @param {Boolean}
 * @description remove all vertex indizes, vertices array will contain 3*XYZ for every triangle
 */
CGL.Geometry.prototype.unIndex=function(reIndex)
{
    var newVerts=[];
    var newIndizes=[];
    var newTexCoords=[];
    var newNormals=[];
    var count=0;
    var i=0;
    this.vertexNormals.length=0;

    for(i=0;i<this.verticesIndices.length;i+=3)
    {
        newVerts.push(this.vertices[this.verticesIndices[i+0]*3+0]);
        newVerts.push(this.vertices[this.verticesIndices[i+0]*3+1]);
        newVerts.push(this.vertices[this.verticesIndices[i+0]*3+2]);

        newNormals.push(this.vertexNormals[this.verticesIndices[i+0]*3+0]);
        newNormals.push(this.vertexNormals[this.verticesIndices[i+0]*3+1]);
        newNormals.push(this.vertexNormals[this.verticesIndices[i+0]*3+2]);

        if(!this.texCoords)
        {
            newTexCoords.push(0);
            newTexCoords.push(0);
        }
        else
        {
            newTexCoords.push(this.texCoords[this.verticesIndices[i+0]*2+0]);
            newTexCoords.push(this.texCoords[this.verticesIndices[i+0]*2+1]);
        }



        newIndizes.push(count);
        count++;

        newVerts.push(this.vertices[this.verticesIndices[i+1]*3+0]);
        newVerts.push(this.vertices[this.verticesIndices[i+1]*3+1]);
        newVerts.push(this.vertices[this.verticesIndices[i+1]*3+2]);

        newNormals.push(this.vertexNormals[this.verticesIndices[i+1]*3+0]);
        newNormals.push(this.vertexNormals[this.verticesIndices[i+1]*3+1]);
        newNormals.push(this.vertexNormals[this.verticesIndices[i+1]*3+2]);


        if(!this.texCoords)
        {
            newTexCoords.push(0);
            newTexCoords.push(0);
        }
        else
        {
            newTexCoords.push(this.texCoords[this.verticesIndices[i+1]*2+0]);
            newTexCoords.push(this.texCoords[this.verticesIndices[i+1]*2+1]);
        }

        
        newIndizes.push(count);
        count++;

        newVerts.push(this.vertices[this.verticesIndices[i+2]*3+0]);
        newVerts.push(this.vertices[this.verticesIndices[i+2]*3+1]);
        newVerts.push(this.vertices[this.verticesIndices[i+2]*3+2]);

        newNormals.push(this.vertexNormals[this.verticesIndices[i+2]*3+0]);
        newNormals.push(this.vertexNormals[this.verticesIndices[i+2]*3+1]);
        newNormals.push(this.vertexNormals[this.verticesIndices[i+2]*3+2]);


        if(!this.texCoords)
        {
            newTexCoords.push(0);
            newTexCoords.push(0);
        }
        else
        {
            newTexCoords.push(this.texCoords[this.verticesIndices[i+2]*2+0]);
            newTexCoords.push(this.texCoords[this.verticesIndices[i+2]*2+1]);
        }

        newIndizes.push(count);
        count++;
    }

    this.vertices=newVerts;
    this.texCoords=newTexCoords;
    this.vertexNormals=newNormals;
    this.verticesIndices.length=0;
    if(reIndex) this.verticesIndices=newIndizes;
    this.calculateNormals();
};

CGL.Geometry.prototype.calcBarycentric=function()
{
    this.barycentrics.length=this.vertices.length;

    for(var i=0;i<this.vertices.length;i++) this.barycentrics[i]=0;

    var count=0;
    for(i=0;i<this.vertices.length;i+=3)
    {
        this.barycentrics[i+count]=1;
        count++;
        if(count==3)count=0;
    }
};


CGL.Geometry.prototype.getBounds=function()
{
    var bounds={
        maxX:-Number.MAX_VALUE,
        maxY:-Number.MAX_VALUE,
        maxZ:-Number.MAX_VALUE,
        minX:Number.MAX_VALUE,
        minY:Number.MAX_VALUE,
        minZ:Number.MAX_VALUE
    };
    var i=0;

    for(i=0;i<this.vertices.length;i+=3)
    {
        if(this.vertices[i+0]==this.vertices[i+0])
        {
            bounds.maxX=Math.max(bounds.maxX,this.vertices[i+0]);
            bounds.maxY=Math.max(bounds.maxY,this.vertices[i+1]);
            bounds.maxZ=Math.max(bounds.maxZ,this.vertices[i+2]);

            bounds.minX=Math.min(bounds.minX,this.vertices[i+0]);
            bounds.minY=Math.min(bounds.minY,this.vertices[i+1]);
            bounds.minZ=Math.min(bounds.minZ,this.vertices[i+2]);
        }
    }

    bounds.x=Math.abs(bounds.maxX)+ Math.abs(bounds.minX);
    bounds.y=Math.abs(bounds.maxY)+ Math.abs(bounds.minY);
    bounds.z=Math.abs(bounds.maxZ)+ Math.abs(bounds.minZ);

    bounds.maxAxis=Math.max(bounds.z,Math.max(bounds.x,bounds.y));

    return bounds;
};

CGL.Geometry.prototype.center=function(x,y,z)
{
    if(x===undefined)
    {
        x=true;
        y=true;
        z=true;
    }

    var bounds=this.getBounds();

    var offset=
        [
            bounds.minX+(bounds.maxX-bounds.minX)/2,
            bounds.minY+(bounds.maxY-bounds.minY)/2,
            bounds.minZ+(bounds.maxZ-bounds.minZ)/2
        ];

    for(i=0;i<this.vertices.length;i+=3)
    {
        if(this.vertices[i+0]==this.vertices[i+0])
        {
            if(x)this.vertices[i+0]-=offset[0];
            if(y)this.vertices[i+1]-=offset[1];
            if(z)this.vertices[i+2]-=offset[2];
        }
    }

    return offset;
};

CGL.Geometry.prototype.mapTexCoords2d=function()
{
    var bounds=this.getBounds();
    var num=this.vertices.length/3;

    this.texCoords=new Float32Array(length=num*2);

    for(var i=0;i<num;i++)
    {
        var vertX=this.vertices[i*3+0];
        var vertY=this.vertices[i*3+1];
        this.texCoords[i*2+0]=vertX/(bounds.maxX-bounds.minX)+0.5;
        this.texCoords[i*2+1]=1.0-vertY/(bounds.maxY-bounds.minY)+0.5;
    }
};

// -----------------

// TODO : move this into "old" circle op 
CGL.Geometry.buildFromFaces=function(arr)
{
    var vertices=[];
    var verticesIndices=[];

    for(var i=0;i<arr.length;i+=3)
    {
        var a=arr[i+0];
        var b=arr[i+1];
        var c=arr[i+2];
        var face=[-1,-1,-1];

        for(var iv=0;iv<vertices;iv+=3)
        {
            if( vertices[iv+0]==a[0] &&
                vertices[iv+1]==a[1] &&
                vertices[iv+2]==a[2]) face[0]=iv/3;

            if( vertices[iv+0]==b[0] &&
                vertices[iv+1]==b[1] &&
                vertices[iv+2]==b[2]) face[1]=iv/3;

            if( vertices[iv+0]==c[0] &&
                vertices[iv+1]==c[1] &&
                vertices[iv+2]==c[2]) face[2]=iv/3;
        }

        if(face[0]==-1)
        {
            vertices.push(a[0],a[1],a[2]);
            face[0]=(vertices.length-1)/3;
        }

        if(face[1]==-1)
        {
            vertices.push(b[0],b[1],b[2]);
            face[1]=(vertices.length-1)/3;
        }

        if(face[2]==-1)
        {
            vertices.push(c[0],c[1],c[2]);
            face[2]=(vertices.length-1)/3;
        }

        verticesIndices.push( parseInt( face[0],10 ) );
        verticesIndices.push( parseInt( face[1],10 ) );
        verticesIndices.push( parseInt( face[2],10 ) );
    }

    var geom=new CGL.Geometry();
    geom.vertices=vertices;
    geom.verticesIndices=verticesIndices;

    return geom;
};


CGL.Geometry.json2geom=function(jsonMesh)
{
    var geom=new CGL.Geometry();
    geom.verticesIndices=[];

    geom.vertices=jsonMesh.vertices||[];
    geom.vertexNormals=jsonMesh.normals||[];
    geom.vertexColors=jsonMesh.colors||[];
    geom.tangents=jsonMesh.tangents||[];
    geom.biTangents=jsonMesh.bitangents||[];
    if(jsonMesh.texturecoords) geom.setTexCoords( jsonMesh.texturecoords[0] );

    if(jsonMesh.vertices_b64) geom.vertices=new Float32Array(CABLES.b64decTypedArray(jsonMesh.vertices_b64));
    if(jsonMesh.normals_b64) geom.vertexNormals=new Float32Array(CABLES.b64decTypedArray(jsonMesh.normals_b64));
    if(jsonMesh.tangents_b64) geom.tangents=new Float32Array(CABLES.b64decTypedArray(jsonMesh.tangents_b64));
    if(jsonMesh.bitangents_b64) geom.biTangents=new Float32Array(CABLES.b64decTypedArray(jsonMesh.bitangents_b64));
    if(jsonMesh.texturecoords_b64) geom.setTexCoords( new Float32Array(CABLES.b64decTypedArray(jsonMesh.texturecoords_b64[0])));

    if(jsonMesh.faces_b64)
    {
        geom.verticesIndices=new Uint32Array(CABLES.b64decTypedArray(jsonMesh.faces_b64));
    }
    else
    {
        geom.verticesIndices.length=jsonMesh.faces.length*3;
        for(var i=0;i<jsonMesh.faces.length;i++)
        {
            geom.verticesIndices[i*3]=jsonMesh.faces[i][0];
            geom.verticesIndices[i*3+1]=jsonMesh.faces[i][1];
            geom.verticesIndices[i*3+2]=jsonMesh.faces[i][2];
        }
    }

    return geom;
};
