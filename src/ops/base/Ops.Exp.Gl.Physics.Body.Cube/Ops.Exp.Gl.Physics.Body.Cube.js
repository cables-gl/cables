var exec=op.inFunction("Exec");
var inMass=op.inValue("Mass");

var doRender=op.inValueBool("Render",true);


var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var sizeX=op.inValue("sizeX",1);
var sizeY=op.inValue("sizeY",1);
var sizeZ=op.inValue("sizeZ",1);

var inReset=op.inFunctionButton("Reset");


var next=op.outFunction("Next");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

var outCollision=op.outFunction("Collision");

var cgl=op.patch.cgl;
var m=null;

exec.onTriggered=render;

var needSetup=true;
var body=null;

inMass.onChange=setup;
posX.onChange=setup;
posY.onChange=setup;
posZ.onChange=setup;

sizeX.onChange=setup;
sizeY.onChange=setup;
sizeZ.onChange=setup;

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

    body = new CANNON.Body(
        {
            mass: inMass.get(), // kg
        });

    m=new CGL.WireCube(cgl);

    body.addShape( new CANNON.Box(new CANNON.Vec3(sizeX.get(),sizeY.get(),sizeZ.get()) ));
    body.position.set(posX.get(), posY.get(), posZ.get());

    world.addBody(body);

    body.addEventListener("collide",
        function(e)
        {
            collided=true;
        });

    lastWorld=world;
    needSetup=false;
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
    
    mat4.mul(cgl.mvMatrix,trMat,cgl.mvMatrix);
    
    
    if(doRender.get() && m)m.render(cgl,sizeX.get(),sizeY.get(),sizeZ.get());
    
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