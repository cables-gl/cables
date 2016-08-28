var CGL=CGL || {};
CGL.MESH=CGL.MESH || {};

CGL.MESH.lastShader=null;
CGL.MESH.lastMesh=null;

CGL.Mesh=function(_cgl,geom,glPrimitive)
{
    var cgl=_cgl;
    var bufVertices = cgl.gl.createBuffer();
    var bufVerticesIndizes = cgl.gl.createBuffer();
    var attributes=[];
    var _geom=null;
    this.numInstances=0;
    // var glPrimitive=_triangleMode || cgl.gl.TRIANGLES;
    var ext = cgl.gl.getExtension("ANGLE_instanced_arrays");
    this.addVertexNumbers=false;

    function setAttribute(name,array,itemSize,cb)
    {
        var arr=null;

        if(array instanceof Float32Array)arr=new Float32Array(array);
        else arr=new Float32Array(array);

        for(var i=0;i<attributes.length;i++)
        {
            if(attributes[i].name==name)
            {
                cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, attributes[i].buffer);
                cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, arr, cgl.gl.STATIC_DRAW);
                return;
            }
        }

        var buffer= cgl.gl.createBuffer();

        // console.log('attribute: '+name,array.length);
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, arr, cgl.gl.STATIC_DRAW);

        var attr=
            {
                loc:-1,
                buffer:buffer,
                name:name,
                cb:cb,
                itemSize:itemSize,
                numItems: array.length/itemSize
            };

        attributes.push(attr);

        for(i=0;i<attributes.length;i++)
        {
            attributes[i].loc=-1;
        }
        // cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, null);

    }
    this.addAttribute=setAttribute;
    this.updateAttribute=setAttribute;

    this.getAttributes=function()
    {
        return attributes;
    };



    this.setGeom=function(geom)
    {
        CGL.MESH.lastShader=null;
        CGL.MESH.lastMesh=null;

        if(!this.meshChanged()) this.unBind();
        var i=0;

        attributes.length=0;

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, bufVertices);
        cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(geom.vertices), cgl.gl.STATIC_DRAW);
        bufVertices.itemSize = 3;
        bufVertices.numItems = geom.vertices.length/3;

        if(geom.verticesIndices.length>0)
        {
            cgl.gl.bindBuffer(cgl.gl.ELEMENT_ARRAY_BUFFER, bufVerticesIndizes);
            cgl.gl.bufferData(cgl.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geom.verticesIndices), cgl.gl.STATIC_DRAW);
            bufVerticesIndizes.itemSize = 1;
            bufVerticesIndizes.numItems = geom.verticesIndices.length;
        }
        else bufVerticesIndizes.numItems=0;

        if(geom.vertexNormals.length>0) setAttribute('attrVertNormal',geom.vertexNormals,3);
        if(geom.texCoords && geom.texCoords.length>0) setAttribute('attrTexCoord',geom.texCoords,2);
        if(geom.hasOwnProperty('tangents') && geom.tangents && geom.tangents.length>0) setAttribute('attrTangent',geom.tangents,3);
        if(geom.hasOwnProperty('biTangents') && geom.biTangents && geom.biTangents.length>0) setAttribute('attrBiTangent',geom.biTangents,3);
        if(geom.vertexColors.length>0) setAttribute('attrVertColor',geom.vertexColors,4);

        // make this optional!
    	if(this.addVertexNumbers)
    	{
           	var verticesNumbers=[];
            verticesNumbers.length=geom.vertices.length/3;
            for(i=0;i<geom.vertices.length/3;i++)verticesNumbers[i]=i;
            setAttribute('attrVertIndex',verticesNumbers,1,function(attr,geom,shader)
                {
                    if(!shader.uniformNumVertices) shader.uniformNumVertices=new CGL.Uniform(shader,'f','numVertices',geom.vertices.length/3);
                    shader.uniformNumVertices.setValue(geom.vertices.length/3);
    	    });
    	}
        // for(i=0;i<geom.morphTargets.length;i++) addAttribute('attrMorphTargetA',geom.morphTargets[i],3);
    };


    function preBind(shader)
    {
        for(i=0;i<attributes.length;i++)
        {
            if(attributes[i].cb)
            {
                attributes[i].cb(attributes[i],geom,shader);
            }
        }
    }

    function bind(shader)
    {
        cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, bufVertices);
        cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(),bufVertices.itemSize, cgl.gl.FLOAT, false, 0, 0);

        for(i=0;i<attributes.length;i++)
        {
            attributes[i].loc = cgl.gl.getAttribLocation(shader.getProgram(), attributes[i].name);

            if(attributes[i].loc!=-1)
            {
                cgl.gl.enableVertexAttribArray(attributes[i].loc);
                cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, attributes[i].buffer);

                if(attributes[i].name=='instMat')
                {
                    // todo: make create attribute flag for instanced stuff...
                    // todo: easier way to fill mat4 attribs...

                    cgl.gl.vertexAttribPointer(attributes[i].loc, 4, cgl.gl.FLOAT,  false, 16*4,0);
                    cgl.gl.enableVertexAttribArray(attributes[i].loc+1);
                    cgl.gl.vertexAttribPointer(attributes[i].loc+1, 4, cgl.gl.FLOAT,  false, 16*4, 4*4*1);
                    cgl.gl.enableVertexAttribArray(attributes[i].loc+2);
                    cgl.gl.vertexAttribPointer(attributes[i].loc+2, 4, cgl.gl.FLOAT,  false, 16*4, 4*4*2);
                    cgl.gl.enableVertexAttribArray(attributes[i].loc+3);
                    cgl.gl.vertexAttribPointer(attributes[i].loc+3, 4, cgl.gl.FLOAT,  false, 16*4, 4*4*3);

                    ext.vertexAttribDivisorANGLE(attributes[i].loc, 1);
                    ext.vertexAttribDivisorANGLE(attributes[i].loc+1, 1);
                    ext.vertexAttribDivisorANGLE(attributes[i].loc+2, 1);
                    ext.vertexAttribDivisorANGLE(attributes[i].loc+3, 1);
                }
                else
                {
                    cgl.gl.vertexAttribPointer(attributes[i].loc,attributes[i].itemSize, cgl.gl.FLOAT, false, attributes[i].itemSize*4, 0);
                }


            }
        }

        if(bufVerticesIndizes.numItems!==0) cgl.gl.bindBuffer(cgl.gl.ELEMENT_ARRAY_BUFFER, bufVerticesIndizes);
    }

    this.unBind=function(shader)
    {
        // cgl.gl.enableVertexAttribArray(null);

        cgl.lastMesh=null;
        cgl.lastMeshShader=null;

        // cgl.gl.disableVertexAttribArray(shader.getAttrVertexPos());

        for(i=0;i<attributes.length;i++)
        {
            if(attributes[i].loc!=-1) cgl.gl.disableVertexAttribArray(attributes[i].loc);
            if(attributes[i].name=='instMat')
            {
                ext.vertexAttribDivisorANGLE(attributes[i].loc, 0);
                ext.vertexAttribDivisorANGLE(attributes[i].loc+1, 0);
                ext.vertexAttribDivisorANGLE(attributes[i].loc+2, 0);
                ext.vertexAttribDivisorANGLE(attributes[i].loc+3, 0);
                cgl.gl.disableVertexAttribArray(attributes[i].loc+1);
                cgl.gl.disableVertexAttribArray(attributes[i].loc+2);
                cgl.gl.disableVertexAttribArray(attributes[i].loc+3);
            }
        }

        // cgl.gl.bindBuffer(cgl.gl.ELEMENT_ARRAY_BUFFER, null);
    };

    this.meshChanged=function()
    {
        return (cgl.lastMesh && ( cgl.lastMesh!=this ));
    };

    this.render=function(shader)
    {
        // TODO: enable/disablevertex only if the mesh has changed... think drawing 10000x the same mesh

        if(!shader) return;
        var i=0;

        if(shader.wireframe && geom.isIndexed())
        {
            geom.unIndex();
            geom.calcBaycentric();
            this.setGeom(geom);

            setAttribute('attrBaycentric',geom.baycentrics,3);
        }

        // var meshChanged=this.meshChanged();

        // if(meshChanged)
        // cgl.lastMesh.unBind();

        var needsBind=false;
        if(CGL.MESH.lastMesh!=this || CGL.MESH.lastShader!=shader)
        {
            needsBind=true;
            if(CGL.MESH.lastMesh && CGL.MESH.lastShader) CGL.MESH.lastMesh.unBind(CGL.MESH.lastShader);
        }
        if(!CGL.MESH.lastMesh || !CGL.MESH.lastShader) needsBind=true;
        if(needsBind) preBind(shader);

        shader.bind();

        if(needsBind) bind(shader);


        CGL.MESH.lastMesh=this;
        CGL.MESH.lastShader=shader;

        // if(geom.morphTargets.length>0) shader.define('HAS_MORPH_TARGETS');
        // var what=cgl.gl.TRIANGLES;


        var prim=cgl.gl.TRIANGLES;
        if(glPrimitive!==undefined) prim=glPrimitive;
        if(shader.glPrimitive!==null) prim=shader.glPrimitive;

        // console.log(shader.glPrimitive);

        // if(prim==cgl.gl.POINTS) console.log('points');
        // if(shader.glPrimitive==cgl.gl.POINTS) console.log('shader points');
        // if(shader.glPrimitive==1)prim=cgl.gl.POINTS;
        // if(shader.glPrimitive==2)prim=cgl.gl.LINE_STRIP;
        // if(cgl.points)prim=; // todo this should be in the shader...
        // prim=cgl.gl.LINE_STRIP;

        if(bufVerticesIndizes.numItems===0)
        {
            cgl.gl.drawArrays(prim, 0,bufVertices.numItems);
        }
        else
        {
            if(this.numInstances===0)
            {
                cgl.gl.drawElements(prim, bufVerticesIndizes.numItems, cgl.gl.UNSIGNED_SHORT, 0);
            }
            else
            {
                ext.drawElementsInstancedANGLE(prim, bufVerticesIndizes.numItems, cgl.gl.UNSIGNED_SHORT, 0,this.numInstances);
            }

        }

        // this.unBind(shader);

        // cgl.lastMesh=this;
        // cgl.lastMeshShader=shader;

    };


    this.setGeom(geom);
};

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

    var indexed=true;

    this.copy=function()
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

    this.isIndexed=function()
    {
        return indexed;
    };


    this.unIndex=function()
    {
        indexed=false;
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

    this.calcBaycentric=function()
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


    // deprecated
    this.calcNormals=function(smooth)
    {
        var options={};

        if(!smooth)
        {
            this.unIndex();
        }

        this.calculateNormals(options);
    };

    this.calculateNormals=function(options)
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

    this.clear=function()
    {
        indexed=true;
        this.vertices.length=0;
        this.verticesIndices.length=0;
        this.texCoords.length=0;
        this.texCoordsIndices.length=0;
        this.vertexNormals.length=0;
    };

    this.setPointVertices=function(verts)
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

    this.addFace=function(a,b,c)
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
};

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
            points.push(Math.random()*2-1);
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
