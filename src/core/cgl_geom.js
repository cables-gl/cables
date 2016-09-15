
CGL.Geometry=function()
{
    this.faceVertCount=3;
    this.vertices=[];
    this.verticesIndices=[];
    this.texCoords=[];
    this.texCoordsIndices=[];
    this.vertexNormals=[];
    this.baycentrics=[];
    this.morphTargets=[];
    this.vertexColors=[];

    this._indexed=true;
};

CGL.Geometry.prototype.clear=function()
{
    this._indexed=true;
    this.vertices.length=0;
    this.verticesIndices.length=0;
    this.texCoords.length=0;
    this.texCoordsIndices.length=0;
    this.vertexNormals.length=0;
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
    this.vertices=verts;
    this.texCoords.length=verts.length/3*2;
    this.verticesIndices.length=verts.length/3;

    for(i=0;i<verts.length/3;i++)
    {
        this.verticesIndices[i]=i;
        this.texCoords[i*2]=0;
        this.texCoords[i*2+1]=0;
    }
};


CGL.Geometry.prototype.merge=function(geom)
{
    var oldIndizesLength=this.verticesIndices.length;
    var vertLength=this.vertices.length/3;

    this.verticesIndices.length=this.verticesIndices.length+geom.verticesIndices.length;
    for(var i=0;i<geom.verticesIndices.length;i++)
    {
        this.verticesIndices[oldIndizesLength+i]=geom.verticesIndices[i]+vertLength;
    }

    // console.log('this.vertices.length',this.vertices.length);

    this.vertices=this.vertices.concat(geom.vertices);

    // console.log('this.vertices.length',this.vertices.length);

    this.texCoords=this.texCoords.concat(geom.texCoords);
    this.vertexNormals=this.vertexNormals.concat(geom.vertexNormals);

};

