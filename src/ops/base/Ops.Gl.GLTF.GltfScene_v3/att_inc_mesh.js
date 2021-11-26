
let gltfMesh = class
{
    constructor(name, prim, gltf, finished)
    {
        this.test = 0;
        this.name = name;
        this.material = prim.material;
        this.mesh = null;
        this.geom = new CGL.Geometry("gltf_" + this.name);
        this.geom.verticesIndices = [];
        this.bounds = null;

        if (prim.hasOwnProperty("indices")) this.geom.verticesIndices = gltf.accBuffers[prim.indices];

        gltf.loadingMeshes = gltf.loadingMeshes || 0;
        gltf.loadingMeshes++;

        if (gltf.useDraco && prim.extensions.KHR_draco_mesh_compression)
        {
            const view = gltf.chunks[0].data.bufferViews[prim.extensions.KHR_draco_mesh_compression.bufferView];
            const num = view.byteLength;
            const dataBuff = new Int8Array(num);
            let accPos = (view.byteOffset || 0);// + (acc.byteOffset || 0);
            for (let j = 0; j < num; j++)
            {
                dataBuff[j] = gltf.chunks[1].dataView.getInt8(accPos, le);
                accPos++;
            }

            const dracoDecoder = window.DracoDecoder;
            dracoDecoder.decodeGeometry(dataBuff.buffer, (geometry) =>
            {
                const geom = new CGL.Geometry("draco mesh " + name);

                for (let i = 0; i < geometry.attributes.length; i++)
                {
                    const attr = geometry.attributes[i];

                    if (attr.name === "position") geom.vertices = attr.array;
                    else if (attr.name === "normal") geom.vertexNormals = attr.array;
                    else if (attr.name === "uv") geom.texCoords = attr.array;
                    else if (attr.name === "color") this.setGeomVertCols(geom, attr.array);
                    else if (attr.name === "joints") geom.setAttribute("attrJoints", Array.from(attr.array), 4);
                    else if (attr.name === "weights")
                    {
                        const arr4 = new Float32Array(attr.array.length / attr.itemSize * 4);

                        for (let k = 0; k < attr.array.length / attr.itemSize; k++)
                        {
                            arr4[k * 4] = arr4[k * 4 + 1] = arr4[k * 4 + 2] = arr4[k * 4 + 3] = 0;
                            for (let j = 0; j < attr.itemSize; j++)
                                arr4[k * 4 + j] = attr.array[k * attr.itemSize + j];
                        }
                        geom.setAttribute("attrWeights", arr4, 4);
                    }
                    else op.logWarn("unknown draco attrib", attr);
                }

                geometry.attributes = null;
                geom.verticesIndices = geometry.index.array;

                this.setGeom(geom);

                this.mesh = null;
                gltf.loadingMeshes--;
                if (finished)finished(this);
            }, (error) => { op.logError(error); });
        }
        else
        {
            gltf.loadingMeshes--;
            this.fillGeomAttribs(gltf, this.geom, prim.attributes);

            if (prim.targets)
            {
                console.log("prim.targets", prim.targets.length);
                for (let j = 0; j < prim.targets.length; j++)
                {
                    // var tgeom=new CGL.Geometry("gltf_"+this.name);
                    let tgeom = this.geom.copy();

                    if (prim.hasOwnProperty("indices")) tgeom.verticesIndices = gltf.accBuffers[prim.indices];

                    this.fillGeomAttribs(gltf, tgeom, prim.targets[j], false);

                    { // calculate normals for final position of morphtarget for later...
                        for (let i = 0; i < tgeom.vertices.length; i++) tgeom.vertices[i] += this.geom.vertices[i];
                        tgeom.calculateNormals();
                        for (let i = 0; i < tgeom.vertices.length; i++) tgeom.vertices[i] -= this.geom.vertices[i];
                    }

                    this.geom.morphTargets.push(tgeom);
                }
            }
            if (finished)finished(this);
        }
    }


    setGeomVertCols(tgeom,arr)
    {

        if (arr instanceof Float32Array)
        {
            let div=false;
            for (let i = 0; i < arr.length; i++)
            {
                if(arr[i]>1)
                {
                    div=true;
                    continue
                }
            }

            if(div)
            for (let i = 0; i < arr.length; i++)  arr[i] /= 65535;

            tgeom.vertexColors = arr;
        }

        else if (arr instanceof Uint16Array)
        {
            const fb = new Float32Array(arr.length);
            for (let i = 0; i < arr.length; i++)  fb[i] = arr[i] / 65535;

            tgeom.vertexColors = fb;
        } else tgeom.vertexColors = arr;

    }


    fillGeomAttribs(gltf, tgeom, attribs, setGeom)
    {
        if (attribs.hasOwnProperty("POSITION"))tgeom.vertices = gltf.accBuffers[attribs.POSITION];
        if (attribs.hasOwnProperty("NORMAL"))tgeom.vertexNormals = gltf.accBuffers[attribs.NORMAL];
        if (attribs.hasOwnProperty("TEXCOORD_0"))tgeom.texCoords = gltf.accBuffers[attribs.TEXCOORD_0];
        if (attribs.hasOwnProperty("TANGENT"))tgeom.tangents = gltf.accBuffers[attribs.TANGENT];
        if (attribs.hasOwnProperty("COLOR_0"))this.setGeomVertCols(tgeom,gltf.accBuffers[attribs.COLOR_0]);

        if (attribs.hasOwnProperty("TEXCOORD_1"))tgeom.setAttribute("attrTexCoord1", gltf.accBuffers[attribs.TEXCOORD_1], 2);
        if (attribs.hasOwnProperty("TEXCOORD_2"))tgeom.setAttribute("attrTexCoord2", gltf.accBuffers[attribs.TEXCOORD_2], 2);
        if (attribs.hasOwnProperty("TEXCOORD_3"))tgeom.setAttribute("attrTexCoord3", gltf.accBuffers[attribs.TEXCOORD_3], 2);
        if (attribs.hasOwnProperty("TEXCOORD_4"))tgeom.setAttribute("attrTexCoord4", gltf.accBuffers[attribs.TEXCOORD_4], 2);

        if (attribs.hasOwnProperty("WEIGHTS_0"))
        {
            tgeom.setAttribute("attrWeights", gltf.accBuffers[attribs.WEIGHTS_0], 4);
        }
        if (attribs.hasOwnProperty("JOINTS_0"))
        {
            if (!gltf.accBuffers[attribs.JOINTS_0])console.log("no !gltf.accBuffers[attribs.JOINTS_0]");
            tgeom.setAttribute("attrJoints", gltf.accBuffers[attribs.JOINTS_0], 4);
        }


        if (attribs.hasOwnProperty("POSITION")) gltf.accBuffersDelete.push(attribs.POSITION);
        if (attribs.hasOwnProperty("NORMAL")) gltf.accBuffersDelete.push(attribs.NORMAL);
        if (attribs.hasOwnProperty("TEXCOORD_0")) gltf.accBuffersDelete.push(attribs.TEXCOORD_0);
        if (attribs.hasOwnProperty("TANGENT")) gltf.accBuffersDelete.push(attribs.TANGENT);
        if (attribs.hasOwnProperty("COLOR_0"))gltf.accBuffersDelete.push(attribs.COLOR_0);
        if (attribs.hasOwnProperty("TEXCOORD_1")) gltf.accBuffersDelete.push(attribs.TEXCOORD_1);
        if (attribs.hasOwnProperty("TEXCOORD_2")) gltf.accBuffersDelete.push(attribs.TEXCOORD_2);
        if (attribs.hasOwnProperty("TEXCOORD_3")) gltf.accBuffersDelete.push(attribs.TEXCOORD_3);
        if (attribs.hasOwnProperty("TEXCOORD_4")) gltf.accBuffersDelete.push(attribs.TEXCOORD_4);


        if (setGeom !== false) if (tgeom && tgeom.verticesIndices) this.setGeom(tgeom);
    }

    setGeom(geom)
    {
        this.morphGeom = geom.copy();

        if (inNormFormat.get() == "X-ZY")
        {
            for (let i = 0; i < geom.vertexNormals.length; i += 3)
            {
                let t = geom.vertexNormals[i + 2];
                geom.vertexNormals[i + 2] = geom.vertexNormals[i + 1];
                geom.vertexNormals[i + 1] = -t;
            }
        }

        if (inVertFormat.get() == "XZ-Y")
        {
            for (let i = 0; i < geom.vertices.length; i += 3)
            {
                let t = geom.vertices[i + 2];
                geom.vertices[i + 2] = -geom.vertices[i + 1];
                geom.vertices[i + 1] = t;
            }
        }

        if (!geom.vertexNormals.length || inCalcNormals.get()) geom.calculateNormals();

        if ((!geom.biTangents || geom.biTangents.length == 0) && geom.tangents)
        {
            const bitan = vec3.create();
            const tan = vec3.create();

            const tangents = geom.tangents;
            geom.tangents = new Float32Array(tangents.length / 4 * 3);
            geom.biTangents = new Float32Array(tangents.length / 4 * 3);

            for (let i = 0; i < tangents.length; i += 4)
            {
                const idx = i / 4 * 3;

                vec3.cross(
                    bitan,
                    [geom.vertexNormals[idx], geom.vertexNormals[idx + 1], geom.vertexNormals[idx + 2]],
                    [tangents[i], tangents[i + 1], tangents[i + 2]]
                );

                vec3.div(bitan, bitan, [tangents[i + 3], tangents[i + 3], tangents[i + 3]]);
                vec3.normalize(bitan, bitan);

                geom.biTangents[idx + 0] = bitan[0];
                geom.biTangents[idx + 1] = bitan[1];
                geom.biTangents[idx + 2] = bitan[2];

                geom.tangents[idx + 0] = tangents[i + 0];
                geom.tangents[idx + 1] = tangents[i + 1];
                geom.tangents[idx + 2] = tangents[i + 2];
            }
        }

        if (geom.tangents.length === 0 || inCalcNormals.get()) geom.calcTangentsBitangents();
        this.geom = geom;

        this.bounds = geom.getBounds();
    }

    render(cgl, ignoreMaterial)
    {
        if (!this.mesh && this.geom && this.geom.verticesIndices)
        {
            let g = this.geom;
            if (this.geom.vertices.length / 3 > 64000)
            {
                g = this.geom.copy();
                g.unIndex(false, true);
            }

            this.mesh = new CGL.Mesh(cgl, g);
            this.mesh._geom = null;

            // this.geom = null;
        }
        else
        {
            // update morphTargets
            if (this.geom && this.geom.morphTargets.length)
            {
                this.test = time * 11.7;

                if (this.test >= this.geom.morphTargets.length - 1) this.test = 0;

                const mt = this.geom.morphTargets[Math.floor(this.test)];
                const mt2 = this.geom.morphTargets[Math.floor(this.test + 1)];

                if (mt && mt.vertices)
                {
                    if (this.morphGeom.vertexNormals.length != mt.vertexNormals.length)
                        this.morphGeom.vertexNormals = new Float32Array(mt.vertexNormals.length);

                    const fract = this.test % 1;
                    for (let i = 0; i < this.morphGeom.vertices.length; i++)
                    {
                        this.morphGeom.vertices[i] =
                            this.geom.vertices[i] +
                            (1.0 - fract) * mt.vertices[i] +
                            fract * mt2.vertices[i];

                        this.morphGeom.vertexNormals[i] =
                            (1.0 - fract) * mt.vertexNormals[i] +
                            fract * mt2.vertexNormals[i];
                    }

                    this.mesh.updateNormals(this.morphGeom);
                    this.mesh.updateVertices(this.morphGeom);
                }
            }

            const useMat = !ignoreMaterial && this.material != -1 && gltf.shaders[this.material];


            // cgl.pushModelMatrix();
            // if(gltf.renderMMatrix) mat4.mul(cgl.mMatrix,gltf.renderMMatrix,cgl.mMatrix);

            if (useMat) cgl.pushShader(gltf.shaders[this.material]);

            if (this.mesh) this.mesh.render(cgl.getShader(), ignoreMaterial);

            if (useMat) cgl.popShader();
            // cgl.popModelMatrix();
        }
    }
};
