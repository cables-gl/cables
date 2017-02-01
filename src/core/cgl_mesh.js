var CGL=CGL || {};
CGL.MESH=CGL.MESH || {};

CGL.MESH.lastShader=null;
CGL.MESH.lastMesh=null;

CGL.Mesh=function(_cgl,__geom,glPrimitive)
{
    this._cgl=_cgl;
    this._bufVertices = this._cgl.gl.createBuffer();
    this._bufVerticesIndizes = this._cgl.gl.createBuffer();
    this._attributes=[];
    this._geom=null;
    this.numInstances=0;
    this._glPrimitive=glPrimitive;

    this.addVertexNumbers=false;

    this.setGeom(__geom);



};

CGL.Mesh.prototype.setAttribute=function(name,array,itemSize,options)
{
    var arr=null;
    var cb=null;
    var instanced=false;

    if(typeof options=='function')
    {
        // deprecated
        cb=options;
    }
    if(typeof options=='object')
    {
        if(options.cb)cb=options.cb;
        if(options.instanced)instanced=options.instanced;
    }

    if(!(array instanceof Float32Array))
    {
        arr=new Float32Array(array);
        CGL.profileNonTypedAttrib++;
        CGL.profileNonTypedAttribNames=this._geom.name+' '+name+' ';
    }
    else arr=array;

    for(var i=0;i<this._attributes.length;i++)
    {
        if(this._attributes[i].name==name)
        {
            this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, this._attributes[i].buffer);
            this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, arr, this._cgl.gl.DYNAMIC_DRAW);
            return;
        }
    }

    var buffer= this._cgl.gl.createBuffer();

    // console.log('attribute: '+name,array.length);
    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, buffer);
    this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, arr, this._cgl.gl.DYNAMIC_DRAW);

    var attr=
        {
            loc:-1,
            buffer:buffer,
            name:name,
            cb:cb,
            itemSize:itemSize,
            numItems: array.length/itemSize,
            instanced:instanced
        };

    this._attributes.push(attr);

    for(i=0;i<this._attributes.length;i++)
    {
        this._attributes[i].loc=-1;
    }
    // this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, null);
};

CGL.Mesh.prototype.addAttribute=CGL.Mesh.prototype.setAttribute;
CGL.Mesh.prototype.updateAttribute=CGL.Mesh.prototype.setAttribute;

CGL.Mesh.prototype.getAttributes=function()
{
    return this._attributes;
};

CGL.Mesh.prototype.updateVertices=function(geom)
{
    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, this._bufVertices);

    var verticeBuffer=geom.vertices;
    if(!(verticeBuffer instanceof Float32Array))
    {
        CGL.profileNonTypedAttrib++;
        CGL.profileNonTypedAttribNames=this._geom.name+' '+name+' ';
        verticeBuffer=new Float32Array(geom.vertices);
    }

    this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, verticeBuffer, this._cgl.gl.DYNAMIC_DRAW);

    this._bufVertices.itemSize = 3;
    this._bufVertices.numItems = geom.vertices.length/3;
};

CGL.Mesh.prototype.updateTexCoords=function(geom)
{
    if(geom.texCoords && geom.texCoords.length>0) this.setAttribute('attrTexCoord',geom.texCoords,2);
};

CGL.Mesh.prototype.setGeom=function(geom)
{
    this._geom=geom;
    CGL.MESH.lastShader=null;
    CGL.MESH.lastMesh=null;

    CGL.profileMeshSetGeom++;

    if(!this.meshChanged()) this.unBind();
    var i=0;

    this._attributes.length=0;

    this.updateVertices(this._geom);

    if(this._geom.verticesIndices.length>0)
    {
        this._cgl.gl.bindBuffer(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this._bufVerticesIndizes);

        if(!this.vertIndicesTyped || this.vertIndicesTyped.length!=this._geom.verticesIndices.length)
            this.vertIndicesTyped=new Uint16Array(this._geom.verticesIndices);


        this._cgl.gl.bufferData(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this.vertIndicesTyped, this._cgl.gl.DYNAMIC_DRAW);
        this._bufVerticesIndizes.itemSize = 1;
        this._bufVerticesIndizes.numItems = this._geom.verticesIndices.length;
    }
    else this._bufVerticesIndizes.numItems=0;

    if(this._geom.vertexNormals.length>0) this.setAttribute('attrVertNormal',this._geom.vertexNormals,3);

    this.updateTexCoords(this._geom);

    if(this._geom.hasOwnProperty('tangents') && this._geom.tangents && this._geom.tangents.length>0) this.setAttribute('attrTangent',this._geom.tangents,3);
    if(this._geom.hasOwnProperty('biTangents') && this._geom.biTangents && this._geom.biTangents.length>0) this.setAttribute('attrBiTangent',this._geom.biTangents,3);
    if(this._geom.vertexColors.length>0) this.setAttribute('attrVertColor',this._geom.vertexColors,4);



	if(this.addVertexNumbers)
	{
        var numVerts=this._geom.vertices.length/3;
        if(!this._verticesNumbers || this._verticesNumbers.length!=numVerts)
        {
            this._verticesNumbers=new Float32Array(numVerts);

            for(i=0;i<numVerts;i++)this._verticesNumbers[i]=i;

            this.setAttribute('attrVertIndex',this._verticesNumbers,1,
                function(attr,geom,shader)
                {
                    if(!shader.uniformNumVertices) shader.uniformNumVertices=new CGL.Uniform(shader,'f','numVertices',geom.vertices.length/3);
                    shader.uniformNumVertices.setValue(geom.vertices.length/3);
               });
       }
	}
    // for(i=0;i<this._geom.morphTargets.length;i++) addAttribute('attrMorphTargetA',this._geom.morphTargets[i],3);
};


