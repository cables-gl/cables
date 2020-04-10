import { Uniform } from "./cgl_shader_uniform";
import { CONSTANTS } from "./constants";
import { profileData } from "./cgl_profiledata";
import { extendMeshWithFeedback } from "./cgl_mesh_feedback";
import { Log } from "../log";

const MESH = {};
MESH.lastMesh = null;

/**
 * webgl renderable 3d object
 * @external CGL
 * @namespace Mesh
 * @hideconstructor
 * @param {Context} cgl
 * @param {Geometry} geometry
 * @param {Number} [glPrimitive]
 * @class
 * @example
 * const cgl=op.patch.cgl
 * const mesh=new CGL.Mesh(cgl, geometry);
 *
 * function render()
 * {
 *   mesh.render(cgl.getShader());
 * }
 */
const Mesh = function (_cgl, __geom, glPrimitive)
{
    this._cgl = _cgl;
    this._bufVertexAttrib = null;
    this._bufVerticesIndizes = this._cgl.gl.createBuffer();
    this._attributes = [];
    this._attribLocs = {};
    this._geom = null;
    this._lastShader = null;
    this._numInstances = 0;
    this._glPrimitive = glPrimitive;
    this._preWireframeGeom = null;
    this.addVertexNumbers = false;
    this.feedBackAttributes = [];
    this.setGeom(__geom);

    this._feedBacks = [];
    this._feedBacksChanged = false;
    this._transformFeedBackLoc = -1;
    this._lastAttrUpdate = 0;

    Object.defineProperty(this, "numInstances", {
        get()
        {
            return this._numInstances;
        },
        set(v)
        {
            this.setNumInstances(v);
        },
    });
};

/**
 * @function updateVertices
 * @memberof Mesh
 * @instance
 * @description update vertices only from a geometry
 * @param {Geometry} geometry
 */
Mesh.prototype.updateVertices = function (geom)
{
    this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION, geom.vertices, 3);
};

Mesh.prototype.setAttributePointer = function (attrName, name, stride, offset)
{
    for(var i = 0; i < this._attributes.length; i++)
    {
        if(this._attributes[i].name == attrName)
        {
            if(!this._attributes[i].pointer) this._attributes[i].pointer = [];

            this._attributes[i].pointer.push(
                {
                    loc: -1,
                    name,
                    stride,
                    offset,
                    instanced: attrName == CONSTANTS.SHADER.SHADERVAR_INSTANCE_MMATRIX,
                });
        }
    }
};

Mesh.prototype.getAttribute = function (name)
{
    for (var i = 0; i < this._attributes.length; i++) if (this._attributes[i].name == name) return this._attributes[i];
};

Mesh.prototype._bufferArray=function(array,attr)
{
    var floatArray = null;
    if(!array)return;


    if(this._cgl.debugOneFrame)
    {
        console.log("_bufferArray",array.length,attr.name);
    }

    if (!(array instanceof Float32Array))
    {
        if(attr && attr.floatArray && attr.floatArray.length==array.length)
        {
            attr.floatArray.set(array);
            floatArray=attr.floatArray;
        }
        else
        {
            floatArray = new Float32Array(array);

            if(this._cgl.debugOneFrame)
            {
                console.log("_bufferArray create new float32array",array.length,attr.name);
            }
        
            profileData.profileNonTypedAttrib++;
            profileData.profileNonTypedAttribNames = this._geom.name + " " + name;
        }
    }
    else floatArray = array;

    if(attr && floatArray) attr.floatArray=floatArray;

    this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, floatArray, this._cgl.gl.DYNAMIC_DRAW);
};

/**
 * @function setAttribute
 * @description update attribute
 * @memberof Mesh
 * @instance
 * @param {String} attribute name
 * @param {Array} data
 * @param {Number} itemSize
 * @param {Object} options
 */
