import { Logger } from "cables-shared-client";
import { Uniform } from "./cgl_shader_uniform.js";
import { CONSTANTS } from "./constants.js";
import { Geometry } from "../cg/cg_geom.js";
import { Context } from "./cgl_state.js";

const MESH = {};
MESH.lastMesh = null;

/**
 * webgl renderable 3d object
 * @class
 * @namespace external:CGL
 * @hideconstructor
 * @example
 * const cgl=this._cgl
 * const mesh=new CGL.Mesh(cgl, geometry);
 *
 * function render()
 * {
 *   mesh.render(cgl.getShader());
 * }
 *
 */
class Mesh
{

    /**
     * @param {Context} _cgl cgl
     * @param {Geometry} __geom geometry
     * @param {Number} _options glPrimitive
     */
    constructor(_cgl, __geom, _options)
    {
        this._cgl = _cgl;

        let options = _options || {};
        if (CABLES.UTILS.isNumeric(options))options = { "glPrimitive": _options }; // old constructor fallback...
        this._log = new Logger("cgl_mesh");
        this._bufVertexAttrib = null;
        this._bufVerticesIndizes = this._cgl.gl.createBuffer();
        this._indexType = this._cgl.gl.UNSIGNED_SHORT;
        this._attributes = [];
        this._attribLocs = {};

        /**
         * @type {Geometry}
         */
        this._geom = null;
        this._lastShader = null;
        this._numInstances = 0;
        this._glPrimitive = options.glPrimitive;

        this.opId = options.opId || "";
        this._preWireframeGeom = null;
        this.addVertexNumbers = false;
        this._name = "unknown";

        this.feedBackAttributes = [];
        this.setGeom(__geom);

        this._feedBacks = [];
        this._feedBacksChanged = false;
        this._transformFeedBackLoc = -1;
        this._lastAttrUpdate = 0;

        this.memFreed = false;

        this._cgl.profileData.addHeavyEvent("mesh constructed", this._name);

        this._queryExt = null;
    }

    get numInstances()
    {
        return this._numInstances;
    }

    set numInstances(v)
    {
        this.setNumInstances(v);
    }

    freeMem()
    {
        this.memFreed = true;

        for (let i = 0; i < this._attributes.length; i++)
            this._attributes[i].floatArray = null;
    }

