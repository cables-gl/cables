// import { vec2, vec3 } from "gl-matrix";
import { Logger } from "cables-shared-client";
import { UTILS } from "../utils.js";
import { BoundingBox } from "./cg_boundingbox.js";

/**
 * a geometry contains all information about a mesh, vertices, texturecoordinates etc. etc.
 * @namespace external:CGL#Geometry
 * @param {String} name
 * @class
 * @example
 * // create a triangle with all attributes
 * const geom=new Geometry("triangle"),
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

class Geometry
{
    constructor(name)
    {
        this.name = name || "unknown";
        this._log = new Logger("cgl_geometry");

        this.faceVertCount = 3;
        this.glPrimitive = null;
        this._attributes = {};

        /** @type {Array|Float32Array} */
        this._vertices = [];
        this.verticesIndices = [];

        this.isGeometry = true;

        this.morphTargets = [];
    }

    get vertices()
    {
        return this._vertices;
    }

    set vertices(v)
    {
        this.setVertices(v);
    }

    get texCoords()
    {
        const att = this.getAttribute("texCoords");
        if (!att) return [];
        return att.data;
    }

    set texCoords(v)
    {
        this.setAttribute("texCoords", v, 2);
    }

    get vertexNormals()
    {
        const att = this.getAttribute("vertexNormals");
        if (!att) return [];
        return att.data;
    }

    set vertexNormals(v)
    {
        this.setAttribute("vertexNormals", v, 3);
    }

    get tangents()
    {
        const att = this.getAttribute("tangents");
        if (!att) return [];
        return att.data;
    }

    set tangents(v)
    {
        this.setAttribute("tangents", v, 3);
    }

    get biTangents()
    {
        const att = this.getAttribute("biTangents");
        if (!att) return [];
        return att.data;
    }

    set biTangents(v)
    {
        this.setAttribute("biTangents", v, 3);
    }

    get vertexColors()
    {
        const att = this.getAttribute("vertexColors");
        if (!att) return [];
        return att.data;
    }

    set vertexColors(v)
    {
        this.setAttribute("vertexColors", v, 4);
    }

    /**
     * @function clear
     * @memberof Geometry
     * @instance
     * @description clear all buffers/set them to length 0
     */
    clear()
    {
        this._vertices = new Float32Array([]);
        this.verticesIndices = [];
        this.texCoords = new Float32Array([]);
        this.vertexNormals = new Float32Array([]);
        this.tangents = [];
        this.biTangents = [];
        this._attributes = {};
    }

    /**
     * @function getAttributes
     @memberof Geometry
    * @instance
    * @return {Array<Object>} returns array of attribute objects
    */
    getAttributes()
    {
        return this._attributes;
    }

    /**
     * @function getAttribute
     * @memberof Geometry
     * @instance
     * @param {String} name
     * @return {Object}
     */
    getAttribute(name)
    {
        for (const i in this._attributes)
        {
            if (this._attributes[i].name == name) return this._attributes[i];
        }
        return null;
    }

    /**
     * @function setAttribute
     * @description create an attribute
     * @memberof Geometry
     * @instance
     * @param {String} name
     * @param {Array} arr
     * @param {Number} itemSize
     */
    setAttribute(name, arr, itemSize)
    {
        let attrType = "";
        if (!itemSize || itemSize > 4)
        {
            console.log("itemsize wrong?", itemSize, name);
            this._log.stack("itemsize");

            itemSize = 3;
        }

        if (itemSize == 1) attrType = "float";
        else if (itemSize == 2) attrType = "vec2";
        else if (itemSize == 3) attrType = "vec3";
        else if (itemSize == 4) attrType = "vec4";

        const attr = {
            "name": name,
            "data": arr,
            "itemSize": itemSize,
            "type": attrType,
        };

        this._attributes[name] = attr;
    }

    copyAttribute(name, newgeom)
    {
        const attr = this.getAttribute(name);
        newgeom.setAttribute(name, new Float32Array(attr.data), attr.itemSize);
    }

    /**
     * @function setVertices
     * @memberof Geometry
     * @instance
     * @description set vertices
     * @param {Array|Float32Array} arr [x,y,z,x,y,z,...]
     */
    setVertices(arr)
    {
        if (arr instanceof Float32Array) this._vertices = arr;
        else this._vertices = new Float32Array(arr);
    }

    /**
     * @function setTexCoords
     * @memberof Geometry
     * @instance
     * @description set texcoords
     * @param {Array|Float32Array} arr [u,v,u,v,...]
     */
    setTexCoords(arr)
    {
        if (arr instanceof Float32Array) this.texCoords = arr;
        else this.texCoords = new Float32Array(arr);
    }

    // deprecated
    calcNormals(smooth)
    {
        const options = { "smooth": smooth };
        this.calculateNormals(options);
    }

    /**
     * @function flipNormals
     * @memberof Geometry
     * @param x
     * @param y
     * @param z
     * @description flip normals
     */
    flipNormals(x, y, z)
    {
        let vec = vec3.create();

        if (x == undefined)x = 1;
        if (y == undefined)y = 1;
        if (z == undefined)z = 1;

        for (let i = 0; i < this.vertexNormals.length; i += 3)
        {
            vec3.set(vec,
                this.vertexNormals[i + 0],
                this.vertexNormals[i + 1],
                this.vertexNormals[i + 2]);

            vec[0] *= -x;
            vec[1] *= -y;
            vec[2] *= -z;

            vec3.normalize(vec, vec);

            this.vertexNormals[i + 0] = vec[0];
            this.vertexNormals[i + 1] = vec[1];
            this.vertexNormals[i + 2] = vec[2];
        }
    }

    getNumTriangles()
    {
        if (this.verticesIndices && this.verticesIndices.length) return this.verticesIndices.length / 3;
        return this.vertices.length / 3;
    }

    /**
     * @function flipVertDir
     * @memberof Geometry
     * @description flip order of vertices in geom faces
     */
    flipVertDir()
    {
        const newInd = [];
        newInd.length = this.verticesIndices.length;
        for (let i = 0; i < this.verticesIndices.length; i += 3)
        {
            newInd[i] = this.verticesIndices[i + 2];
            newInd[i + 1] = this.verticesIndices[i + 1];
            newInd[i + 2] = this.verticesIndices[i];
        }
        this.verticesIndices = newInd;
    }

    setPointVertices(verts)
    {
        if (verts.length % 3 !== 0)
        {
            this._log.error("SetPointVertices: Array must be multiple of three.");
            return;
        }

        if (!(verts instanceof Float32Array)) this.vertices = new Float32Array(verts);
        else this.vertices = verts;

        if (!(this.texCoords instanceof Float32Array)) this.texCoords = new Float32Array((verts.length / 3) * 2);

        // this.texCoords.length=verts.length/3*2;
        this.verticesIndices.length = verts.length / 3;
        // this.verticesIndices=[];

        for (let i = 0; i < verts.length / 3; i++)
        {
            this.verticesIndices[i] = i;
            this.texCoords[i * 2] = 0;
            this.texCoords[i * 2 + 1] = 0;
        }
    }

    /**
     * merge a different geometry into the this geometry
     * @function merge
     * @param {Geometry} geom
     * @memberof Geometry
     * @instance
     */
    merge(geom)
    {
        if (!geom) return;

        if (this.isIndexed() != geom.isIndexed())
        {
            if (this.isIndexed())
            {
                this.unIndex(false, true);
            }
            if (geom.isIndexed())
            {
                const g = geom.copy();
                g.unIndex(false, true);
                geom = g;
            }
        }

        const oldIndizesLength = this.verticesIndices.length;
        const vertLength = this._vertices.length / 3;

        this.verticesIndices.length += geom.verticesIndices.length;
        for (let i = 0; i < geom.verticesIndices.length; i++)
            this.verticesIndices[oldIndizesLength + i] = geom.verticesIndices[i] + vertLength;

        this.vertices = UTILS.float32Concat(this._vertices, geom.vertices);
        this.texCoords = UTILS.float32Concat(this.texCoords, geom.texCoords);
        this.vertexNormals = UTILS.float32Concat(this.vertexNormals, geom.vertexNormals);
        this.tangents = UTILS.float32Concat(this.tangents, geom.tangents);
        this.biTangents = UTILS.float32Concat(this.biTangents, geom.biTangents);
    }

    /**
     *   a copy of the geometry
     * @function copy
     * @memberof Geometry
     * @instance
     */
    copy()
    {
        const geom = new Geometry(this.name + " copy");
        geom.faceVertCount = this.faceVertCount;
        geom.glPrimitive = this.glPrimitive;

        geom.setVertices(this._vertices.slice(0));

        if (this.verticesIndices)
        {
            geom.verticesIndices.length = this.verticesIndices.length;
            for (let i = 0; i < this.verticesIndices.length; i++) geom.verticesIndices[i] = this.verticesIndices[i];
        }

        for (let i in this._attributes) this.copyAttribute(i, geom);

        geom.morphTargets.length = this.morphTargets.length;
        for (let i = 0; i < this.morphTargets.length; i++) geom.morphTargets[i] = this.morphTargets[i];

        return geom;
    }

    /**
     * Calculaten normals
     * @function calculateNormals
     * @memberof Geometry
     * @param options
     * @instance
     */
    calculateNormals(options)
    {
        // todo: should check angle of normals to get edges    https://community.khronos.org/t/calculating-accurate-vertex-normals/28152
        options = options || {};
        if (options.smooth === false) this.unIndex();

        const u = vec3.create();
        const v = vec3.create();
        const n = vec3.create();

        function calcNormal(triangle)
        {
            vec3.subtract(u, triangle[0], triangle[1]);
            vec3.subtract(v, triangle[0], triangle[2]);
            vec3.cross(n, u, v);
            vec3.normalize(n, n);

            if (options && options.forceZUp)
            {
                if (n[2] < 0)
                {
                    n[0] *= -1;
                    n[1] *= -1;
                    n[2] *= -1;
                }
            }
            return n;
        }

        this.getVertexVec = function (which)
        {
            const vec = [0, 0, 0];
            vec[0] = this.vertices[which * 3 + 0];
            vec[1] = this.vertices[which * 3 + 1];
            vec[2] = this.vertices[which * 3 + 2];
            return vec;
        };

        if (!(this.vertexNormals instanceof Float32Array) || this.vertexNormals.length != this.vertices.length) this.vertexNormals = new Float32Array(this.vertices.length);

        for (let i = 0; i < this.vertices.length; i++)
        {
            this.vertexNormals[i] = 0;
        }

        if (!this.isIndexed())
        {
            const norms = [];
            for (let i = 0; i < this.vertices.length; i += 9)
            {
                const triangle = [[this.vertices[i + 0], this.vertices[i + 1], this.vertices[i + 2]], [this.vertices[i + 3], this.vertices[i + 4], this.vertices[i + 5]], [this.vertices[i + 6], this.vertices[i + 7], this.vertices[i + 8]]];
                const nn = calcNormal(triangle);
                norms.push(nn[0], nn[1], nn[2], nn[0], nn[1], nn[2], nn[0], nn[1], nn[2]);
            }
            this.vertexNormals = norms;
        }
        else
        {
            const faceNormals = [];

            faceNormals.length = Math.floor(this.verticesIndices.length / 3);

            for (let i = 0; i < this.verticesIndices.length; i += 3)
            {
                const triangle = [this.getVertexVec(this.verticesIndices[i + 0]), this.getVertexVec(this.verticesIndices[i + 1]), this.getVertexVec(this.verticesIndices[i + 2])];

                faceNormals[i / 3] = calcNormal(triangle);

                this.vertexNormals[this.verticesIndices[i + 0] * 3 + 0] += faceNormals[i / 3][0];
                this.vertexNormals[this.verticesIndices[i + 0] * 3 + 1] += faceNormals[i / 3][1];
                this.vertexNormals[this.verticesIndices[i + 0] * 3 + 2] += faceNormals[i / 3][2];

                this.vertexNormals[this.verticesIndices[i + 1] * 3 + 0] += faceNormals[i / 3][0];
                this.vertexNormals[this.verticesIndices[i + 1] * 3 + 1] += faceNormals[i / 3][1];
                this.vertexNormals[this.verticesIndices[i + 1] * 3 + 2] += faceNormals[i / 3][2];

                this.vertexNormals[this.verticesIndices[i + 2] * 3 + 0] += faceNormals[i / 3][0];
                this.vertexNormals[this.verticesIndices[i + 2] * 3 + 1] += faceNormals[i / 3][1];
                this.vertexNormals[this.verticesIndices[i + 2] * 3 + 2] += faceNormals[i / 3][2];
            }

            for (let i = 0; i < this.verticesIndices.length; i += 3) // faces
            {
                for (let k = 0; k < 3; k++) // triangles
                {
                    const vv = [this.vertexNormals[this.verticesIndices[i + k] * 3 + 0], this.vertexNormals[this.verticesIndices[i + k] * 3 + 1], this.vertexNormals[this.verticesIndices[i + k] * 3 + 2]];
                    vec3.normalize(vv, vv);
                    this.vertexNormals[this.verticesIndices[i + k] * 3 + 0] = vv[0];
                    this.vertexNormals[this.verticesIndices[i + k] * 3 + 1] = vv[1];
                    this.vertexNormals[this.verticesIndices[i + k] * 3 + 2] = vv[2];
                }
            }
        }
    }

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
    calcTangentsBitangents()
    {
        if (!this.vertices.length)
        {
            // this._log.error("Cannot calculate tangents/bitangents without vertices.");
            return;
        }
        if (!this.vertexNormals.length)
        {
            // this._log.error("Cannot calculate tangents/bitangents without normals.");
            return;
        }
        if (!this.texCoords.length)
        {
            // console.warn("No texcoords. Replacing with default values [0, 0].");
            const texCoordLength = (this.vertices.length / 3) * 2;
            this.texCoords = new Float32Array(texCoordLength);
            for (let i = 0; i < texCoordLength; i += 1) this.texCoords[i] = 0;
        }
        if (!this.verticesIndices || !this.verticesIndices.length)
        {
            // this._log.error("Cannot calculate tangents/bitangents without vertex indices.");
            return;
        }
        // this code assumes that we have three indices per triangle
        if (this.verticesIndices.length % 3 !== 0)
        {
            this._log.error("Vertex indices mismatch!");
            return;
        }

        const triangleCount = this.verticesIndices.length / 3;
        const vertexCount = this.vertices.length / 3;

        this.tangents = new Float32Array(this.vertexNormals.length);
        this.biTangents = new Float32Array(this.vertexNormals.length);

        // temporary buffers
        const tempVertices = [];
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
        for (let tri = 0; tri < triangleCount; tri += 1)
        {
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

            vec3.set(sdir, (t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
            vec3.set(tdir, (s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);

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

        for (let vert = 0; vert < vertexCount; vert += 1)
        {
            // NOTE: some meshes don't have index 0 - n in their indexbuffer, if this is the case, skip calculation of this vertex
            if (!tempVertices[vert]) continue;

            vec3.set(normal, this.vertexNormals[vert * 3], this.vertexNormals[vert * 3 + 1], this.vertexNormals[vert * 3 + 2]);
            vec3.set(tempVert, tempVertices[vert][0], tempVertices[vert][1], tempVertices[vert][2]);

            // Gram-Schmidt orthagonalize
            const _dp = vec3.dot(normal, tempVert);
            vec3.scale(temp1, normal, _dp);
            vec3.subtract(temp2, tempVert, temp1);

            vec3.normalize(normalized, temp2);
            vec3.cross(crossPd, normal, tempVert);

            // const intermDot = vec3.dot(crossPd, tempVertices[vert + vertexCount]);
            const w = 1.0;// intermDot < 0.0 ? -1.0 : 1.0;

            vec3.scale(tan, normalized, 1 / w);
            vec3.cross(bitan, normal, tan);

            this.tangents[vert * 3 + 0] = tan[0];
            this.tangents[vert * 3 + 1] = tan[1];
            this.tangents[vert * 3 + 2] = tan[2];
            this.biTangents[vert * 3 + 0] = bitan[0];
            this.biTangents[vert * 3 + 1] = bitan[1];
            this.biTangents[vert * 3 + 2] = bitan[2];
        }
    }

    isIndexed()
    {
        if (this._vertices.length == 0) return true;
        return this.verticesIndices.length != 0;
    }

    /**
     * @function unIndex
     * @memberof Geometry
     * @instance
     * @description remove all vertex indizes, vertices array will contain 3*XYZ for every triangle
     * @param {boolean} reIndex
     * @param {boolean} dontCalcNormals
     */
    unIndex(reIndex = false, dontCalcNormals = false)
    {
        const newVerts = [];
        const newIndizes = [];
        let count = 0;

        for (let j in this._attributes)
        {
            const attr = this._attributes[j];
            let na = [];

            for (let i = 0; i < this.verticesIndices.length; i += 3)
            {
                for (let s = 0; s < 3; s++)
                {
                    if (attr.itemSize == 3)
                        na.push(
                            attr.data[this.verticesIndices[i + s] * 3 + 0],
                            attr.data[this.verticesIndices[i + s] * 3 + 1],
                            attr.data[this.verticesIndices[i + s] * 3 + 2]);
                    else if (attr.itemSize == 4)
                        na.push(
                            attr.data[this.verticesIndices[i + s] * 4 + 0],
                            attr.data[this.verticesIndices[i + s] * 4 + 1],
                            attr.data[this.verticesIndices[i + s] * 4 + 2],
                            attr.data[this.verticesIndices[i + s] * 4 + 3]);
                    else if (attr.itemSize == 2)
                        na.push(
                            attr.data[this.verticesIndices[i + s] * 2 + 0],
                            attr.data[this.verticesIndices[i + s] * 2 + 1]);
                    else if (attr.itemSize == 1)
                        na.push(
                            attr.data[this.verticesIndices[i + s]]);
                    else console.log("unknown attr", attr);
                }
            }
            this.setAttribute(attr.name, na, attr.itemSize);
        }

        for (let i = 0; i < this.verticesIndices.length; i += 3)
        {
            newVerts.push(
                this.vertices[this.verticesIndices[i + 0] * 3 + 0],
                this.vertices[this.verticesIndices[i + 0] * 3 + 1],
                this.vertices[this.verticesIndices[i + 0] * 3 + 2]);

            newIndizes.push(count);
            count++;

            newVerts.push(
                this.vertices[this.verticesIndices[i + 1] * 3 + 0],
                this.vertices[this.verticesIndices[i + 1] * 3 + 1],
                this.vertices[this.verticesIndices[i + 1] * 3 + 2]);

            newIndizes.push(count);
            count++;

            newVerts.push(
                this.vertices[this.verticesIndices[i + 2] * 3 + 0],
                this.vertices[this.verticesIndices[i + 2] * 3 + 1],
                this.vertices[this.verticesIndices[i + 2] * 3 + 2]);

            newIndizes.push(count);
            count++;
        }

        this.vertices = newVerts;

        this.verticesIndices = [];
        if (reIndex) this.verticesIndices = newIndizes;

        if (!dontCalcNormals) this.calculateNormals();
    }

    calcBarycentric()
    {
        let barycentrics = [];
        barycentrics.length = this.vertices.length;
        for (let i = 0; i < this.vertices.length; i++) barycentrics[i] = 0;

        let count = 0;
        for (let i = 0; i < this.vertices.length; i += 3)
        {
            barycentrics[i + count] = 1;
            count++;
            if (count == 3) count = 0;
        }

        this.setAttribute("attrBarycentric", barycentrics, 3);
    }

    getBounds()
    {
        return new BoundingBox(this);
    }

    center(x, y, z)
    {
        if (x === undefined)
        {
            x = true;
            y = true;
            z = true;
        }

        let i = 0;
        const bounds = this.getBounds();
        const offset = [bounds.minX + (bounds.maxX - bounds.minX) / 2, bounds.minY + (bounds.maxY - bounds.minY) / 2, bounds.minZ + (bounds.maxZ - bounds.minZ) / 2];

        for (i = 0; i < this.vertices.length; i += 3)
        {
            if (this.vertices[i + 0] == this.vertices[i + 0])
            {
                if (x) this.vertices[i + 0] -= offset[0];
                if (y) this.vertices[i + 1] -= offset[1];
                if (z) this.vertices[i + 2] -= offset[2];
            }
        }

        return offset;
    }

    mapTexCoords2d()
    {
        const bounds = this.getBounds();
        const num = this.vertices.length / 3;

        this.texCoords = new Float32Array(num * 2);

        for (let i = 0; i < num; i++)
        {
            const vertX = this.vertices[i * 3 + 0];
            const vertY = this.vertices[i * 3 + 1];
            this.texCoords[i * 2 + 0] = vertX / (bounds.maxX - bounds.minX) + 0.5;
            this.texCoords[i * 2 + 1] = 1.0 - vertY / (bounds.maxY - bounds.minY) + 0.5;
        }
    }

    getInfoOneLine()
    {
        let txt = "";
        if (this.faceVertCount == 3 && this.verticesIndices)txt += this.verticesIndices.length / 3;
        else txt += 0;

        txt += " tris ";

        if (this.vertices)txt += this.vertices.length / 3;
        else txt += 0;

        txt += " verts";

        return txt;
    }

    getInfo()
    {
        const info = {};

        if (this.faceVertCount == 3 && this.verticesIndices)info.numFaces = this.verticesIndices.length / 3;
        else info.numFaces = 0;

        if (this.verticesIndices && this.verticesIndices.length)info.indices = this.verticesIndices.length;

        if (this.vertices)info.numVerts = this.vertices.length / 3;
        else info.numVerts = 0;

        if (this.vertexNormals) info.numNormals = this.vertexNormals.length / 3;
        else info.numNormals = 0;

        if (this.texCoords) info.numTexCoords = this.texCoords.length / 2;
        else info.numTexCoords = 0;

        if (this.tangents) info.numTangents = this.tangents.length / 3;
        else info.numTangents = 0;

        if (this.biTangents) info.numBiTangents = this.biTangents.length / 3;
        else info.numBiTangents = 0;

        if (this.biTangents) info.numBiTangents = this.biTangents.length / 3;
        else info.numBiTangents = 0;

        if (this.vertexColors) info.numVertexColors = this.vertexColors.length / 4;
        else info.numVertexColors = 0;

        if (this.getAttributes()) info.numAttribs = Object.keys(this.getAttributes()).length;
        else info.numAttribs = 0;

        info.isIndexed = this.isIndexed();

        return info;
    }

    // -----------------
}

// TODO : rewritwe circle op 1
/** @deprecated */
Geometry.buildFromFaces = function (arr, name, optimize)
{
    const vertices = [];
    const verticesIndices = [];

    for (let i = 0; i < arr.length; i += 3)
    {
        const a = arr[i + 0];
        const b = arr[i + 1];
        const c = arr[i + 2];
        const face = [-1, -1, -1];

        if (optimize)
            for (let iv = 0; iv < vertices.length; iv += 3)
            {
                if (vertices[iv + 0] == a[0] && vertices[iv + 1] == a[1] && vertices[iv + 2] == a[2]) face[0] = iv / 3;
                if (vertices[iv + 0] == b[0] && vertices[iv + 1] == b[1] && vertices[iv + 2] == b[2]) face[1] = iv / 3;
                if (vertices[iv + 0] == c[0] && vertices[iv + 1] == c[1] && vertices[iv + 2] == c[2]) face[2] = iv / 3;
            }

        if (face[0] == -1)
        {
            vertices.push(a[0], a[1], a[2]);
            face[0] = (vertices.length - 1) / 3;
        }

        if (face[1] == -1)
        {
            vertices.push(b[0], b[1], b[2]);
            face[1] = (vertices.length - 1) / 3;
        }

        if (face[2] == -1)
        {
            vertices.push(c[0], c[1], c[2]);
            face[2] = (vertices.length - 1) / 3;
        }

        verticesIndices.push(parseInt(face[0], 10));
        verticesIndices.push(parseInt(face[1], 10));
        verticesIndices.push(parseInt(face[2], 10));
    }

    const geom = new Geometry(name);
    geom.name = name;
    geom.vertices = vertices;
    geom.verticesIndices = verticesIndices;

    return geom;
};

export { Geometry };