Mesh.prototype.addAttribute = Mesh.prototype.updateAttribute = Mesh.prototype.setAttribute = function (name, array, itemSize, options)
{
    var cb = null;
    var instanced = false;
    var i = 0;
    var numItems = array.length / itemSize;

    if (numItems === 0) console.warn("CGL_MESH: num items in attribute " + name + " is ZERO");

    if (typeof options == "function")
    {
        cb = options;
    }

    if (typeof options == "object")
    {
        if (options.cb) cb = options.cb;
        if (options.instanced) instanced = options.instanced;
    }

    if (name == CONSTANTS.SHADER.SHADERVAR_INSTANCE_MMATRIX) instanced = true;


    for (i = 0; i < this._attributes.length; i++)
    {
        if (this._attributes[i].name == name)
        {
            this._attributes[i].numItems = numItems;

            this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, this._attributes[i].buffer);
            // this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, floatArray, this._cgl.gl.DYNAMIC_DRAW);
            this._bufferArray(array,this._attributes[i]);

            return this._attributes[i];
        }
    }

    // create new buffer...

    var buffer = this._cgl.gl.createBuffer();

    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, buffer);
    // this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, floatArray, this._cgl.gl.DYNAMIC_DRAW);

    var type = this._cgl.gl.FLOAT;
    if (options && options.type) type = options.type;
    var attr = {
        buffer,
        name,
        cb,
        itemSize,
        numItems,
        startItem: 0,
        instanced,
        type
    };

    this._bufferArray(array,attr);

    if (name == CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION) this._bufVertexAttrib = attr;
    this._attributes.push(attr);
    this._attribLocs = {};





    return attr;
};

Mesh.prototype.getAttributes = function ()
{
    return this._attributes;
};

/**
 * @function updateTexCoords
 * @description update texture coordinates only from a geometry
 * @memberof Mesh
 * @instance
 * @param {Geometry} geometry
 */
Mesh.prototype.updateTexCoords = function (geom)
{
    if (geom.texCoords && geom.texCoords.length > 0)
    {
        this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_TEXCOORD, geom.texCoords, 2);
    }
    else
    {
        var tcBuff = new Float32Array(Math.round((geom.vertices.length / 3) * 2));
        this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_TEXCOORD, tcBuff, 2);
    }
};


/**
 * @function updateNormals
 * @description update normals only from a geometry
 * @memberof Mesh
 * @instance
 * @param {Geometry} geometry
 */
Mesh.prototype.updateNormals = function (geom)
{
    if (geom.vertexNormals && geom.vertexNormals.length > 0)
    {
        this.setAttribute("attrVertNormal", geom.vertexNormals, 3);
    }
    else
    {
        var tcBuff = new Float32Array(Math.round((geom.vertices.length )));
        this.setAttribute("attrVertNormal", tcBuff, 3);
    }
};




Mesh.prototype._setVertexNumbers = function ()
{
    var numVerts = this._geom.vertices.length / 3;

    if (!this._verticesNumbers || this._verticesNumbers.length != numVerts)
    {
        this._verticesNumbers = new Float32Array(numVerts);

        for (var i = 0; i < numVerts; i++) this._verticesNumbers[i] = i;

        this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_NUMBER, this._verticesNumbers, 1, (attr, geom, shader) =>
        {
            if (!shader.uniformNumVertices) shader.uniformNumVertices = new Uniform(shader, "f", "numVertices", numVerts);
            shader.uniformNumVertices.setValue(numVerts);
        });
    }
};

Mesh.prototype.setVertexIndices = function (vertIndices)
{
    if (vertIndices.length > 0)
    {
        for (var i = 0; i < vertIndices.length; i++)
        {
            if (vertIndices[i] >= this._geom.vertices.length / 3)
            {
                console.warn("invalid index in " + this._geom.name);
                return;
            }
        }

        this._cgl.gl.bindBuffer(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this._bufVerticesIndizes);

        // todo cache this ?
        // if(!this.vertIndicesTyped || this.vertIndicesTyped.length!=this._geom.verticesIndices.length)

        if (!(vertIndices instanceof Uint16Array)) this.vertIndicesTyped = new Uint16Array(vertIndices);
        else this.vertIndicesTyped = vertIndices;

        this._cgl.gl.bufferData(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this.vertIndicesTyped, this._cgl.gl.DYNAMIC_DRAW);
        this._bufVerticesIndizes.itemSize = 1;
        this._bufVerticesIndizes.numItems = vertIndices.length;
    }
    else this._bufVerticesIndizes.numItems = 0;
};