CGL.Mesh.prototype._preBind=function(shader)
{
    for(i=0;i<this._attributes.length;i++)
    {
        if(this._attributes[i].cb)
        {
            this._attributes[i].cb(this._attributes[i],this._geom,shader);
        }
    }
};

CGL.Mesh.prototype._bind=function(shader)
{
    this._cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());
    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, this._bufVertices);
    this._cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(),this._bufVertices.itemSize, this._cgl.gl.FLOAT, false, 0, 0);

    for(i=0;i<this._attributes.length;i++)
    {
        this._attributes[i].loc = this._cgl.gl.getAttribLocation(shader.getProgram(), this._attributes[i].name);

        if(this._attributes[i].loc!=-1)
        {
            this._cgl.gl.enableVertexAttribArray(this._attributes[i].loc);
            this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, this._attributes[i].buffer);

            if(this._attributes[i].instanced || this._attributes[i].name=='instMat')
            {
                // todo: easier way to fill mat4 attribs...
                if(this._attributes[i].itemSize<=4)
                {
                    this._cgl.gl.vertexAttribPointer(this._attributes[i].loc, this._attributes[i].itemSize, this._cgl.gl.FLOAT,  false, this._attributes[i].itemSize*4,0);
                    this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc, 1);
                }
                if(this._attributes[i].itemSize==16)
                {
                    this._cgl.gl.vertexAttribPointer(this._attributes[i].loc, 4, this._cgl.gl.FLOAT,  false, 16*4,0);
                    this._cgl.gl.enableVertexAttribArray(this._attributes[i].loc+1);
                    this._cgl.gl.vertexAttribPointer(this._attributes[i].loc+1, 4, this._cgl.gl.FLOAT,  false, 16*4, 4*4*1);
                    this._cgl.gl.enableVertexAttribArray(this._attributes[i].loc+2);
                    this._cgl.gl.vertexAttribPointer(this._attributes[i].loc+2, 4, this._cgl.gl.FLOAT,  false, 16*4, 4*4*2);
                    this._cgl.gl.enableVertexAttribArray(this._attributes[i].loc+3);
                    this._cgl.gl.vertexAttribPointer(this._attributes[i].loc+3, 4, this._cgl.gl.FLOAT,  false, 16*4, 4*4*3);

                    this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc, 1);
                    this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc+1, 1);
                    this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc+2, 1);
                    this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc+3, 1);
                }
            }
            else
            {
                this._cgl.gl.vertexAttribPointer(this._attributes[i].loc,this._attributes[i].itemSize, this._cgl.gl.FLOAT, false, this._attributes[i].itemSize*4, 0);
            }
        }
    }

    if(this._bufVerticesIndizes.numItems!==0) this._cgl.gl.bindBuffer(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this._bufVerticesIndizes);
};

CGL.Mesh.prototype.unBind=function(shader)
{
    this._cgl.lastMesh=null;
    this._cgl.lastMeshShader=null;

    for(i=0;i<this._attributes.length;i++)
    {
        if(this._attributes[i].instanced || this._attributes[i].name=='instMat')
        {
            // todo: easier way to fill mat4 attribs...
            if(this._attributes[i].itemSize<=4)
            {
                this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc, 0);
                // this._cgl.gl.disableVertexAttribArray(this._attributes[i].loc);
            }
            else
            {
                this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc, 0);
                this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc+1, 0);
                this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc+2, 0);
                this._cgl.gl.vertexAttribDivisor(this._attributes[i].loc+3, 0);
                this._cgl.gl.disableVertexAttribArray(this._attributes[i].loc+1);
                this._cgl.gl.disableVertexAttribArray(this._attributes[i].loc+2);
                this._cgl.gl.disableVertexAttribArray(this._attributes[i].loc+3);
            }
        }

        if(this._attributes[i].loc!=-1) this._cgl.gl.disableVertexAttribArray(this._attributes[i].loc);
    }
};

