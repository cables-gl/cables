


 var CGL=CGL || {};
CGL.MESH=CGL.MESH || {};

CGL.MESH.lastShader=null;
CGL.MESH.lastMesh=null;

/**
 * @constructor
 * @memberof CGL
 * @name CGL.Mesh
 * @param {CGL.Context} cgl
 * @param {CGL.Geometry} geometry
 * @param {number} [glPrimitive]
 * @class
 */
CGL.Mesh=function(_cgl,__geom,glPrimitive)
{
    this._cgl=_cgl;
    this._bufVertexAttrib = null;
    this._bufVerticesIndizes = this._cgl.gl.createBuffer();
    this._attributes=[];
    this._attributes=[];
    this._geom=null;
    this._numInstances=0;
    this._glPrimitive=glPrimitive;
    this.addVertexNumbers=false;
    this.feedBackAttributes=[];
    this.setGeom(__geom);

    this._feedBacks=[];
    this._feedBacksChanged=false;
    this._transformFeedBackLoc=-1;
    this._lastAttrUpdate=0;

    Object.defineProperty(this, 'numInstances', {
        get: function() {
            return this._numInstances;
        },
        set: function(v) {
            this.setNumInstances(v)
        }
      });
};

CGL.Mesh.prototype.updateVertices=function(geom)
{
    this.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,geom.vertices,3);
};

CGL.Mesh.prototype.setAttributePointer=function(attrName,name,stride,offset)
{
    for(var i=0;i<this._attributes.length;i++)
    {
        if(this._attributes[i].name==attrName)
        {
            if(!this._attributes[i].pointer) this._attributes[i].pointer=[];
            this._attributes[i].pointer.push(
                {
                    "loc":-1,
                    "name":name,
                    "stride":stride,
                    "offset":offset
                });
        }
    }
};
CGL.Mesh.prototype.addAttribute=
CGL.Mesh.prototype.updateAttribute=
CGL.Mesh.prototype.setAttribute=function(name,array,itemSize,options)
{
    var floatArray=null;
    var cb=null;
    var instanced=false;

    if(typeof options=='function')
    {
        cb=options;
    }

    if(typeof options=='object')
    {
        if(options.cb)cb=options.cb;
        if(options.instanced)instanced=options.instanced;
    }

    if(!(array instanceof Float32Array))
    {
        floatArray=new Float32Array(array);
        CGL.profileNonTypedAttrib++;
        CGL.profileNonTypedAttribNames=this._geom.name+' '+name+' ';
    }
    else floatArray=array;

    var numItems=array.length/itemSize;

    if(numItems===0)
    {
        console.warn('CGL_MESH: num items in attribute '+name+' is ZERO');
        // return;
    }

    for(var i=0;i<this._attributes.length;i++)
    {
        if(this._attributes[i].name==name)
        {
            // console.log('numItems',name,numItems);

            // if(this._attributes[i].numItems!=numItems)
            // {
            //     this._attributes[i].loc=-1;
            //     this._attributes[i].numItems=numItems;
            //
            //     // console.log('updating attrib');
            //
            //     this._cgl.gl.deleteBuffer(this._attributes[i].buffer);
            //     this._attributes[i].buffer=this._cgl.gl.createBuffer();
            // }

            this._attributes[i].numItems=numItems;
            this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, this._attributes[i].buffer);
            this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, floatArray, this._cgl.gl.DYNAMIC_DRAW);

            return this._attributes[i];
        }
    }

    var buffer= this._cgl.gl.createBuffer();

    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, buffer);
    this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, floatArray, this._cgl.gl.DYNAMIC_DRAW);

    var type=this._cgl.gl.FLOAT;
    if(options && options.type)type=options.type;
    var attr=
        {
            loc:-1,
            buffer:buffer,
            name:name,
            cb:cb,
            itemSize:itemSize,
            numItems: numItems,
            startItem: 0,

            instanced:instanced,
            type:type
        };

    if(name==CGL.SHADERVAR_VERTEX_POSITION) this._bufVertexAttrib=attr;
    this._attributes.push(attr);

    for(i=0;i<this._attributes.length;i++) this._attributes[i].loc=-1;



    // console.log('vertIndices',this.vertIndicesTyped.length);
    
    // console.log('attr:',attr.name);
    // console.log('  numItems',numItems);

    // if(attr.name=='attrTexCoord')
    // {
    //     console.log(attr);
    // }

    // for(var i=0;i<vertIndices.length;i++)
    // {
    //     if(vertIndices[i]>=this._geom.vertices.length/3)
    //     {
    //         console.warn("invalid index in "+this._geom.name);
    //         // console.log('this._geom.vertices length',this._geom.vertices.length/3);
    //         // console.log('vertIndices.length',vertIndices.length);
    //         // console.log('index',vertIndices[i]);
    //         return;
    //     }
    // }




    return attr;
    // this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, null);
};