/**
 * @function setGeom
 * @memberof Mesh
 * @instance
 * @description set geometry for mesh
 * @param {Geometry} geometry
 */
Mesh.prototype.setGeom = function (geom)
{
    this._geom = geom;
    if(geom.glPrimitive!=null) this._glPrimitive=geom.glPrimitive;

    MESH.lastMesh = null;
    profileData.profileMeshSetGeom++;

    this._disposeAttributes();

    this.updateVertices(this._geom);
    this.setVertexIndices(this._geom.verticesIndices);

    this.updateTexCoords(this._geom);
    this.updateNormals(this._geom);

    

    if (this._geom.hasOwnProperty("tangents") && this._geom.tangents && this._geom.tangents.length > 0) this.setAttribute("attrTangent", this._geom.tangents, 3);
    if (this._geom.hasOwnProperty("biTangents") && this._geom.biTangents && this._geom.biTangents.length > 0) this.setAttribute("attrBiTangent", this._geom.biTangents, 3);
    if (this._geom.vertexColors.length > 0)
    {
        if(this._geom.vertexColors.flat)this._geom.vertexColors.flat(100);
        this.setAttribute("attrVertColor", this._geom.vertexColors, 4);
    }

    if (this.addVertexNumbers) this._setVertexNumbers();

    var geomAttribs = this._geom.getAttributes();
    for (var index in geomAttribs) this.setAttribute(index, geomAttribs[index].data, geomAttribs[index].itemSize);

};

Mesh.prototype._preBind = function (shader)
{
    for (var i = 0; i < this._attributes.length; i++)
    {
        if (this._attributes[i].cb)
        {
            this._attributes[i].cb(this._attributes[i], this._geom, shader);
        }
    }
};

Mesh.prototype._checkAttrLengths = function ()
{
    // check length

    for (var i = 0; i < this._attributes.length; i++)
    {
        if(this._attributes[0].floatArray.length/this._attributes[0].itemSize != 
                this._attributes[i].floatArray.length/this._attributes[i].itemSize)
        {
            console.warn(
                this._geom.name+": "+this._attributes[i].name+
                " wrong attr length. is:",this._attributes[i].floatArray.length/this._attributes[i].itemSize,
                " should be:",this._attributes[0].floatArray.length/this._attributes[0].itemSize,
                );
        }
    }

}

