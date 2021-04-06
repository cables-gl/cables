const gltfCamera = class
{
    constructor(gltf, node)
    {
        this.node=node;
        console.log(gltf);
        this.config=gltf.json.cameras[node.camera];

        this.pos = vec3.create();
        this.quat = quat.create();
        this.quatOr = quat.create();
        this.vCenter = vec3.create();
        this.vUp = vec3.create();
        this.transMatrix = mat4.create();
    }

    updateAnim(time)
    {
        if (this.node && this.node._animTrans)
        {

            vec3.set(this.pos,
                this.node._animTrans[0].getValue(time),
                this.node._animTrans[1].getValue(time),
                this.node._animTrans[2].getValue(time));

            quat.set(this.quat,
                this.node._animRot[0].getValue(time),
                this.node._animRot[1].getValue(time),
                this.node._animRot[2].getValue(time),
                this.node._animRot[3].getValue(time));
        }
    }

    start(time)
    {
        if (cgl.frameStore.shadowPass) return;

        this.updateAnim(time);
        const asp = cgl.getViewPort()[2] / cgl.getViewPort()[3];

        cgl.pushPMatrix();
        mat4.perspective(
            cgl.pMatrix,
            this.config.perspective.yfov*0.25,
            asp,
            this.config.perspective.znear,
            this.config.perspective.zfar);

        cgl.pushViewMatrix();
        // mat4.identity(cgl.vMatrix);

        // if(this.node && this.node.parent)
        // {
        //     console.log(this.node.parent)
            // vec3.add(this.pos,this.pos,this.node.parent._node.translation);
            // vec3.sub(this.vCenter,this.vCenter,this.node.parent._node.translation);
            // mat4.translate(cgl.vMatrix,cgl.vMatrix,
            // [
            //     -this.node.parent._node.translation[0],
            //     -this.node.parent._node.translation[1],
            //     -this.node.parent._node.translation[2]
            // ])
        // }



        // vec3.set(this.vUp, 0, 1, 0);
        // vec3.set(this.vCenter, 0, -1, 0);
        // // vec3.set(this.vCenter, 0, 1, 0);
        // vec3.transformQuat(this.vCenter, this.vCenter, this.quat);
        // vec3.normalize(this.vCenter, this.vCenter);
        // vec3.add(this.vCenter, this.vCenter, this.pos);


        // mat4.lookAt(cgl.vMatrix, this.pos, this.vCenter, this.vUp);


        let mv=mat4.create();
        mv=this.node.modelMatAbs();
        mat4.invert(mv,mv);

        mat4.mul(cgl.vMatrix,cgl.vMatrix,mv);


        // mat4.multiply(cgl.vMatrix,cgl.vMatrix,this.transMatrix);
    }

    end()
    {
        if (cgl.frameStore.shadowPass) return;
        cgl.popPMatrix();
        cgl.popViewMatrix();
    }
};

