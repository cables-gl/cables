"use strict";

/**
 * @constructor
 * @name CGL.Geometry
 * @memberof CGL
 * @param {string} name
 * @class
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
 * @function
 * @description clear all buffers/set them to length 0
 * @name CGL.Geometry#clear
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
 * @function
 * @name CGL.Geometry#getAttributes
 * @return returns array of attribute objects
 */
CGL.Geometry.prototype.getAttributes=function()
{
    return this._attributes;
};

/**
 * @function
 * @name CGL.Geometry#getAttribute
 * @param {string} name
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
 * @function
 * @description create an attribute
 * @name CGL.Geometry#setAttribute
 * @param {string} name
 * @param {array} data
 * @param {number} itemsize
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
 * @function
 * @description set vertices
 * @name CGL.Geometry#setVertices
 * @param {array|float32array} data [x,y,z,x,y,z,...]
 */
CGL.Geometry.prototype.setVertices=function(arr)
{
    if(arr instanceof Float32Array)this._vertices=arr;
        else this._vertices=new Float32Array(arr);
};

/**
 * @function
 * @description set texcoords
 * @name CGL.Geometry#setTexCoords
 * @param {array|float32array} data [u,v,u,v,...]
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

    // TODO why does this have indizes ???????????????????????????

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
        geom.tangents.length=this.tangents.length;
        for(i=0;i<this.tangents.length;i++) geom.tangents[i]=this.tangents[i];
    }

    if(this.biTangents)
    {
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
};


CGL.Geometry.prototype.isIndexed=function()
{
    return this.verticesIndices.length!=0;
};


CGL.Geometry.prototype.unIndex=function()
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

    // TODO why does unindexed has indizes ???????????????????????????
    this.verticesIndices=newIndizes;
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

        // this.faceVertCount=verticesIndices.length;
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

    // console.log(jsonMesh.vertices[2],geom.vertices[2]);
    // console.log(jsonMesh.vertices.length,geom.vertices.length);
    // console.log(geom);

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