Mesh.prototype._bind = function (shader)
{

    if (shader != this._lastShader) this.unBind();
    var attrLocs = [];
    if (this._attribLocs[shader.id]) attrLocs = this._attribLocs[shader.id];
    else this._attribLocs[shader.id] = attrLocs;

    this._lastShader = shader;
    var i = 0;
    if (shader.lastCompile > this._lastAttrUpdate || attrLocs.length != this._attributes.length)
    {
        this._lastAttrUpdate = shader.lastCompile;
        for (i = 0; i < this._attributes.length; i++) attrLocs[i] = -1;

        this._checkAttrLengths();
    }

    for (i = 0; i < this._attributes.length; i++)
    {
        var attribute = this._attributes[i];
        if (attrLocs[i] == -1)
        {
            if (attribute._attrLocationLastShaderTime != shader.lastCompile)
            {
                attribute._attrLocationLastShaderTime = shader.lastCompile;
                attrLocs[i] = this._cgl.glGetAttribLocation(shader.getProgram(), attribute.name);
                // console.log('attribloc',attribute.name,attrLocs[i]);
                profileData.profileAttrLoc++;
            }
        }

        if (attrLocs[i] != -1)
        {
            this._cgl.gl.enableVertexAttribArray(attrLocs[i]);
            this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, attribute.buffer);

            if (attribute.instanced)
            {
                // todo: easier way to fill mat4 attribs...
                if (attribute.itemSize <= 4)
                {
                    if (!attribute.itemSize || attribute.itemSize == 0) Log.log("instanced attrib itemsize error", this._geom.name, attribute);

                    this._cgl.gl.vertexAttribPointer(attrLocs[i], attribute.itemSize, attribute.type, false, attribute.itemSize * 4, 0);
                    this._cgl.gl.vertexAttribDivisor(attrLocs[i], 1);
                }
                else if (attribute.itemSize == 16)
                {
                    const stride = 16 * 4;

                    this._cgl.gl.vertexAttribPointer(attrLocs[i], 4, attribute.type, false, stride, 0);
                    this._cgl.gl.enableVertexAttribArray(attrLocs[i] + 1);
                    this._cgl.gl.vertexAttribPointer(attrLocs[i] + 1, 4, attribute.type, false, stride, 4 * 4 * 1);
                    this._cgl.gl.enableVertexAttribArray(attrLocs[i] + 2);
                    this._cgl.gl.vertexAttribPointer(attrLocs[i] + 2, 4, attribute.type, false, stride, 4 * 4 * 2);
                    this._cgl.gl.enableVertexAttribArray(attrLocs[i] + 3);
                    this._cgl.gl.vertexAttribPointer(attrLocs[i] + 3, 4, attribute.type, false, stride, 4 * 4 * 3);

                    this._cgl.gl.vertexAttribDivisor(attrLocs[i], 1);
                    this._cgl.gl.vertexAttribDivisor(attrLocs[i] + 1, 1);
                    this._cgl.gl.vertexAttribDivisor(attrLocs[i] + 2, 1);
                    this._cgl.gl.vertexAttribDivisor(attrLocs[i] + 3, 1);
                }
                else
                {
                    Log.log("unknown instance attrib size", attribute.name);
                }
            }
            else
            {
                if (!attribute.itemSize || attribute.itemSize == 0) Log.log("attrib itemsize error", this._geom.name, attribute);
                this._cgl.gl.vertexAttribPointer(attrLocs[i], attribute.itemSize, attribute.type, false, attribute.itemSize * 4, 0);

                if (attribute.pointer)
                {
                    for (var ip = 0; ip < attribute.pointer.length; ip++)
                    {
                        var pointer = attribute.pointer[ip];

                        if (pointer.loc == -1)
                        {
                            pointer.loc = this._cgl.glGetAttribLocation(shader.getProgram(), pointer.name);
                            // console.log('pointer.loc',attribute.name,pointer.loc);
                        }
                        profileData.profileAttrLoc++;

                        this._cgl.gl.enableVertexAttribArray(pointer.loc);
                        // this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, attribute.buffer);
                        this._cgl.gl.vertexAttribPointer(pointer.loc, attribute.itemSize, attribute.type, false, pointer.stride, pointer.offset);
                    }
                }
                this.bindFeedback(attribute);
            }
        }
    }

    if (this._bufVerticesIndizes.numItems !== 0) this._cgl.gl.bindBuffer(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this._bufVerticesIndizes);
};

Mesh.prototype.unBind = function ()
{
    var shader = this._lastShader;
    this._lastShader = null;
    if (!shader) return;

    var attrLocs = [];
    if (this._attribLocs[shader.id]) attrLocs = this._attribLocs[shader.id];
    else this._attribLocs[shader.id] = attrLocs;

    MESH.lastMesh = null;

    for (var i = 0; i < this._attributes.length; i++)
    {
        if (this._attributes[i].instanced)
        {
            // todo: easier way to fill mat4 attribs...
            if (this._attributes[i].itemSize <= 4)
            {
                if (attrLocs[i] != -1) this._cgl.gl.vertexAttribDivisor(attrLocs[i], 0);
                if (attrLocs[i] >= 0) this._cgl.gl.disableVertexAttribArray(attrLocs[i]);
            }
            else
            {
                this._cgl.gl.vertexAttribDivisor(attrLocs[i], 0);
                this._cgl.gl.vertexAttribDivisor(attrLocs[i] + 1, 0);
                this._cgl.gl.vertexAttribDivisor(attrLocs[i] + 2, 0);
                this._cgl.gl.vertexAttribDivisor(attrLocs[i] + 3, 0);
                this._cgl.gl.disableVertexAttribArray(attrLocs[i] + 1);
                this._cgl.gl.disableVertexAttribArray(attrLocs[i] + 2);
                this._cgl.gl.disableVertexAttribArray(attrLocs[i] + 3);
            }
        }

        if (attrLocs[i] != -1) this._cgl.gl.disableVertexAttribArray(attrLocs[i]);
    }
};

