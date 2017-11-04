op.name="PhysicsObject";

var exec=op.inFunction("Exec");
var inMass=op.inValue("Mass");
var inRadius=op.inValue("Radius");

var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var next=op.outFunction("Next");
var outRadius=op.outValue("Out Radius");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

var cgl=op.patch.cgl;

var m=new CGL.WirePoint(cgl,1);

exec.onTriggered=render;

var needSetup=true;
var body=null;

inMass.onChange=setup;
inRadius.onChange=setup;
posX.onChange=setup;
posY.onChange=setup;
posZ.onChange=setup;

var lastWorld=null;

function setup()
{
    var world=cgl.frameStore.world;
    if(!world)return;
    
    if(body)world.removeBody(body);
    
    body = new CANNON.Body({
      mass: inMass.get(), // kg
      position: new CANNON.Vec3(posX.get(), posY.get(), posZ.get()), // m
      shape: new CANNON.Sphere(inRadius.get())
    });
    world.addBody(body);

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
        body.position.z,
        body.position.y
        
        );
    
    quat.set(q,
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w);
    quat.invert(q,q);

    cgl.pushMvMatrix();

    mat4.fromRotationTranslation(trMat,q,vec);
    
    mat4.mul(cgl.mvMatrix,trMat,cgl.mvMatrix);
    
    
    m.render(cgl,inRadius.get()*2);
    
    outX.set(body.position.x);
    outY.set(body.position.y);
    outZ.set(body.position.z);
    
    next.trigger();
    
    cgl.popMvMatrix();
}