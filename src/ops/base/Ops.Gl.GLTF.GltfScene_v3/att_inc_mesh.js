
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
            dracoLoadMesh(gltf.chunks[0].data.bufferViews[prim.extensions.KHR_draco_mesh_compression.bufferView], this.name,
                (geom) =>
                {
                    this.setGeom(geom);
                    this.mesh = null;
                    gltf.loadingMeshes--;

                    if (finished)finished(this);
                });
        }
        else
        {
            gltf.loadingMeshes--;
            this.fillGeomAttribs(gltf, this.geom, prim.attributes);

            if (prim.targets)
                for (let j = 0; j < prim.targets.length; j++)
                {
                    // var tgeom=new CGL.Geometry("gltf_"+this.name);
                    let tgeom = this.geom.copy();

                    if (prim.hasOwnProperty("indices")) tgeom.verticesIndices = gltf.accBuffers[prim.indices];
                    this.fillGeomAttribs(gltf, tgeom, prim.targets[j]);
                    // const attribs=prim.targets[j];

                    // if(attribs.hasOwnProperty("POSITION"))tgeom.vertices=gltf.accBuffers[attribs.POSITION];
                    // if(attribs.hasOwnProperty("NORMAL"))tgeom.vertexNormals=gltf.accBuffers[attribs.NORMAL];
                    // if(attribs.hasOwnProperty("TEXCOORD_0"))tgeom.texCoords=gltf.accBuffers[attribs.TEXCOORD_0];
                    // if(attribs.hasOwnProperty("TANGENT"))tgeom.tangents=gltf.accBuffers[attribs.TANGENT];
                    // if(attribs.hasOwnProperty("COLOR_0"))tgeom.vertexColors=gltf.accBuffers[attribs.COLOR_0];

                    // if(tgeom && tgeom.verticesIndices) this.setGeom(tgeom);

                    // console.log( Object.keys(prim.targets[j]) );

                    { // calculate normals for final position of morphtarget for later...
                        for (let i = 0; i < tgeom.vertices.length; i++) tgeom.vertices[i] += this.geom.vertices[i];
                        tgeom.calculateNormals();
                        for (let i = 0; i < tgeom.vertices.length; i++) tgeom.vertices[i] -= this.geom.vertices[i];
                    }

                    this.geom.morphTargets.push(tgeom);
                }
            if (finished)finished(this);
        }
    }


    fillGeomAttribs(gltf, tgeom, attribs)
    {
        if (attribs.hasOwnProperty("POSITION"))tgeom.vertices = gltf.accBuffers[attribs.POSITION];
        if (attribs.hasOwnProperty("NORMAL"))tgeom.vertexNormals = gltf.accBuffers[attribs.NORMAL];
        if (attribs.hasOwnProperty("TEXCOORD_0"))tgeom.texCoords = gltf.accBuffers[attribs.TEXCOORD_0];
        if (attribs.hasOwnProperty("TANGENT"))tgeom.tangents = gltf.accBuffers[attribs.TANGENT];
        if (attribs.hasOwnProperty("COLOR_0"))tgeom.vertexColors = gltf.accBuffers[attribs.COLOR_0];


        if (attribs.hasOwnProperty("TEXCOORD_1"))tgeom.setAttribute("attrTexCoord1", gltf.accBuffers[attribs.TEXCOORD_1], 2);
        if (attribs.hasOwnProperty("TEXCOORD_2"))tgeom.setAttribute("attrTexCoord2", gltf.accBuffers[attribs.TEXCOORD_2], 2);
        if (attribs.hasOwnProperty("TEXCOORD_3"))tgeom.setAttribute("attrTexCoord3", gltf.accBuffers[attribs.TEXCOORD_3], 2);
        if (attribs.hasOwnProperty("TEXCOORD_4"))tgeom.setAttribute("attrTexCoord4", gltf.accBuffers[attribs.TEXCOORD_4], 2);



        if (tgeom && tgeom.verticesIndices) this.setGeom(tgeom);
    }
    // fillGeomAttribs(gltf,geom,attribs)
    // {

    //     // Implementation note: When normals and tangents are specified,
    //     // client implementations should compute the bitangent by taking
    //     // the cross product of the normal and tangent xyz vectors and
    //     // multiplying against the w component of the tangent:
    //     // bitangent = cross(normal, tangent.xyz) * tangent.w

    // }

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
        if (!this.geom) return;

        if (!this.mesh && this.geom && this.geom.verticesIndices)
        {
            let g = this.geom;
            if (this.geom.vertices.length / 3 > 64000)
            {
                g = this.geom.copy();
                g.unIndex(false, true);
            }

            this.mesh = new CGL.Mesh(cgl, g);
        }
        else
        {
            // update morphTargets
            if (this.geom.morphTargets.length)
            {
                this.test = time * 11.7;

                if (this.test >= this.geom.morphTargets.length - 1) this.test = 0;

                const mt = this.geom.morphTargets[Math.floor(this.test)];
                const mt2 = this.geom.morphTargets[Math.floor(this.test + 1)];

                if (mt && mt.vertices)
                {
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

            if (useMat) cgl.pushShader(gltf.shaders[this.material]);

            if (this.mesh)
            {
                this.mesh.render(cgl.getShader(), ignoreMaterial);
            }

            if (useMat) cgl.popShader();
        }
    }
};
