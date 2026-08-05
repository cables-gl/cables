const gltfCamera = class
{
    constructor(gltf, node)
    {
        this.node = node;
        this.name = node.name;

        // console.log("camera node", node);
        // console.log(gltf);

        this.config = gltf.json.cameras[node.camera];
        this.config.name = this.name;
        this.pos = vec3.create();
        this.quat = quat.create();
        this.vCenter = vec3.create();
        this.vUp = vec3.create();
        this.vMat = mat4.create();
    }

    start(time)
    {
        if (cgl.tempData.shadowPass) return;
        const asp = cgl.getViewPort()[2] / cgl.getViewPort()[3];

        cgl.pushPMatrix();

        cgl.pushViewMatrix();

        let mv = mat4.create();

        op.patch.cgl.pushModelMatrix();
        // mat4.identity(cgl.mMatrix);
        this.node.transform(op.patch.cgl, time);
        op.patch.cgl.popModelMatrix();

        mat4.invert(mv, this.node.modelMatAbs());

        // console.log(this.node.modelMatAbs());

        this.vMat = mv;

        mat4.identity(cgl.vMatrix);
        mat4.mul(cgl.vMatrix, cgl.vMatrix, mv);
    }

    end()
    {
        if (cgl.tempData.shadowPass) return;
        cgl.popPMatrix();
        cgl.popViewMatrix();
    }
};