CGL.Geometry.prototype.copy=function()
{
    var i=0;
    var geom=new CGL.Geometry();
    geom.faceVertCount=this.faceVertCount;

    geom.vertices.length=this.vertices.length;
    for(i=0;i<this.vertices.length;i++) geom.vertices[i]=this.vertices[i];

    geom.verticesIndices.length=this.verticesIndices.length;
    for(i=0;i<this.verticesIndices.length;i++) geom.verticesIndices[i]=this.verticesIndices[i];

    geom.texCoords.length=this.texCoords.length;
    for(i=0;i<this.texCoords.length;i++) geom.texCoords[i]=this.texCoords[i];

    geom.texCoordsIndices.length=this.texCoordsIndices.length;
    for(i=0;i<this.texCoordsIndices.length;i++) geom.texCoordsIndices[i]=this.texCoordsIndices[i];

    geom.vertexNormals.length=this.vertexNormals.length;
    for(i=0;i<this.vertexNormals.length;i++) geom.vertexNormals[i]=this.vertexNormals[i];

    geom.baycentrics.length=this.baycentrics.length;
    for(i=0;i<this.baycentrics.length;i++) geom.baycentrics[i]=this.baycentrics[i];

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

    var i=0;

    // console.log('calcNormals');

    this.vertexNormals.length=this.vertices.length;
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

    // console.log('this.vertices',this.vertices.length);
    // console.log('this.vertexNormals',this.vertexNormals.length);
    // console.log('calc vertexnormals');

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


CGL.Geometry.prototype.addFace=function(a,b,c)
{
    var face=[-1,-1,-1];

    for(var iv=0;iv<this.vertices;iv+=3)
    {
        if( this.vertices[iv+0]==a[0] &&
            this.vertices[iv+1]==a[1] &&
            this.vertices[iv+2]==a[2]) face[0]=iv/3;

        if( this.vertices[iv+0]==b[0] &&
            this.vertices[iv+1]==b[1] &&
            this.vertices[iv+2]==b[2]) face[1]=iv/3;

        if( this.vertices[iv+0]==c[0] &&
            this.vertices[iv+1]==c[1] &&
            this.vertices[iv+2]==c[2]) face[2]=iv/3;
    }

    if(face[0]==-1)
    {
        this.vertices.push(a[0],a[1],a[2]);
        face[0]=(this.vertices.length-1)/3;
    }

    if(face[1]==-1)
    {
        this.vertices.push(b[0],b[1],b[2]);
        face[1]=(this.vertices.length-1)/3;
    }

    if(face[2]==-1)
    {
        this.vertices.push(c[0],c[1],c[2]);
        face[2]=(this.vertices.length-1)/3;
    }

    this.verticesIndices.push( parseInt( face[0],10 ) );
    this.verticesIndices.push( parseInt( face[1],10 ) );
    this.verticesIndices.push( parseInt( face[2],10 ) );

    this.faceVertCount=this.verticesIndices.length;

};




CGL.Geometry.prototype.isIndexed=function()
{
    return this._indexed;
};


CGL.Geometry.prototype.unIndex=function()
{
    this._indexed=false;
    var newVerts=[];
    var newIndizes=[];
    var newTexCoords=[];

    var count=0;
    // console.log('unindexing');
    this.vertexNormals.length=0;

    for(i=0;i<this.verticesIndices.length;i+=3)
    {
        newVerts.push(this.vertices[this.verticesIndices[i+0]*3+0]);
        newVerts.push(this.vertices[this.verticesIndices[i+0]*3+1]);
        newVerts.push(this.vertices[this.verticesIndices[i+0]*3+2]);

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
    this.verticesIndices=newIndizes;
    // console.log(newTexCoords);

};

CGL.Geometry.prototype.calcBaycentric=function()
{
    this.baycentrics.length=this.vertices.length;

    for(i=0;i<this.vertices.length;i++) this.baycentrics[i]=0;

    var count=0;
    for(i=0;i<this.vertices.length;i+=3)
    {
        this.baycentrics[i+count]=1;
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

    return bounds;
};

CGL.Geometry.prototype.center=function()
{

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
            this.vertices[i+0]-=offset[0];
            this.vertices[i+1]-=offset[1];
            this.vertices[i+2]-=offset[2];
        }
    }

    return offset;
};

CGL.Geometry.prototype.mapTexCoords2d=function()
{
    var bounds=this.getBounds();

    var num=this.vertices.length/3;
    this.texCoords.length=num*2;

    for(var i=0;i<num;i++)
    {
        var vertX=this.vertices[i*3+0];
        var vertY=this.vertices[i*3+1];
        this.texCoords[i*2+0]=vertX/(bounds.maxX-bounds.minX)/2+0.5;
        this.texCoords[i*2+1]=1.0-vertY/(bounds.maxY-bounds.minY)/2+0.5;
    }

};








// -----------------

CGL.WirePoint=function(cgl,size)
{
    var buffer = cgl.gl.createBuffer();

    function bufferData()
    {
        var points=[];
        var segments=4;
        var i=0,degInRad=0;
        var radius=size || 1.0;

        for (i=0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0/Math.round(segments))*i*CGL.DEG2RAD;
            points.push(Math.cos(degInRad)*radius);
            points.push(0);
            points.push(Math.sin(degInRad)*radius);
        }

        for (i=0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0/Math.round(segments))*i*CGL.DEG2RAD;
            points.push(Math.cos(degInRad)*radius);
            points.push(Math.sin(degInRad)*radius);
            points.push(0);
        }

        for (i=0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0/Math.round(segments))*i*CGL.DEG2RAD;
            points.push(0);
            points.push(Math.cos(degInRad)*radius);
            points.push(Math.sin(degInRad)*radius);
        }

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(points), cgl.gl.STATIC_DRAW);
        buffer.itemSize = 3;
        buffer.numItems = points.length/buffer.itemSize;
    }


    this.render=function(cgl)
    {
        cgl.pushMvMatrix();

        var shader=cgl.getDefaultShader();
        shader.bind();
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);

        cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
        cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, buffer.numItems);

        cgl.popMvMatrix();

    };

    bufferData();

};


