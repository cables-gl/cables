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

    this.updateVertices=function(geom)
    {
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, bufVertices);
        cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(geom.vertices), cgl.gl.STATIC_DRAW);
        bufVertices.itemSize = 3;
        bufVertices.numItems = geom.vertices.length/3;
    };

    this.setGeom=function(geom)
    {
        CGL.MESH.lastShader=null;
        CGL.MESH.lastMesh=null;

        if(!this.meshChanged()) this.unBind();
        var i=0;

        attributes.length=0;

        updateVertices(geom);

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
