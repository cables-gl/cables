const GltfInstancer = class
{
    static mod = null;

    constructor(node, matrices)
    {
        this._node = node;
        this.matrices = matrices;
        this.num = matrices.length / 16;
    }

    static getMod(cgl)
    {
        if (!GltfInstancer.mod)
        {
            GltfInstancer.mod = new CGL.ShaderModifier(cgl, "gltfinstancer", { "opId": op.id });

            GltfInstancer.mod.addModule(
                {
                    "priority": -2,
                    "name": "MODULE_VERTEX_POSITION",
                    "srcHeadVert": attachments.instance_head_vert || "",
                    "srcBodyVert": attachments.instance_vert || ""
                });
        }
        return GltfInstancer.mod;
    }

    renderStart(cgl, mesh)
    {
        if (!cgl.gl) return;

        if (mesh._gltfInstancer != this)
        {
            mesh.setAttribute("instMat", this.matrices, 16, { "instanced": true });
            mesh.setNumInstances(this.num);
            mesh._gltfInstancer = this;
        }

        GltfInstancer.getMod(cgl).bind();
    }

    renderFinish(cgl)
    {
        if (!cgl.gl || !GltfInstancer.mod) return;
        GltfInstancer.mod.unbind();
    }

    static reset(mesh)
    {
        if (!mesh._gltfInstancer) return;
        mesh.setNumInstances(0);
        mesh._gltfInstancer = null;
    }
};
