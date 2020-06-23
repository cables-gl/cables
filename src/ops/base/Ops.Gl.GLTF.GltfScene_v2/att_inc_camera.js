var gltfCamera=class
{
    constructor(gltf,config)
    {
        this.name=config.name||"unknown";
        this.config=config;
        this.node=gltf.getNode(this.name);
        // this.nodeOrient=gltf.getNode(this.name+"_Orientation");

        this.pos=vec3.create();
        this.quat=quat.create();
        this.quatOr=quat.create();
        this.vCenter=vec3.create();
        this.vUp=vec3.create();
        this.transMatrix=mat4.create();

        vec3.set(this.pos,
            this.node._node.translation[0],
            this.node._node.translation[1],
            this.node._node.translation[2]);

        vec3.set(this.quat,
            this.node._node.rotation[0],
            this.node._node.rotation[1],
            this.node._node.rotation[2],
            this.node._node.rotation[3]);

console.log("cam node !!!",this.node._node)
        if(this.node._node._animTrans)
        {
            const t=0;

            vec3.set(this.pos,
                this.node._node._animTrans[0].getValue(t),
                this.node._node._animTrans[1].getValue(t),
                this.node._node._animTrans[2].getValue(t));

            vec3.set(this.quat,
                this.node._node._animRot[0].getValue(t),
                this.node._node._animRot[1].getValue(t),
                this.node._node._animRot[2].getValue(t),
                this.node._node._animRot[3].getValue(t));
console.log("USING ANIMATYED CAM !!!",this.node._node)
        }


        // vec3.set(this.quatOr,
        //     this.nodeOrient._node.rotation[0],
        //     this.nodeOrient._node.rotation[1],
        //     this.nodeOrient._node.rotation[2],
        //     this.nodeOrient._node.rotation[3]);

        // quat.set(quat1,x1.get(),y1.get(),z1.get(),w1.get());
        // quat.set(quat2,x2.get(),y2.get(),z2.get(),w2.get());
        // quat.multiply(this.quat,this.quat,this.quatOr);

        // console.log("this.node._node.rotation",this.quat);
    }

    start()
    {
        let asp = cgl.getViewPort()[2] / cgl.getViewPort()[3];

        cgl.pushPMatrix();
        // mat4.perspective(
        //     cgl.pMatrix,
        //     this.config.perspective.yfov,
        //     asp,
        //     this.config.perspective.znear,
        //     this.config.perspective.zfar);

        cgl.pushViewMatrix();
        // mat4.identity(cgl.vMatrix);

        vec3.set(this.vUp, 0,1,0);
        vec3.set(this.vCenter, 0,-1,0);
        vec3.transformQuat(this.vCenter, this.vCenter, this.quat);
        vec3.normalize(this.vCenter,this.vCenter);
        vec3.add(this.vCenter,this.vCenter,this.pos);

        mat4.lookAt(cgl.vMatrix, this.pos, this.vCenter, this.vUp);
        // mat4.multiply(cgl.vMatrix,cgl.vMatrix,this.transMatrix);
    }

    end()
    {
        cgl.popPMatrix();
        cgl.popViewMatrix();
    }
};




    // cgl.pushViewMatrix();

    // quat.set(vQuat,quatX.get(),quatY.get(),quatZ.get(),quatW.get());

    // vec3.set(vUp, vecUpX.get(),vecUpY.get(),vecUpZ.get());
    // vec3.set(vEye, eyeX.get(),eyeY.get(),eyeZ.get());

    // vec3.set(vCenter,0,-1,0);
    // vec3.transformQuat(vCenter, vCenter, vQuat);
    // vec3.normalize(vCenter,vCenter);
    // vec3.add(vCenter,vCenter,vEye);

    // mat4.lookAt(transMatrix, vEye, vCenter, vUp);

    // mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);


