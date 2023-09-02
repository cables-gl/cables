const GltfTargetsRenderer = class
{
    constructor(mesh)
    {
        this.mesh = mesh;
        this.makeTex(mesh.geom);
        this.numRowsPerTarget = 0;

        console.log(this.mesh);
    }

    renderFinish(cgl)
    {
        cgl.popModelMatrix();
        this._mod.unbind();
    }

    renderStart(cgl, time)
    {
        if (!this._mod)
        {
            this._mod = new CGL.ShaderModifier(cgl, "gltftarget");

            this._mod.addModule({
                "priority": -2,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": attachments.targets_head_vert || "",
                "srcBodyVert": attachments.targets_vert || ""
            });

            this._mod.addUniformVert("4f", "MOD_targetTexInfo", [0, 0, 0, 0]);
            this._mod.addUniformVert("t", "MOD_targetTex", 1);

            this._mod.addUniformVert("f[]", "MOD_weights", []);

            const tr = vec3.create();
        }

        // const skinIdx = this._node.skin;
        // const arrLength = gltf.json.skins[skinIdx].joints.length * 16;

        // // if (this._lastTime != time || !time)
        // {
        //     // this._lastTime=inTime.get();
        //     if (this._matArr.length != arrLength) this._matArr.length = arrLength;

        //     for (let i = 0; i < gltf.json.skins[skinIdx].joints.length; i++)
        //     {
        //         const i16 = i * 16;
        //         const jointIdx = gltf.json.skins[skinIdx].joints[i];
        //         const nodeJoint = gltf.nodes[jointIdx];

        //         for (let j = 0; j < 16; j++)
        //             this._invBindMatrix[j] = gltf.accBuffers[gltf.json.skins[skinIdx].inverseBindMatrices][i16 + j];

        //         mat4.mul(this._m, nodeJoint.modelMatAbs(), this._invBindMatrix);

        //         for (let j = 0; j < this._m.length; j++) this._matArr[i16 + j] = this._m[j];
        //     }

        //     this._lastTime = time;
        // }

        if (this.tex && this.mesh.weights)
        {
            this._mod.setUniformValue("MOD_targetTexInfo", [this.tex.width, this.tex.height, this.numRowsPerTarget, this.mesh.weights.length]);

            this._mod.pushTexture("MOD_targetTex", this.tex);

            // console.log(this.mesh.weights);
            this._mod.setUniformValue("MOD_weights", this.mesh.weights);
        }

        this._mod.define("MOD_NUM_WEIGHTS", this.mesh.weights.length);
        this._mod.bind();

        // draw mesh...
        cgl.pushModelMatrix();
        if (this.identity)mat4.identity(cgl.mMatrix);
    }

    makeTex(geom)
    {
        if (!geom.morphTargets || !geom.morphTargets.length) return;

        let w = geom.morphTargets[0].vertices.length / 3;
        let h = 0;
        this.numRowsPerTarget = 0;

        if (geom.morphTargets[0].vertices && geom.morphTargets[0].vertices.length) this.numRowsPerTarget++;
        if (geom.morphTargets[0].vertexNormals && geom.morphTargets[0].vertexNormals.length) this.numRowsPerTarget++;
        if (geom.morphTargets[0].tangents && geom.morphTargets[0].tangents.length) this.numRowsPerTarget++;
        if (geom.morphTargets[0].bitangents && geom.morphTargets[0].bitangents.length) this.numRowsPerTarget++;

        h = geom.morphTargets.length * this.numRowsPerTarget;

        console.log("this.numRowsPerTarget", this.numRowsPerTarget);

        const pixels = new Float32Array(w * h * 4);
        let row = 0;

        for (let i = 0; i < geom.morphTargets.length; i++)
        {
            for (let ss = 0; ss < 3; ss++)
                if (geom.morphTargets[i].vertices && geom.morphTargets[i].vertices.length)
                {
                    for (let j = 0; j < geom.morphTargets[i].vertices.length; j += 3)
                    {
                        pixels[((row * w) + (j / 3)) * 4 + 0] = geom.morphTargets[i].vertices[j + 0];
                        pixels[((row * w) + (j / 3)) * 4 + 1] = geom.morphTargets[i].vertices[j + 1];
                        pixels[((row * w) + (j / 3)) * 4 + 2] = geom.morphTargets[i].vertices[j + 2];
                        pixels[((row * w) + (j / 3)) * 4 + 3] = 1;
                    }
                    row++;
                }

            // if (geom.morphTargets[i].vertexNormals && geom.morphTargets[i].vertexNormals.length)
            // {
            //     for (let j = 0; j < geom.morphTargets[i].vertexNormals.length; j += 3)
            //     {
            //         pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].vertexNormals[j + 0];
            //         pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].vertexNormals[j + 1];
            //         pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].vertexNormals[j + 2];
            //         pixels[(row * w + j / 3) * 4 + 3] = 1;
            //     }

            //     row++;
            // }

            // if (geom.morphTargets[i].tangents && geom.morphTargets[i].tangents.length)
            // {
            //     for (let j = 0; j < geom.morphTargets[i].tangents.length; j += 3)
            //     {
            //         pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].tangents[j + 0];
            //         pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].tangents[j + 1];
            //         pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].tangents[j + 2];
            //         pixels[(row * w + j / 3) * 4 + 3] = 1;
            //     }
            //     row++;
            // }

            // if (geom.morphTargets[i].bitangents && geom.morphTargets[i].bitangents.length)
            // {
            //     for (let j = 0; j < geom.morphTargets[i].bitangents.length; j += 3)
            //     {
            //         pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].bitangents[j + 0];
            //         pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].bitangents[j + 1];
            //         pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].bitangents[j + 2];
            //         pixels[(row * w + j / 3) * 4 + 3] = 1;
            //     }
            //     row++;
            // }
        }

        this.tex = new CGL.Texture(cgl, { "isFloatingPointTexture": true, "name": "targetsTexture" });

        this.tex.initFromData(pixels, w, h, CGL.Texture.FILTER_NEAREST, CGL.Texture.WRAP_CLAMP_TO_EDGE);

        console.log("morphTargets generated texture", w, h);
    }
};
