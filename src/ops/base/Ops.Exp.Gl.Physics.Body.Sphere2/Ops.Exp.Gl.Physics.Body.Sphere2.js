var exec=op.inTrigger("Exec");
var inMass=op.inValue("Mass");
var inRadius=op.inValue("Radius",1);

var doRender=op.inValueBool("Render",true);

// var posX=op.inValue("Pos X");
// var posY=op.inValue("Pos Y");
// var posZ=op.inValue("Pos Z");

var inReset=op.inTriggerButton("Reset");


var next=op.outTrigger("Next");
var outRadius=op.outValue("Out Radius");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

var outHit=op.outValueBool("Ray Hit",false);

var outCollision=op.outTrigger("Collision");

var cgl=op.patch.cgl;

var m=new CGL.WirePoint(cgl,1);

exec.onTriggered=render;

var needSetup=true;
var body=null;

inMass.onChange=setup;
inRadius.onChange=setup;

var lastWorld=null;

var collided=false;

inReset.onTriggered=function()
{
    needSetup=true;
};

function setup()
{
    var world=cgl.frameStore.world;
    if(!world)return;

    if(body)world.removeBody(body);

    body = new CANNON.Body({
      mass: inMass.get(), // kg
    //   position: new CANNON.Vec3(posX.get(), posY.get(), posZ.get()), // m
      shape: new CANNON.Sphere(Math.max(0,inRadius.get()))
    });


    world.addBody(body);

    body.addEventListener("collide",function(e){
        collided=true;
    });

    lastWorld=world;
    needSetup=false;
    outRadius.set(inRadius.get());
}

var vec=vec3.create();
var q=quat.create();
const empty=vec3.create();

var trMat=mat4.create();
function render()
{
    if(needSetup)setup();
    if(lastWorld!=cgl.frameStore.world)setup();

    if(!body)return;

    outHit.set(body.raycastHit);

    var staticPos=inMass.get()==0;


    if(staticPos)
    {
        // static position
        vec3.transformMat4(vec, empty, cgl.mMatrix);
        body.position.x=vec[0];
        body.position.y=vec[1];
        body.position.z=vec[2];

    }
    else
    {
        vec3.set(vec,
            body.position.x,
            body.position.y,
            body.position.z
            );
    }

    quat.set(q,
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w);
    quat.invert(q,q);

    cgl.pushModelMatrix();

    if(!staticPos)
    {
        mat4.fromRotationTranslation(trMat,q,vec);
        mat4.mul(cgl.mMatrix,trMat,cgl.mMatrix);
    }


    if(doRender.get())m.render(cgl,inRadius.get()*2);

    outX.set(body.position.x);
    outY.set(body.position.y);
    outZ.set(body.position.z);

    if(collided)
    {
        collided=false;
        outCollision.trigger();
    }

    CABLES.physicsCurrentBody=body;

    next.trigger();

    CABLES.physicsCurrentBody=null;
    cgl.popModelMatrix();
}