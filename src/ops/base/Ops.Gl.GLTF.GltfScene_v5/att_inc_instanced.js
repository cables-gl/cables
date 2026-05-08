const GltfInstancer = class
{
    mesh = mesh;
    tex = null;
    numRowsPerTarget = 0;
    numRowsPerGeom = 1;

    constructor(mesh)
    {

    }

    renderFinish(cgl)
    {
        if (!this.tex) return;
        if (!cgl.gl) return;
        cgl.popModelMatrix();
        this._mod.unbind();
    }

    renderStart(cgl)
    {
        if (!this.tex) return;
        if (!cgl.gl) return;
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

        this._mod.pushTexture("MOD_targetTex", this.tex);
        if (this.tex && this.mesh.weights)
        {
            this._mod.setUniformValue("MOD_weights", this.mesh.weights);
            this._mod.setUniformValue("MOD_targetTexInfo", [this.tex.width, this.tex.height, this.numRowsPerTarget, this.mesh.weights.length]);

            this._mod.define("MOD_NUM_WEIGHTS", Math.max(1, this.mesh.weights.length));
            this._mod.define("MOD_ROWSGEOM", this.numRowsPerGeom + ".0");
            this._mod.define("MOD_ROWSTARGET", this.numRowsPerTarget * this.numRowsPerGeom + ".0");
        }
        else
        {
            this._mod.define("MOD_NUM_WEIGHTS", 1);
        }
        this._mod.bind();

        // draw mesh...
        cgl.pushModelMatrix();
        if (this.identity)mat4.identity(cgl.mMatrix);
    }

};
