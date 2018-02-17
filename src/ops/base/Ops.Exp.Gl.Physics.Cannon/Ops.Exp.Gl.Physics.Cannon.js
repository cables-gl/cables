op.name="Cannon";

var exec=op.inFunction("Exec");
var inMass=op.inValue("Mass");
var inRadius=op.inValue("Radius");

var doRender=op.inValueBool("Render",true);

var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var dirX=op.inValue("dir X");
var dirY=op.inValue("dir Y");
var dirZ=op.inValue("dir Z");

var speed=op.inValue("Speed");

var inReset=op.inFunctionButton("Reset");
var inSpawn=op.inFunctionButton("Spawn");


var next=op.outFunction("Next");
var outRadius=op.outValue("Out Radius");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

var outCollision=op.outFunction("Collision");

var cgl=op.patch.cgl;

var m=new CGL.WirePoint(cgl,1);

exec.onTriggered=render;

var needSetup=true;


inMass.onChange=setup;
inRadius.onChange=setup;
inSpawn.onTriggered=spawn;

var lastWorld=null;

var collided=false;

inReset.onTriggered=function()
{
    var world=cgl.frameStore.world;
    for(var i=0;i<bodies.length;i++)
    {
        world.removeBody(bodies[i]);
    }
    bodies.length=0;
};

var bodies=[];


function spawn()
{
    var world=cgl.frameStore.world;
    if(!world)return;

    var body = new CANNON.Body({
      mass: inMass.get(), // kg
      position: new CANNON.Vec3(posX.get(), posY.get(), posZ.get()), // m
      shape: new CANNON.Sphere(inRadius.get())
    });


    var velo=speed.get();
    // body.velocity.set(Math.random()*velo,Math.random()*velo,Math.random()*velo);
    body.velocity.set(
        dirX.get()*velo,
        dirY.get()*velo,
        dirZ.get()*velo);

    bodies.push(body);
    world.addBody(body);

    body.addEventListener("collide",function(e){
        // collided=true;
        // collision.trigger();
        // console.log("The sphere just collided with the ground!");
        // console.log("Collided with body:",e.body);
        // console.log("Contact between bodies:",e.contact);
    });

    
}

function setup()
{
    var world=cgl.frameStore.world;
    if(!world)return;
    
    // if(body)world.removeBody(body);

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


    for(var i=0;i<bodies.length;i++)
    {
        var body=bodies[i];
        // if(!body)return; 
    
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
        mat4.mul(cgl.mvMatrix,trMat,cgl.mvMatrix);
    
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

}