Mesh.prototype.meshChanged = function ()
{
    return this._cgl.lastMesh && this._cgl.lastMesh != this;
};

Mesh.prototype.printDebug = function (shader)
{
    Log.log("--attributes");
    for (i = 0; i < this._attributes.length; i++)
    {

        Log.log("attribute " + i + " " + this._attributes[i].name);
    }
};

Mesh.prototype.setNumVertices = function (num)
{
    this._bufVertexAttrib.numItems = num;
};

/**
 * @function render
 * @memberof Mesh
 * @instance
 * @description draw mesh to screen
 * @param {Shader} shader
 */
Mesh.prototype.render = function (shader)
{
    // TODO: enable/disablevertex only if the mesh has changed... think drawing 10000x the same mesh

    if (!shader) return;
    var i = 0;

    if (!shader.wireframe && !this._geom.isIndexed() && this._preWireframeGeom) this.setGeom(this._preWireframeGeom);
    if (shader.wireframe && this._geom.isIndexed())
    {
        this._preWireframeGeom = this._geom;
        this._geom = this._geom.copy();
        this._geom.unIndex();
        this._geom.calcBarycentric();
        this.setGeom(this._geom);
        this.setAttribute("attrBarycentric", this._geom.barycentrics, 3);
    }

    var needsBind = false;
    if (MESH.lastMesh != this)
    {
        if (MESH.lastMesh) MESH.lastMesh.unBind();
        needsBind = true;
    }

    // var needsBind=false;
    //     {
    //     needsBind=true;
    //         }
    if (needsBind) this._preBind(shader);

    shader.bind();

    if (shader.bindTextures) shader.bindTextures();

    // if(needsBind)
    this._bind(shader);
    if (this.addVertexNumbers) this._setVertexNumbers();

    MESH.lastMesh = this;

    var prim = this._cgl.gl.TRIANGLES;
    if (this._glPrimitive !== undefined) prim = this._glPrimitive;
    if (shader.glPrimitive !== null) prim = shader.glPrimitive;


    if (this.hasFeedbacks())
    {
        this.drawFeedbacks(shader, prim);
    }
    else if (this._bufVerticesIndizes.numItems === 0)
    {
        if (this._numInstances === 0) this._cgl.gl.drawArrays(prim, this._bufVertexAttrib.startItem, this._bufVertexAttrib.numItems - this._bufVertexAttrib.startItem);
        else this._cgl.gl.drawArraysInstanced(prim, this._bufVertexAttrib.startItem, this._bufVertexAttrib.numItems, this._numInstances);
    }
    else
    if (this._numInstances === 0) this._cgl.gl.drawElements(prim, this._bufVerticesIndizes.numItems, this._cgl.gl.UNSIGNED_SHORT, 0);
    else this._cgl.gl.drawElementsInstanced(prim, this._bufVerticesIndizes.numItems, this._cgl.gl.UNSIGNED_SHORT, 0, this._numInstances);

    profileData.profileMeshDraw++;

};

Mesh.prototype.setNumInstances = function (n)
{
    if(this._numInstances != n)
    {
        this._numInstances = n;
        // if (n <= 0)return;
        var indexArr = new Float32Array(n);
        for (var i = 0; i < n; i++) indexArr[i] = i;
        this.setAttribute("instanceIndex", indexArr, 1, { instanced: true });
    }
};

Mesh.prototype._disposeAttributes = function ()
{
    if (!this._attributes) return;

    for (var i = 0; i < this._attributes.length; i++)
    {
        if (this._attributes[i].buffer)
        {
            this._cgl.gl.deleteBuffer(this._attributes[i].buffer);
            this._attributes[i].buffer = null;
        }
    }
    this._attributes.length = 0;
};

Mesh.prototype.dispose = function ()
{
    if (this._bufVertexAttrib && this._bufVertexAttrib.buffer) this._cgl.gl.deleteBuffer(this._bufVertexAttrib.buffer);
    if (this._bufVerticesIndizes) this._cgl.gl.deleteBuffer(this._bufVerticesIndizes);

    this._disposeAttributes();
};

extendMeshWithFeedback(Mesh);

export { Mesh, MESH };
