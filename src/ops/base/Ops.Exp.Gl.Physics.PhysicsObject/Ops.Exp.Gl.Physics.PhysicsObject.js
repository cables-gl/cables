op.name="PhysicsObject";

var exec=op.inFunction("Exec");

var inMass=op.inValue("Mass");
var inRadius=op.inValue("Radius");

var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");


var next=op.outFunction("Next");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

var outCollision=op.outFunction("Collision");


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

var collided=false;

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

    body.addEventListener("collide",function(e){
        collided=true;
        // collision.trigger();
        console.log("The sphere just collided with the ground!");
        console.log("Collided with body:",e.body);
        console.log("Contact between bodies:",e.contact);
    });


    lastWorld=world;
    needSetup=false;
}

var vec=vec3.create();

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
    
    cgl.pushMvMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
    m.render(cgl,inRadius.get()*2);
    
    cgl.popMvMatrix();


    // console.log(body.position);
    outX.set(body.position.x);
    outY.set(body.position.y);
    outZ.set(body.position.z);
 
     if(collided)
     {
        collided=false;
        outCollision.trigger();
     }
    
    next.trigger();
}