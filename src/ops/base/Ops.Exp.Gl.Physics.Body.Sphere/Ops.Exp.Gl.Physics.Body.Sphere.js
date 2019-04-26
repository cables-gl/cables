var exec=op.inTrigger("Exec");
var inMass=op.inValue("Mass");
var inRadius=op.inValue("Radius",1);

var doRender=op.inValueBool("Render",true);

var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var inReset=op.inTriggerButton("Reset");


var next=op.outTrigger("Next");
var outRadius=op.outValue("Out Radius");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

var outCollision=op.outTrigger("Collision");

var cgl=op.patch.cgl;

var m=new CGL.WirePoint(cgl,1);

exec.onTriggered=render;

var needSetup=true;
var body=null;

inMass.onChange=setup;
inRadius.onChange=setup;
// posX.onChange=setup;
// posY.onChange=setup;
// posZ.onChange=setup;

var lastWorld=null;

var collided=false;

inReset.onTriggered=function()
{
    needSetup=true;
};

// function createTetra()
// {
//     var verts = [new CANNON.Vec3(0,0,0),
//         new CANNON.Vec3(2,0,0),
//         new CANNON.Vec3(0,2,0),
//         new CANNON.Vec3(0,0,2)];
//     var offset = -0.35;
//     for(var i=0; i<verts.length; i++){
//         var v = verts[i];
//         v.x += offset;
//         v.y += offset;
//         v.z += offset;
//     }

//     return new CANNON.ConvexPolyhedron(verts,
//         [
//             [0,3,2], // -x
//             [0,1,3], // -y
//             [0,2,1], // -z
//             [1,2,3], // +xyz
//         ]);
// }


function setup()
{
    var world=cgl.frameStore.world;
    if(!world)return;

    if(body)world.removeBody(body);

    body = new CANNON.Body({
      mass: inMass.get(), // kg
      position: new CANNON.Vec3(posX.get(), posY.get(), posZ.get()), // m
      shape: new CANNON.Sphere(Math.max(0,inRadius.get()))
    });


    world.addBody(body);

    body.addEventListener("collide",function(e){
        collided=true;
        // collision.trigger();
        // console.log("The sphere just collided with the ground!");
        // console.log("Collided with body:",e.body);
        // console.log("Contact between bodies:",e.contact);
    });


    lastWorld=world;
    needSetup=false;
    outRadius.set(inRadius.get());
}

var vec=vec3.create();
var q=quat.create();

var trMat=mat4.create();
function render()
{
    if(needSetup)setup();
    if(lastWorld!=cgl.frameStore.world)setup();

    if(!body)return;


    vec3.set(vec,
        body.position.x,
        body.position.y,
        body.position.z
        );

    quat.set(q,
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w);
    quat.invert(q,q);

    cgl.pushModelMatrix();

    mat4.fromRotationTranslation(trMat,q,vec);
    mat4.mul(cgl.mMatrix,trMat,cgl.mMatrix);

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