    /**
     * @function updateVertices
     * @memberof Mesh
     * @instance
     * @description update vertices only from a geometry
     * @param {Geometry} geom
     */
    updateVertices(geom)
    {
        this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION, geom.vertices, 3);
        this._numVerts = geom.vertices.length / 3;
    }

    setAttributePointer(attrName, name, stride, offset)
    {
        for (let i = 0; i < this._attributes.length; i++)
        {
            if (this._attributes[i].name == attrName)
            {
                if (!this._attributes[i].pointer) this._attributes[i].pointer = [];

                this._attributes[i].pointer.push(
                    {
                        "loc": -1,
                        "name": name,
                        "stride": stride,
                        "offset": offset,
                        "instanced": attrName == CONSTANTS.SHADER.SHADERVAR_INSTANCE_MMATRIX,
                    }
                );
            }
        }
    }

    getAttribute(name)
    {
        for (let i = 0; i < this._attributes.length; i++) if (this._attributes[i].name == name) return this._attributes[i];
    }

    setAttributeRange(attr, array, start, end)
    {
        if (!attr) return;
        if (!start && !end) return;

        if (!attr.name)
            this._log.stack("no attrname?!");

        this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, attr.buffer);
        this._cgl.profileData.profileMeshAttributes += (end - start) || 0;

        this._cgl.profileData.profileSingleMeshAttribute[this._name] = this._cgl.profileData.profileSingleMeshAttribute[this._name] || 0;
        this._cgl.profileData.profileSingleMeshAttribute[this._name] += (end - start) || 0;

        if (attr.numItems < array.length / attr.itemSize)
        {
            this._resizeAttr(array, attr);
        }

        if (end > array.length)
        {
            if (CABLES.platform.isDevEnv())
                this._log.log(this._cgl.canvas.id + " " + attr.name + " buffersubdata out of bounds ?", array.length, end, start, attr);
            // end = array.length - 1;
            return;
        }

        if (this._cgl.glVersion == 1) this._cgl.gl.bufferSubData(this._cgl.gl.ARRAY_BUFFER, 0, array); // probably slow/ maybe create and array with only changed size ??
        else this._cgl.gl.bufferSubData(this._cgl.gl.ARRAY_BUFFER, start * 4, array, start, (end - start));
    }

    _resizeAttr(array, attr)
    {
        if (attr.buffer)
            this._cgl.gl.deleteBuffer(attr.buffer);

        attr.buffer = this._cgl.gl.createBuffer();
        this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, attr.buffer);
        this._bufferArray(array, attr);
        attr.numItems = array.length / attr.itemSize;// numItems;
    }

    _bufferArray(array, attr)
    {
        let floatArray = attr.floatArray || null;
        if (!array) return;

        if (this._cgl.debugOneFrame)
        {
        console.log("_bufferArray", array.length, attr.name); // eslint-disable-line
        }

        if (!(array instanceof Float32Array))
        {
            if (attr && floatArray && floatArray.length == array.length)
            {
                floatArray.set(array);
            }
            else
            {
                floatArray = new Float32Array(array);

                if (this._cgl.debugOneFrame)
                {
                console.log("_bufferArray create new float32array", array.length, attr.name); // eslint-disable-line
                }

                if (array.length > 10000)
                {
                    this._cgl.profileData.profileNonTypedAttrib++;
                    this._cgl.profileData.profileNonTypedAttribNames = "(" + this._name + ":" + attr.name + ")";
                }
            }
        }
        else floatArray = array;

        attr.arrayLength = floatArray.length;
        attr.floatArray = null;// floatArray;

        this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, floatArray, this._cgl.gl.DYNAMIC_DRAW);
    }

    /**
     * @function setAttribute
     * @description update attribute
     * @memberof Mesh
     * @instance
     * @param {String} name
     * @param {Array} array
     * @param {Number} itemSize
     * @param {Object} options
     */
    addAttribute(name, array, itemSize, options)
    {
        this.setAttribute(name, array, itemSize, options);
    }

    /**
     * @param {String} name
     * @param {Array} array
     * @param {Number} itemSize Integer
     * @param {Object} options
     */
    setAttribute(name, array, itemSize, options)
    {
        if (!array)
        {
            this._log.error("mesh addAttribute - no array given! " + name);
            throw new Error();
        }
        let cb = null;
        let instanced = false;
        let i = 0;
        const numItems = array.length / itemSize;

        this._cgl.profileData.profileMeshAttributes += numItems || 0;

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
            const attr = this._attributes[i];
            if (attr.name == name)
            {
                if (attr.numItems === numItems)
                {
                }
                else
                {
                    this._resizeAttr(array, attr);
                }

                this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, attr.buffer);
                this._bufferArray(array, attr);

                return attr;
            }
        }

        // create new buffer...

        const buffer = this._cgl.gl.createBuffer();

        this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, buffer);
        // this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, floatArray, this._cgl.gl.DYNAMIC_DRAW);

        let type = this._cgl.gl.FLOAT;
        if (options && options.type) type = options.type;
        const attr = {
            "buffer": buffer,
            "name": name,
            "cb": cb,
            "itemSize": itemSize,
            "numItems": numItems,
            "startItem": 0,
            "instanced": instanced,
            "type": type
        };

        this._bufferArray(array, attr);

        if (name == CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION) this._bufVertexAttrib = attr;
        this._attributes.push(attr);
        this._attribLocs = {};

        return attr;
    }

    getAttributes()
    {
        return this._attributes;
    }

    /**
     * @function updateTexCoords
     * @description update texture coordinates only from a geometry
     * @memberof Mesh
     * @instance
     * @param {Geometry} geom
     */
    updateTexCoords(geom)
    {
        if (geom.texCoords && geom.texCoords.length > 0)
        {
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_TEXCOORD, geom.texCoords, 2);
        }
        else
        {
            const tcBuff = new Float32Array(Math.round((geom.vertices.length / 3) * 2));
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_TEXCOORD, tcBuff, 2);
        }
    }

    /**
     * @function updateNormals
     * @description update normals only from a geometry
     * @memberof Mesh
     * @instance
     * @param {Geometry} geom
     */
    updateNormals(geom)
    {
        if (geom.vertexNormals && geom.vertexNormals.length > 0)
        {
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_NORMAL, geom.vertexNormals, 3);
        }
        else
        {
            const tcBuff = new Float32Array(Math.round((geom.vertices.length)));
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_NORMAL, tcBuff, 3);
        }
    }

    /**
     * @param {Array} arr
     */
    _setVertexNumbers(arr)
    {
        if (!this._verticesNumbers || this._verticesNumbers.length != this._numVerts || arr)
        {
            if (arr) this._verticesNumbers = arr;
            else
            {
                this._verticesNumbers = new Float32Array(this._numVerts);
                for (let i = 0; i < this._numVerts; i++) this._verticesNumbers[i] = i;
            }

            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_NUMBER, this._verticesNumbers, 1, (attr, geom, shader) =>
            {
                if (!shader.uniformNumVertices) shader.uniformNumVertices = new Uniform(shader, "f", "numVertices", this._numVerts);
                shader.uniformNumVertices.setValue(this._numVerts);
            });
        }
    }

    /**
     * @function setVertexIndices
     * @description update vertex indices / faces
     * @memberof Mesh
     * @instance
     * @param {array} vertIndices
     */
    setVertexIndices(vertIndices)
    {
        if (!this._bufVerticesIndizes)
        {
            this._log.warn("no bufVerticesIndizes: " + this._name);
            return;
        }
        if (vertIndices.length > 0)
        {
            if (vertIndices instanceof Float32Array) this._log.warn("vertIndices float32Array: " + this._name);

            for (let i = 0; i < vertIndices.length; i++)
            {
                if (vertIndices[i] >= this._numVerts)
                {
                    this._log.warn("invalid index in " + this._name, i, vertIndices[i]);
                    return;
                }
            }

            this._cgl.gl.bindBuffer(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this._bufVerticesIndizes);

            /*
             * todo cache this ?
             * if(!this.vertIndicesTyped || this.vertIndicesTyped.length!=this._geom.verticesIndices.length)
             */

            if (vertIndices.length > 65535)
            {
                this.vertIndicesTyped = new Uint32Array(vertIndices);
                this._indexType = this._cgl.gl.UNSIGNED_INT;
            }
            else
            if (vertIndices instanceof Uint32Array)
            {
                this.vertIndicesTyped = vertIndices;
                this._indexType = this._cgl.gl.UNSIGNED_INT;
            }
            else
            if (!(vertIndices instanceof Uint16Array))
            {
                this.vertIndicesTyped = new Uint16Array(vertIndices);
                this._indexType = this._cgl.gl.UNSIGNED_SHORT;
            }
            else this.vertIndicesTyped = vertIndices;

            this._cgl.gl.bufferData(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this.vertIndicesTyped, this._cgl.gl.DYNAMIC_DRAW);
            this._bufVerticesIndizes.itemSize = 1;
            this._bufVerticesIndizes.numItems = vertIndices.length;
        }
        else this._bufVerticesIndizes.numItems = 0;
    }

    /**
     * @function setGeom
     * @memberof Mesh
     * @instance
     * @description set geometry for mesh
     * @param {Geometry} geom
     * @param {boolean} removeRef
     */
    setGeom(geom, removeRef = false)
    {
        this._geom = geom;
        if (geom.glPrimitive != null) this._glPrimitive = geom.glPrimitive;
        if (this._geom && this._geom.name) this._name = "mesh " + this._geom.name;

        MESH.lastMesh = null;
        this._cgl.profileData.profileMeshSetGeom++;

        this._disposeAttributes();

        this.updateVertices(this._geom);
        this.setVertexIndices(this._geom.verticesIndices);

        if (this.addVertexNumbers) this._setVertexNumbers();

        const geomAttribs = this._geom.getAttributes();

        const attribAssoc = {
            "texCoords": CONSTANTS.SHADER.SHADERVAR_VERTEX_TEXCOORD,
            "vertexNormals": CONSTANTS.SHADER.SHADERVAR_VERTEX_NORMAL,
            "vertexColors": CONSTANTS.SHADER.SHADERVAR_VERTEX_COLOR,
            "tangents": "attrTangent",
            "biTangents": "attrBiTangent",
        };

        for (const index in geomAttribs)
            if (geomAttribs[index].data && geomAttribs[index].data.length)
                this.setAttribute(attribAssoc[index] || index, geomAttribs[index].data, geomAttribs[index].itemSize);

        if (removeRef)
        {
            this._geom = null;
        }
    }

    _preBind(shader)
    {
        for (let i = 0; i < this._attributes.length; i++)
            if (this._attributes[i].cb)
                this._attributes[i].cb(this._attributes[i], this._geom, shader);
    }

    _checkAttrLengths()
    {
        if (this.memFreed) return;
        // check length
        for (let i = 0; i < this._attributes.length; i++)
        {
            if (this._attributes[i].arrayLength / this._attributes[i].itemSize < this._attributes[0].arrayLength / this._attributes[0].itemSize)
            {
                let name = "unknown";
                if (this._geom)name = this._geom.name;

            /*
             * this._log.warn(
             *     name + ": " + this._attributes[i].name +
             *     " wrong attr length. is:", this._attributes[i].arrayLength / this._attributes[i].itemSize,
             *     " should be:", this._attributes[0].arrayLength / this._attributes[0].itemSize,
             * );
             */
            }
        }
    }

    _bind(shader)
    {
        if (!shader.isValid()) return;

        let attrLocs = [];
        if (this._attribLocs[shader.id]) attrLocs = this._attribLocs[shader.id];
        else this._attribLocs[shader.id] = attrLocs;

        this._lastShader = shader;
        if (shader.lastCompile > this._lastAttrUpdate || attrLocs.length != this._attributes.length)
        {
            this._lastAttrUpdate = shader.lastCompile;
            for (let i = 0; i < this._attributes.length; i++) attrLocs[i] = -1;
        }

        for (let i = 0; i < this._attributes.length; i++)
        {
            const attribute = this._attributes[i];
            if (attrLocs[i] == -1)
            {
                if (attribute._attrLocationLastShaderTime != shader.lastCompile)
                {
                    attribute._attrLocationLastShaderTime = shader.lastCompile;
                    attrLocs[i] = this._cgl.glGetAttribLocation(shader.getProgram(), attribute.name);
                    // this._log.log('attribloc',attribute.name,attrLocs[i]);
                    this._cgl.profileData.profileAttrLoc++;
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
                        if (!attribute.itemSize || attribute.itemSize == 0) this._log.warn("instanced attrib itemsize error", this._geom.name, attribute);

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
                        this._log.warn("unknown instance attrib size", attribute.name);
                    }
                }
                else
                {
                    if (!attribute.itemSize || attribute.itemSize == 0) this._log.warn("attrib itemsize error", this._name, attribute);
                    this._cgl.gl.vertexAttribPointer(attrLocs[i], attribute.itemSize, attribute.type, false, attribute.itemSize * 4, 0);

                    if (attribute.pointer)
                    {
                        for (let ip = 0; ip < attribute.pointer.length; ip++)
                        {
                            const pointer = attribute.pointer[ip];

                            if (pointer.loc == -1)
                                pointer.loc = this._cgl.glGetAttribLocation(shader.getProgram(), pointer.name);

                            this._cgl.profileData.profileAttrLoc++;

                            this._cgl.gl.enableVertexAttribArray(pointer.loc);
                            this._cgl.gl.vertexAttribPointer(pointer.loc, attribute.itemSize, attribute.type, false, pointer.stride, pointer.offset);
                        }
                    }
                    if (this.bindFeedback) this.bindFeedback(attribute);
                }
            }
        }

        if (this._bufVerticesIndizes && this._bufVerticesIndizes.numItems !== 0) this._cgl.gl.bindBuffer(this._cgl.gl.ELEMENT_ARRAY_BUFFER, this._bufVerticesIndizes);
    }

    unBind()
    {
        const shader = this._lastShader;
        this._lastShader = null;
        if (!shader) return;

        let attrLocs = [];
        if (this._attribLocs[shader.id]) attrLocs = this._attribLocs[shader.id];
        else this._attribLocs[shader.id] = attrLocs;

        MESH.lastMesh = null;

        for (let i = 0; i < this._attributes.length; i++)
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
    }

    meshChanged()
    {
        return this._cgl.lastMesh && this._cgl.lastMesh != this;
    }

    printDebug(shader)
    {
        console.log("--attributes");
        for (let i = 0; i < this._attributes.length; i++)
        {
            console.log("attribute " + i + " " + this._attributes[i].name);
        }
    }

    setNumVertices(num)
    {
        this._bufVertexAttrib.numItems = num;
    }

    getNumVertices()
    {
        return this._bufVertexAttrib.numItems;
    }

    /**
     * @function render
     * @memberof Mesh
     * @instance
     * @description draw mesh to screen
     * @param {Shader} shader
     */
    render(shader)
    {
        // TODO: enable/disablevertex only if the mesh has changed... think drawing 10000x the same mesh

        if (this._cgl.aborted) return;
        if (!shader)
        {
            return console.log("no shader");
        }
        if (!shader.isValid())
        {
            return console.log("shadern not valid");
        }

        this._checkAttrLengths();

        if (this._geom)
        {
            if (this._preWireframeGeom && !shader.wireframe && !this._geom.isIndexed())
            {
                this.setGeom(this._preWireframeGeom);
                this._preWireframeGeom = null;
            }

            if (shader.wireframe)
            {
                let changed = false;

                if (this._geom.isIndexed())
                {
                    if (!this._preWireframeGeom)
                    {
                        this._preWireframeGeom = this._geom;
                        this._geom = this._geom.copy();
                    }

                    this._geom.unIndex();
                    changed = true;
                }

                if (!this._geom.getAttribute("attrBarycentric"))
                {
                    if (!this._preWireframeGeom)
                    {
                        this._preWireframeGeom = this._geom;
                        this._geom = this._geom.copy();
                    }
                    changed = true;

                    this._geom.calcBarycentric();
                }
                if (changed) this.setGeom(this._geom);
            }
        }

        let needsBind = false;
        if (MESH.lastMesh != this)
        {
            if (MESH.lastMesh) MESH.lastMesh.unBind();
            needsBind = true;
        }

        if (needsBind) this._preBind(shader);

        if (!shader.bind()) return;

        this._bind(shader);
        if (this.addVertexNumbers) this._setVertexNumbers();

        MESH.lastMesh = this;

        let prim = this._cgl.gl.TRIANGLES;
        if (this._glPrimitive !== undefined) prim = this._glPrimitive;
        if (shader.glPrimitive !== null) prim = shader.glPrimitive;

        let elementDiv = 1;
        let doQuery = this._cgl.profileData.doProfileGlQuery;
        let queryStarted = false;
        if (doQuery)
        {
            let id = this._name + " - " + shader.getName() + " #" + shader.id;
            if (this._numInstances) id += " instanced " + this._numInstances + "x";

            let queryProfilerData = this._cgl.profileData.glQueryData[id];

            if (!queryProfilerData) queryProfilerData = { "id": id, "num": 0 };

            if (shader.opId)queryProfilerData.shaderOp = shader.opId;
            if (this.opId)queryProfilerData.meshOp = this.opId;

            this._cgl.profileData.glQueryData[id] = queryProfilerData;

            if (!this._queryExt && this._queryExt !== false) this._queryExt = this._cgl.enableExtension("EXT_disjoint_timer_query_webgl2") || false;
            if (this._queryExt)
            {
                if (queryProfilerData._drawQuery)
                {
                    const available = this._cgl.gl.getQueryParameter(queryProfilerData._drawQuery, this._cgl.gl.QUERY_RESULT_AVAILABLE);
                    if (available)
                    {
                        const elapsedNanos = this._cgl.gl.getQueryParameter(queryProfilerData._drawQuery, this._cgl.gl.QUERY_RESULT);
                        const currentTimeGPU = elapsedNanos / 1000000;

                        queryProfilerData._times = queryProfilerData._times || 0;
                        queryProfilerData._times += currentTimeGPU;
                        queryProfilerData._numcount++;
                        queryProfilerData.when = performance.now();
                        queryProfilerData._drawQuery = null;
                        queryProfilerData.queryStarted = false;
                    }
                }

                if (!queryProfilerData.queryStarted)
                {
                    queryProfilerData._drawQuery = this._cgl.gl.createQuery();
                    this._cgl.gl.beginQuery(this._queryExt.TIME_ELAPSED_EXT, queryProfilerData._drawQuery);
                    queryStarted = queryProfilerData.queryStarted = true;
                }
            }
        }

        if (this.hasFeedbacks && this.hasFeedbacks()) this.drawFeedbacks(shader, prim);
        else if (!this._bufVerticesIndizes || this._bufVerticesIndizes.numItems === 0)
        {

            /*
             * for (let i = 0; i < this._attributes.length; i++)
             * {
             *     if (this._attributes[i].arrayLength / this._attributes[i].itemSize != this._bufVertexAttrib.floatArray.length / 3)
             *     {
             *         this._log.warn("attrib buffer length wrong! ", this._attributes[i].name, this._attributes[i].arrayLength / this._attributes[i].itemSize, this._bufVertexAttrib.floatArray.length / 3, this._attributes[i].itemSize);
             *         // this._log.log(this);
             *         // debugger;
             *         return;
             *     }
             * }
             */

            if (prim == this._cgl.gl.TRIANGLES)elementDiv = 3;
            if (this._numInstances === 0) this._cgl.gl.drawArrays(prim, this._bufVertexAttrib.startItem, this._bufVertexAttrib.numItems - this._bufVertexAttrib.startItem);
            else this._cgl.gl.drawArraysInstanced(prim, this._bufVertexAttrib.startItem, this._bufVertexAttrib.numItems, this._numInstances);
        }
        else
        {
            if (prim == this._cgl.gl.TRIANGLES)elementDiv = 3;
            if (this._numInstances === 0)
            {
            // console.log("la", this._bufVerticesIndizes.numItems);

                this._cgl.gl.drawElements(prim, this._bufVerticesIndizes.numItems, this._indexType, 0);
            }
            else
            {
                this._cgl.gl.drawElementsInstanced(prim, this._bufVerticesIndizes.numItems, this._indexType, 0, this._numInstances);
            }
        }

        if (this._cgl.debugOneFrame && this._cgl.gl.getError() != this._cgl.gl.NO_ERROR)
        {
            this._log.error("mesh draw gl error");
            this._log.error("mesh", this);
            this._log.error("shader", shader);

            const attribNames = [];
            for (let i = 0; i < this._cgl.gl.getProgramParameter(shader.getProgram(), this._cgl.gl.ACTIVE_ATTRIBUTES); i++)
            {
                const name = this._cgl.gl.getActiveAttrib(shader.getProgram(), i).name;
                this._log.error("attrib ", name);
            }
        }

        this._cgl.profileData.profileMeshNumElements += (this._bufVertexAttrib.numItems / elementDiv) * (this._numInstances || 1);
        this._cgl.profileData.profileMeshDraw++;

        if (doQuery && queryStarted)
        {
            this._cgl.gl.endQuery(this._queryExt.TIME_ELAPSED_EXT);
        }

        this._cgl.printError("mesh render " + this._name);

        this.unBind();
    }

    setNumInstances(n)
    {
        n = Math.max(0, n);
        if (this._numInstances != n)
        {
            this._numInstances = n;
            const indexArr = new Float32Array(n);
            for (let i = 0; i < n; i++) indexArr[i] = i;
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_INSTANCE_INDEX, indexArr, 1, { "instanced": true });
        }
    }

    _disposeAttributes()
    {
        if (!this._attributes) return;

        for (let i = 0; i < this._attributes.length; i++)
        {
            if (this._attributes[i].buffer)
            {
                this._cgl.gl.deleteBuffer(this._attributes[i].buffer);
                this._attributes[i].buffer = null;
            }
        }
        this._attributes.length = 0;
    }

    dispose()
    {
        if (this._bufVertexAttrib && this._bufVertexAttrib.buffer) this._cgl.gl.deleteBuffer(this._bufVertexAttrib.buffer);
        if (this._bufVerticesIndizes) this._cgl.gl.deleteBuffer(this._bufVerticesIndizes);
        this._bufVerticesIndizes = null;

        this._disposeAttributes();
    }
}

export { Mesh, MESH };
