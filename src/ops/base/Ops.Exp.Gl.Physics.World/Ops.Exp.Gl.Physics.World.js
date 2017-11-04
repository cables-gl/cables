op.name="World";

var exec=op.inFunction("Exec");

var reset=op.inFunctionButton("Reset");


var next=op.outFunction("next");


var cgl=op.patch.cgl;
var world = null;
cgl.frameStore=cgl.frameStore||{};

reset.onTriggered=function()
{
    world=null;
};


function setup()
{
    console.log("world setup");
    world = new CANNON.World();

    world.gravity.set(0,0,-9.82 ); // m/s²
    
    
    // Create a plane
    var groundBody = new CANNON.Body({
        mass: 0 // mass == 0 makes the body static
    });
    var groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);
    
}






var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 13;
var lastTime;

exec.onTriggered=function()
{
    if(!world)setup();
    cgl.frameStore.world=world;
    
    next.trigger();
        
    var time=Date.now();

    if(lastTime !== undefined)
    {
        var dt = (time - lastTime) / 1000;
        world.step(fixedTimeStep, dt, maxSubSteps);
    }

    lastTime = time;

    
};