CGL.Mesh.prototype.meshChanged=function()
{
    return (this._cgl.lastMesh && ( this._cgl.lastMesh!=this ));
};


CGL.Mesh.hadError=false;

CGL.Mesh.prototype.printDebug=function(shader)
{
    if(CGL.Mesh.hadError)return;
    var error = this._cgl.gl.getError();
    if (error != this._cgl.gl.NO_ERROR )
    {
        CGL.Mesh.hadError=true;
        if(error==this._cgl.gl.OUT_OF_MEMORY)console.log("OUT_OF_MEMORY");
        if(error==this._cgl.gl.INVALID_ENUM)console.log("INVALID_ENUM");
        if(error==this._cgl.gl.INVALID_OPERATION)console.log("INVALID_OPERATION");
        if(error==this._cgl.gl.INVALID_FRAMEBUFFER_OPERATION)console.log("INVALID_FRAMEBUFFER_OPERATION");
        if(error==this._cgl.gl.INVALID_VALUE)console.log("INVALID_VALUE");
        if(error==this._cgl.gl.CONTEXT_LOST_WEBGL)console.log("CONTEXT_LOST_WEBGL");
        if(error==this._cgl.gl.NO_ERROR)console.log("NO_ERROR");


        console.error('mesh error');
        console.log('shader:',shader.name);
        console.log('geom:',this._geom.name);
        console.log('verts:',this._geom.vertices.length);
        if(this._geom.tangents)console.log('tangents:',this._geom.tangents.length);
        console.log('texCoords:',this._geom.texCoords.length);
        console.log('texCoords indizes:',this._geom.texCoordsIndices.length);
        console.log('indizes:',this._geom.verticesIndices.length);

        var maxIndex=0;
        for(var j=0;j<this._geom.verticesIndices.length;j++)
        {
            maxIndex=Math.max(this._geom.verticesIndices[j],maxIndex);
        }
        console.log('max index',maxIndex);
        console.log('get error: ',error);

        shader.printStats();
    }
};


CGL.Mesh.prototype.render=function(shader)
{
    // TODO: enable/disablevertex only if the mesh has changed... think drawing 10000x the same mesh

    if(!shader) return;
    var i=0;

    if(shader.wireframe && this._geom.isIndexed())
    {
        this._geom.unIndex();
        this._geom.calcBaycentric();
        this.setGeom(this._geom);

        this.setAttribute('attrBaycentric',this._geom.baycentrics,3);
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
    if(needsBind) this._preBind(shader);

    shader.bind();

    if(needsBind) this._bind(shader);


    CGL.MESH.lastMesh=this;
    CGL.MESH.lastShader=shader;

    // if(geom.morphTargets.length>0) shader.define('HAS_MORPH_TARGETS');
    // var what=this._cgl.gl.TRIANGLES;


    var prim=this._cgl.gl.TRIANGLES;
    if(this._glPrimitive!==undefined) prim=this._glPrimitive;
    if(shader.glPrimitive!==null) prim=shader.glPrimitive;

    // console.log(shader.glPrimitive);

    // if(prim==this._cgl.gl.POINTS) console.log('points');
    // if(shader.glPrimitive==this._cgl.gl.POINTS) console.log('shader points');
    // if(shader.glPrimitive==1)prim=this._cgl.gl.POINTS;
    // if(shader.glPrimitive==2)prim=this._cgl.gl.LINE_STRIP;
    // if(cgl.points)prim=; // todo this should be in the shader...
    // prim=this._cgl.gl.LINE_STRIP;

    if(this._bufVerticesIndizes.numItems===0)
    {
        this._cgl.gl.drawArrays(prim, 0,this._bufVertices.numItems);
    }
    else
    {
        if(this.numInstances===0)
        {
            this._cgl.gl.drawElements(prim, this._bufVerticesIndizes.numItems, this._cgl.gl.UNSIGNED_SHORT, 0);

            // if(this._bufVerticesIndizes.numItems>100)console.log(this._bufVerticesIndizes.numItems);
        }
        else
        {
            this._cgl.gl.drawElementsInstanced(prim, this._bufVerticesIndizes.numItems, this._cgl.gl.UNSIGNED_SHORT, 0,this.numInstances);
        }

        // this.printDebug(shader);

    }

    // this.unBind(shader);

    // cgl.lastMesh=this;
    // cgl.lastMeshShader=shader;

};
