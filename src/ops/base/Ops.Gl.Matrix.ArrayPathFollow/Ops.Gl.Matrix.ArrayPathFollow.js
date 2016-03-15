this.name="Array Path Follow";

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var arrayIn=this.addInPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));
var time=this.addInPort(new Port(this,"time",OP_PORT_TYPE_VALUE));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var idx=this.addOutPort(new Port(this,"index"));



var vec=vec3.create();
var vecn=vec3.create();
var cgl=this.patch.cgl;

var startTime=Date.now();

var animX=new CABLES.TL.Anim();
var animY=new CABLES.TL.Anim();
var animZ=new CABLES.TL.Anim();

var animLength=0;
var timeStep=0.04;
function setup()
{
    var arr=arrayIn.get();

    // timeStep=animLength/arr.length;
    for(var i=0;i<arr.length;i+=3)
    {
        animX.setValue(i*timeStep,arr[i+0]);
        animY.setValue(i*timeStep,arr[i+1]);
        animZ.setValue(i*timeStep,arr[i+2]);
        
        animLength=i*timeStep;
    }    
}

arrayIn.onValueChange(setup);

var q=quat.create();
var qMat=mat4.create();

function render()
{
    if(!arrayIn.get())return;

    var t = time.get()%animLength;
    var nt = (time.get()+timeStep*3.03)%animLength;
    
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

    // console.log(q);
    // console.log(vec);
    cgl.pushMvMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);

    vec3.set(vec,vecn[0]-vec[0],vecn[1]-vec[1],vecn[2]-vec[2]);
    vec3.normalize(vec,vec);
    vec3.set(vecn,0,0,1);

    quat.rotationTo(q,vecn,vec);
    mat4.fromQuat(qMat, q);
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);


    trigger.trigger();
    cgl.popMvMatrix();

    // lastVec=vec3.clone(vec);
}

exe.onTriggered=render;