CGL.Mesh.prototype.getAttributes=function()
{
    return this._attributes;
};

CGL.Mesh.prototype.updateTexCoords=function(geom)
{
    if(geom.texCoords && geom.texCoords.length>0)
    {
        this.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,geom.texCoords,2);
    }
    else 
    {
        var tcBuff=new Float32Array( Math.round((geom.vertices.length/3)*2) );
        this.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,tcBuff,2);
    }
};

CGL.Mesh.prototype._setVertexNumbers=function()
{
    var numVerts=this._geom.vertices.length/3;

    if(!this._verticesNumbers || this._verticesNumbers.length!=numVerts)
    {
        this._verticesNumbers=new Float32Array(numVerts);

        for(i=0;i<numVerts;i++)this._verticesNumbers[i]=i;

        this.setAttribute(CGL.SHADERVAR_VERTEX_NUMBER,this._verticesNumbers,1,
            function(attr,geom,shader)
            {
                if(!shader.uniformNumVertices) shader.uniformNumVertices=new CGL.Uniform(shader,'f','numVertices',numVerts);
                shader.uniformNumVertices.setValue(numVerts);
           });
   }
};

CGL.Mesh.prototype.setVertexIndices=function(vertIndices)
{
    if(vertIndices.length>0)
    {

        for(var i=0;i<vertIndices.length;i++)
        {
            if(vertIndices[i]>=this._geom.vertices.length/3)
            {
                console.warn("invalid index in "+this._geom.name);
                // console.log('this._geom.vertices length',this._geom.vertices.length/3);
                // console.log('vertIndices.length',vertIndices.length);
                // console.log('index',vertIndices[i]);
                return;
            }
        }


        this._cgl.gl.bindBuffer(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this._bufVerticesIndizes);

        // todo cache this ?
        // if(!this.vertIndicesTyped || this.vertIndicesTyped.length!=this._geom.verticesIndices.length)

        if(!(vertIndices instanceof Uint16Array)) this.vertIndicesTyped=new Uint16Array(vertIndices);
            else this.vertIndicesTyped=vertIndices;

        this._cgl.gl.bufferData(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this.vertIndicesTyped, this._cgl.gl.DYNAMIC_DRAW);
        this._bufVerticesIndizes.itemSize = 1;
        this._bufVerticesIndizes.numItems = vertIndices.length;
    }
    else this._bufVerticesIndizes.numItems=0;
};

/**
 * @function
 * @description set geometry for mesh
 * @name CGL.Mesh#setGeom
 * @param {CGL.Geometry} geometry
 */
