this.name="QuaternionCamera";
var cgl=this.patch.cgl;
var patch=this.patch;
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));


var posX=this.addInPort(new Port(this,"posX"));
var posY=this.addInPort(new Port(this,"posY"));
var posZ=this.addInPort(new Port(this,"posZ"));

var qx=this.addInPort(new Port(this,"quat x"));
var qy=this.addInPort(new Port(this,"quat y"));
var qz=this.addInPort(new Port(this,"quat z"));
var qw=this.addInPort(new Port(this,"quat w"));

var fov=this.addInPort(new Port(this,"fov"));

var clipNear=this.addInPort(new Port(this,"clip near"));
var clipFar=this.addInPort(new Port(this,"clip far"));

var lax=this.addInPort(new Port(this,"lookat x"));
var lay=this.addInPort(new Port(this,"lookat y"));

var laz=this.addInPort(new Port(this,"lookat z"));


var matrix=this.addInPort(new Port(this,"matrix")); //OP_PORT_TYPE_ARRAY


qx.set(0.0);
qy.set(0.0);
qz.set(0.0);
qw.set(0.0);

var q=quat.create();
var vPos=vec3.create();
var vPosDir=vec3.create();
var vUp=vec3.create();
vec3.set(vUp,0,1,0);
var qMat=mat4.create();
var transMatrix=mat4.create();
var vCenter=vec3.create();
var vLookat=vec3.create();

render.onTriggered=function()
{
    if(qx.isAnimated())
    {
        var time=patch.timer.getTime();

        CABLES.TL.Anim.slerpQuaternion(time,q,qx.anim,qy.anim,qz.anim,qw.anim);
    }
    else
    {
        quat.set(q, qx.get(),qy.get(),qz.get(),qw.get());
    }

    vec3.set(vPos,
        -1*posX.get(),
        -1*posY.get(),
        -1*posZ.get()
        );

    vec3.set(vCenter, 0,1,0 );
    vec3.set(vLookat, lax.get(),lay.get(),laz.get() );

    // vec3.set(vCenter,
    //     1,
    //     1,
    //     1
    //     );

    // quat.invert(q,q);
    mat4.fromQuat(qMat, q);

    // quat.rotateX(out, a, rad)
    // quat.rotateY(out, a, rad)
    // quat.rotateZ(out, a, rad)

    // mat4.rotate(qMat, qMat, ta.get()*CGL.DEG2RAD, [ tx.get() , ty.get() , tz.get() ]);
    // mat4.translate(qMat,qMat,vPos);

    // vec3.transformMat4( vCenter, vCenter, qMat );

    // // mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,qMat);
    // // vec3.add(vCenter,vCenter,vPos);

    // mat4.perspective(
    //     cgl.pMatrix,
    //     45*0.0174533,
    //     3,
    //     clipNear.get(),
    //     clipFar.get()
    //     );

    // mat4.perspective(
    //     cgl.pMatrix,
    //     fov.get(),
    //     3,
    //     clipNear.get(),
    //     clipFar.get()
    //     );

    // mat4.perspective(cgl.pMatrix, , cgl.getViewPort()[2]/cgl.getViewPort()[3], cgl.frameStore.perspective.zNear, cgl.frameStore.perspective.zFar);

    cgl.pushMvMatrix();

    // mat4.lookAt( transMatrix, vPos, vCenter, vUp );
    // mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);
    // mat4.rotate(qMat, qMat, ta.get()*CGL.DEG2RAD, [ tx.get() , ty.get() , tz.get() ]);

    // mat4.rotateX(cgl.mvMatrix,cgl.mvMatrix, 180*CGL.DEG2RAD);
    // mat4.rotateY(cgl.mvMatrix,cgl.mvMatrix, 90*CGL.DEG2RAD);

    if(matrix.get())
    {
        // console.log('ja matrix');
    }

    mat4.multiply(
        cgl.mvMatrix,
        cgl.mvMatrix,
        matrix.get()
        );

    // cgl.mvMatrix=matrix.get();
    // mat4.translate(cgl.mvMatrix,cgl.mvMatrix,vPos);
    // mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,qMat);

    trigger.trigger();

    cgl.popMvMatrix();

};
