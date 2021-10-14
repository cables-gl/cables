const GltfSkin = class
{
    constructor(node)
    {
        this._mod=null;
        this._node=node;
    }

    renderFinish(cgl)
    {
        cgl.popModelMatrix();
        this._mod.unbind();

    }


    renderStart(cgl,time)
    {
        if(!this._mod)
        {
            this._mod = new CGL.ShaderModifier(cgl, op.name);

            this._mod.addModule({
                "priority": -2,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": attachments.skin_head_vert || "",
                "srcBodyVert": attachments.skin_vert || ""
            });

            this._mod.addUniformVert("m4[]", "MOD_boneMats", []);//bohnenmatze

            const tr = vec3.create();

        }


        let arr = []; // TODO make member


        const skinIdx = this._node.skin;
        const arrLength = gltf.json.skins[skinIdx].joints.length * 16;

        if (arr.length != arrLength) arr.length = arrLength;

        const invBindMatrix = mat4.create();
        const m = mat4.create();
        const nodeSkin = gltf.nodes[this._node.skin];


        // console.log("yo",this._node.skin)
        // this._node.render(cgl, false, true, true, false, false, time);

        for (let i = 0; i < gltf.json.skins[skinIdx].joints.length; i++)
        {
            const jointIdx = gltf.json.skins[skinIdx].joints[i];
            const nodeJoint = gltf.nodes[jointIdx];

            for (let j = 0; j < 16; j++)
                invBindMatrix[j] = gltf.accBuffers[gltf.json.skins[skinIdx].inverseBindMatrices][i * 16 + j];

            mat4.mul(m, nodeJoint.modelMatAbs(), invBindMatrix);

            for (let j = 0; j < m.length; j++) arr[i * 16 + j] = m[j];
        }

        this._mod.setUniformValue("MOD_boneMats", arr);


        this._mod.define("SKIN_NUM_BONES", gltf.json.skins[skinIdx].joints.length);

        this._mod.bind();

        // draw mesh...
        cgl.pushModelMatrix();
        // this._node.render(cgl, true, false, true, false, true);


    }
}