CGL.Geometry.LinesToGeom=function(points,options)
{
    var verts=[];
    var tc=[];
    var indices=[];
    var norms=[];
    var i=0;

    options=options||{};
    options.thickness=options.thickness||0.1;

    points=points||[];

    if(points.length===0)
    {
        for(i=0;i<7;i++)
        {
            points.push(Math.random()*2-1);
            points.push(Math.random()*2-1);
            points.push(0);
        }
    }

    var rectPoints=[];
    var count=0;
    var lastPA=null;
    var lastPB=null;

    rectPoints.length=points.length/3*18+18;

    var vecRot=vec3.create();
    var lastC=null;
    var lastD=null;

    var vecA=vec3.create();
    var vecB=vec3.create();
    var vecC=vec3.create();
    var vecD=vec3.create();
    var index=0;

    for(var p=0;p<points.length;p+=3)
    {
        var vStart=vec3.create();
        var vEnd=vec3.create();
        var q=quat.create();

        vec3.set(vStart,points[p+0],points[p+1],points[p+2]);
        vec3.set(vEnd  ,points[p+3]-points[p+0],
        points[p+4]-points[p+1],
        points[p+5]-points[p+2]);

        vec3.normalize(vEnd,vEnd);
        quat.rotationTo(q,[1,0,0],vEnd);

        vec3.set(vecRot, 1,0,0);

        quat.rotateZ(q, q, Math.PI/2);

        vec3.transformQuat(vecRot,vecRot,q);

        var m=options.thickness/2;

        vec3.set(vecA,
            points[p+0]+vecRot[0]*m,
            points[p+1]+vecRot[1]*m,
            points[p+2]+vecRot[2]*m);

        vec3.set(vecB,
            points[p+0]+vecRot[0]*-m,
            points[p+1]+vecRot[1]*-m,
            points[p+2]+vecRot[2]*-m);

        vec3.set(vecC,
            points[p+3]+vecRot[0]*m,
            points[p+4]+vecRot[1]*m,
            points[p+5]+vecRot[2]*m);

        vec3.set(vecD,
            points[p+3]+vecRot[0]*-m,
            points[p+4]+vecRot[1]*-m,
            points[p+5]+vecRot[2]*-m);

        // a
        rectPoints[index++ ]=vecA[0];
        rectPoints[index++ ]=vecA[1];
        rectPoints[index++ ]=vecA[2];

        // b
        rectPoints[index++ ]=vecB[0];
        rectPoints[index++ ]=vecB[1];
        rectPoints[index++ ]=vecB[2];

        // c
        rectPoints[index++ ]=vecC[0];
        rectPoints[index++ ]=vecC[1];
        rectPoints[index++ ]=vecC[2];

        // d
        rectPoints[index++ ]=vecD[0];
        rectPoints[index++]=vecD[1];
        rectPoints[index++]=vecD[2];

        // c
        rectPoints[index++ ]=vecC[0];
        rectPoints[index++ ]=vecC[1];
        rectPoints[index++ ]=vecC[2];

        // b
        rectPoints[index++]=vecB[0];
        rectPoints[index++]=vecB[1];
        rectPoints[index++]=vecB[2];

        if(lastC)
        {
            rectPoints[index++]=vecA[0];
            rectPoints[index++]=vecA[1];
            rectPoints[index++]=vecA[2];

            rectPoints[index++]=vecB[0];
            rectPoints[index++]=vecB[1];
            rectPoints[index++]=vecB[2];

            rectPoints[index++]=lastC[0];
            rectPoints[index++]=lastC[1];
            rectPoints[index++]=lastC[2];


            rectPoints[index++]=lastD[0];
            rectPoints[index++]=lastD[1];
            rectPoints[index++]=lastD[2];

            rectPoints[index++]=vecA[0];
            rectPoints[index++]=vecA[1];
            rectPoints[index++]=vecA[2];

            rectPoints[index++]=vecB[0];
            rectPoints[index++]=vecB[1];
            rectPoints[index++]=vecB[2];
        }
        else
        {
            lastC=vec3.create();
            lastD=vec3.create();
        }

        lastC[0]=vecC[0];
        lastC[1]=vecC[1];
        lastC[2]=vecC[2];

        lastD[0]=vecD[0];
        lastD[1]=vecD[1];
        lastD[2]=vecD[2];
    }

    verts=rectPoints;

    // console.log(rectPoints);
    for(i=0;i<rectPoints.length;i++)
    {
        tc.push(0);
        tc.push(0);
    }

    count=0;
    for(i=0;i<rectPoints.length;i+=3)
    {
        indices.push(count);
        count++;
    }

    var geom=new CGL.Geometry();
    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    geom.calculateNormals({forceZUp:false});

    // if(!mesh) mesh=new CGL.Mesh(cgl,geom);
    //     else mesh.setGeom(geom);

    return geom;

};