CGL.Mesh.prototype.setGeom=function(geom)
{
    this._geom=geom;
    CGL.MESH.lastShader=null;
    CGL.MESH.lastMesh=null;
    CGL.profileMeshSetGeom++;

    if(!this.meshChanged()) this.unBind();
    var i=0;

    // todo properly delete all attrib buffers...
    this._attributes.length=0;

    this.updateVertices(this._geom);

    this.setVertexIndices(this._geom.verticesIndices);

    if(this._geom.vertexNormals.length>0) this.setAttribute('attrVertNormal',this._geom.vertexNormals,3);

    this.updateTexCoords(this._geom);

    if(this._geom.hasOwnProperty('tangents') && this._geom.tangents && this._geom.tangents.length>0) this.setAttribute('attrTangent',this._geom.tangents,3);
    if(this._geom.hasOwnProperty('biTangents') && this._geom.biTangents && this._geom.biTangents.length>0) this.setAttribute('attrBiTangent',this._geom.biTangents,3);
    if(this._geom.vertexColors.length>0) this.setAttribute('attrVertColor',this._geom.vertexColors,4);

    if(this.addVertexNumbers)this._setVertexNumbers();
    
    var geomAttribs=this._geom.getAttributes();
    for(var index in geomAttribs)
    {
        this.setAttribute(index,geomAttribs[index].data,geomAttribs[index].itemSize);
    }
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
    if(shader.lastCompile>this._lastAttrUpdate)
    {
        this._lastAttrUpdate=shader.lastCompile;
        for(i=0;i<this._attributes.length;i++) this._attributes[i].loc=-1;
    }

    for(i=0;i<this._attributes.length;i++)
    {
        var attribute=this._attributes[i];
        if(attribute.loc==-1)
            attribute.loc = this._cgl.gl.getAttribLocation(shader.getProgram(), attribute.name);

        if(attribute.loc!=-1)
        {
            this._cgl.gl.enableVertexAttribArray(attribute.loc);
            this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, attribute.buffer);

            if(attribute.instanced)
            {
                // todo: easier way to fill mat4 attribs...
                if(attribute.itemSize<=4)
                {
                    this._cgl.gl.vertexAttribPointer(attribute.loc, attribute.itemSize, attribute.type,  false, attribute.itemSize*4,0);
                    this._cgl.gl.vertexAttribDivisor(attribute.loc, 1);
                }else
                if(attribute.itemSize==16)
                {
                    this._cgl.gl.vertexAttribPointer(attribute.loc, 4, attribute.type,  false, 16*4,0);
                    this._cgl.gl.enableVertexAttribArray(attribute.loc+1);
                    this._cgl.gl.vertexAttribPointer(attribute.loc+1, 4, attribute.type,  false, 16*4, 4*4*1);
                    this._cgl.gl.enableVertexAttribArray(attribute.loc+2);
                    this._cgl.gl.vertexAttribPointer(attribute.loc+2, 4, attribute.type,  false, 16*4, 4*4*2);
                    this._cgl.gl.enableVertexAttribArray(attribute.loc+3);
                    this._cgl.gl.vertexAttribPointer(attribute.loc+3, 4, attribute.type,  false, 16*4, 4*4*3);

                    this._cgl.gl.vertexAttribDivisor(attribute.loc, 1);
                    this._cgl.gl.vertexAttribDivisor(attribute.loc+1, 1);
                    this._cgl.gl.vertexAttribDivisor(attribute.loc+2, 1);
                    this._cgl.gl.vertexAttribDivisor(attribute.loc+3, 1);
                }else{console.log('unknown instance attrib size',attribute.name)}
            }
            else
            {
                this._cgl.gl.vertexAttribPointer(
                    attribute.loc,
                    attribute.itemSize,
                    attribute.type,
                    false,
                    attribute.itemSize*4, 0);

                if(attribute.pointer)
                {
                    for(var ip=0;ip<attribute.pointer.length;ip++)
                    {
                        var pointer=attribute.pointer[ip];

                        if(pointer.loc==-1) pointer.loc = this._cgl.gl.getAttribLocation(shader.getProgram(), pointer.name);

                        this._cgl.gl.enableVertexAttribArray(pointer.loc);
                        // this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, attribute.buffer);
                        this._cgl.gl.vertexAttribPointer(pointer.loc, attribute.itemSize, attribute.type, false, pointer.stride, pointer.offset);
                    }
                }
                this.bindFeedback(attribute);
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
            this._attributes[i].instanced=true;
            // todo: easier way to fill mat4 attribs...
            if(this._attributes[i].itemSize<=4)
            {
                // why does this result in warninges???
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

CGL.Mesh.prototype.setNumVertices=function(num)
{
    this._bufVertexAttrib.numItems=num;

};

/**
 * @function
 * @description draw mesh to screen
 * @name CGL.Mesh#render
 * @param {CGL.Shader} shader
 */
CGL.Mesh.prototype.render=function(shader)
{
    // TODO: enable/disablevertex only if the mesh has changed... think drawing 10000x the same mesh

    if(!shader) return;
    var i=0;

    if(shader.wireframe && this._geom.isIndexed())
    {
        console.log("unindex");
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

    if(shader.bindTextures)shader.bindTextures();

    if(needsBind) this._bind(shader);
    if(this.addVertexNumbers)this._setVertexNumbers();


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

    // if(this._bufVerticesIndizes.numItems===0)
    // console.log(this._bufVertexAttrib.numItems);

    if(this.hasFeedbacks())
    {
        this.drawFeedbacks(shader,prim);
    }
    else
    if(this._bufVerticesIndizes.numItems===0)
    {
        // console.log(this._bufVertexAttrib.numItems);
        this._cgl.gl.drawArrays(prim, this._bufVertexAttrib.startItem,this._bufVertexAttrib.numItems-this._bufVertexAttrib.startItem);

        // console.log(this._bufVertexAttrib.numItems);
    }
    else
    {
        if(this._numInstances===0)
        {
            this._cgl.gl.drawElements(prim, this._bufVerticesIndizes.numItems, this._cgl.gl.UNSIGNED_SHORT, 0);
            // if(this._bufVerticesIndizes.numItems>100)console.log(this._bufVerticesIndizes.numItems);

            // this._cgl.printError('drawele '+this._geom.name+'  /  '+shader.getName());
        }
        else
        {
            this._cgl.gl.drawElementsInstanced(prim, this._bufVerticesIndizes.numItems, this._cgl.gl.UNSIGNED_SHORT, 0,this._numInstances);
        }

        // this.printDebug(shader);
    }
    // this.unBind(shader);
    // cgl.lastMesh=this;
    // cgl.lastMeshShader=shader;
};

CGL.Mesh.prototype.setNumInstances=function(n)
{
    this._numInstances=n;
    if(n>0)
    {
        var indexArr=new Float32Array(n);
        for(var i=0;i<n;i++) indexArr[i]=i;
        this.setAttribute('instanceIndex',indexArr,1,{instanced:true});
    }
}

CGL.Mesh.prototype.dispose=function()
{

};
