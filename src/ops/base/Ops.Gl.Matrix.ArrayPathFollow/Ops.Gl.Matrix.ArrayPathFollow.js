
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var arrayIn=op.addInPort(new CABLES.Port(op,"array",CABLES.OP_PORT_TYPE_ARRAY));
var time=op.addInPort(new CABLES.Port(op,"time",CABLES.OP_PORT_TYPE_VALUE));

var duration=op.addInPort(new CABLES.Port(op,"duration",CABLES.OP_PORT_TYPE_VALUE));
duration.set(0.1);

var offset=op.addInPort(new CABLES.Port(op,"offset",CABLES.OP_PORT_TYPE_VALUE));
offset.set(0.0);

var lookAhead=op.addInPort(new CABLES.Port(op,"look ahead",CABLES.OP_PORT_TYPE_VALUE));
lookAhead.set(3.0);

var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var triggerLookat=op.addOutPort(new CABLES.Port(op,"transform lookat",CABLES.OP_PORT_TYPE_FUNCTION));
var idx=op.addOutPort(new CABLES.Port(op,"index"));

var vec=vec3.create();
var vecn=vec3.create();
var cgl=op.patch.cgl;

var startTime=CABLES.now();

var animX=new CABLES.TL.Anim();
var animY=new CABLES.TL.Anim();
var animZ=new CABLES.TL.Anim();

var animQX=new CABLES.TL.Anim();
var animQY=new CABLES.TL.Anim();
var animQZ=new CABLES.TL.Anim();
var animQW=new CABLES.TL.Anim();

var animLength=0;
var timeStep=0.1;
function setup()
{
    animX.clear();
    animY.clear();
    animZ.clear();

    animQX.clear();
    animQY.clear();
    animQZ.clear();
    animQW.clear();

    var i=0;
    var arr=arrayIn.get();
    if(!arr)return;
    timeStep=parseFloat(duration.get());

    for(i=0;i<arr.length;i+=3)
    {
        animX.setValue(i/3*timeStep,arr[i+0]);
        animY.setValue(i/3*timeStep,arr[i+1]);
        animZ.setValue(i/3*timeStep,arr[i+2]);
        animLength=i/3*timeStep;
    }

    for(i=0;i<arr.length/3;i++)
    {
        var t = i*timeStep;
        var nt = (i*timeStep+timeStep)%animLength;

        vec3.set(vec,
            animX.getValue(t),
            animY.getValue(t),
            animZ.getValue(t)
        );
        vec3.set(vecn,
            animX.getValue(nt),
            animY.getValue(nt),
            animZ.getValue(nt)
        );

    // console.log( nt,animLength,vecn );


        vec3.set(vec,vecn[0]-vec[0],vecn[1]-vec[1],vecn[2]-vec[2]);
        vec3.normalize(vec,vec);
        vec3.set(vecn,0,0,1);

        quat.rotationTo(q,vecn,vec);




        animQX.setValue(i*timeStep,q[0]);
        animQY.setValue(i*timeStep,q[1]);
        animQZ.setValue(i*timeStep,q[2]);
        animQW.setValue(i*timeStep,q[3]);


        // t,nt);


    }

}

arrayIn.onValueChange(setup);
duration.onValueChange(setup);

var q=quat.create();
var qMat=mat4.create();

function render()
{
    if(!arrayIn.get())return;

    var t = (time.get() +parseFloat(offset.get()) )%animLength;
    var nt = (time.get()+timeStep*lookAhead.get()+parseFloat(offset.get()))%animLength;

    vec3.set(vec,
        animX.getValue(t),
        animY.getValue(t),
        animZ.getValue(t)
    );

    idx.set(nt);

    if(triggerLookat.isLinked())
    {
        vec3.set(vecn,
            animX.getValue(nt),
            animY.getValue(nt),
            animZ.getValue(nt)
        );

        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vecn);
        triggerLookat.trigger();
        cgl.popModelMatrix();
    }

    cgl.pushModelMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);

    CABLES.TL.Anim.slerpQuaternion(t,q,animQX,animQY,animQZ,animQW);
    mat4.fromQuat(qMat, q);
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);

    trigger.trigger();
    cgl.popModelMatrix();

}

exe.onTriggered=render;