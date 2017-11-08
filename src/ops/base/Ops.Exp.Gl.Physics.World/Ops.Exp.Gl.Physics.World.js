op.name="World";

var exec=op.inFunction("Exec");

var reset=op.inFunctionButton("Reset");

var groundPlane=op.inValueBool("Groundplane",true);


var next=op.outFunction("next");


groundPlane.onChange=setup;

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
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 20;

    world.defaultContactMaterial.contactEquationStiffness = 1e10;
    world.defaultContactMaterial.contactEquationRelaxation = 5;

    // world.gravity.set(0,-9.82,0 ); // m/s²
    world.gravity.set(0,-9.82,0 ); // m/s²
    
    
    if(groundPlane.get())
    {
        // Create a plane
        // var groundBody = new CANNON.Body({
        //     mass: 0 // mass == 0 makes the body static
        // });
        // var groundShape = new CANNON.Plane();
        // groundBody.addShape(groundShape);
        
        // var rot = new CANNON.Vec3(0,0,1);
        // groundBody.quaternion.setFromAxisAngle(rot, Math.PI/2);
        // groundBody.position.set(0,0,0);
        // groundBody.quaternion.copy(ground.quaternion);
        // groundBody.position.copy(ground.position);
        
        // var rotY = new CANNON.Quaternion(0,0,0,1);
        // groundBody.quaternion.setFromAxisAngle(
        //     new CANNON.Vec3(0,0,1), 
        //     Math.PI/2);
        // groundBody.position.set(0,0,0);
        // groundBody.quaternion = rotY;//.mult(groundBody.quaternion);

        var groundBody = new CANNON.Body({ mass: 0 });
        var s=10000;
        groundBody.addShape( new CANNON.Box(new CANNON.Vec3(s,s,s) ));
        groundBody.position.set(0,-s,0);



        world.addBody(groundBody);
    }

}






var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 11;
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
