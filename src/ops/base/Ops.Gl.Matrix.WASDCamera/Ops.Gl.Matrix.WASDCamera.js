op.name='WASDCamera';


var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var isLocked=op.outValue("isLocked",false);

var vPos=vec3.create();
var speedx=0,speedy=0,speedz=0;
var movementSpeedFactor = 0.5;

var posX=op.addInPort(new Port(op,"posX",CABLES.OP_PORT_TYPE_VALUE));
var posY=op.addInPort(new Port(op,"posY",CABLES.OP_PORT_TYPE_VALUE));
var posZ=op.addInPort(new Port(op,"posZ",CABLES.OP_PORT_TYPE_VALUE));

var rotX=op.addInPort(new Port(op,"rotX",CABLES.OP_PORT_TYPE_VALUE));
var rotY=op.addInPort(new Port(op,"rotY",CABLES.OP_PORT_TYPE_VALUE));

var outPosX=op.addOutPort(new Port(op,"posX",CABLES.OP_PORT_TYPE_VALUE));
var outPosY=op.addOutPort(new Port(op,"posY",CABLES.OP_PORT_TYPE_VALUE));
var outPosZ=op.addOutPort(new Port(op,"posZ",CABLES.OP_PORT_TYPE_VALUE));
outPosX.set(-posX.get());
outPosY.set(-posY.get());
outPosZ.set(-posZ.get());


var cgl=op.patch.cgl;
var DEG2RAD=3.14159/180.0;
var viewMatrix = mat4.create();


render.onTriggered=function()
{
    calcCameraMovement();
    move();

    if(speedx!==0.0 || speedy!==0.0 || speedz!==0)
    {
        outPosX.set(-posX.get());
        outPosY.set(-posY.get());
        outPosZ.set(-posZ.get());
    }

    cgl.pushViewMatrix();

    vec3.set(vPos, -posX.get(),-posY.get(),-posZ.get());

    mat4.rotateX( cgl.vMatrix ,cgl.vMatrix,DEG2RAD*rotX.get());
    mat4.rotateY( cgl.vMatrix ,cgl.vMatrix,DEG2RAD*rotY.get());
    mat4.translate( cgl.vMatrix ,cgl.vMatrix,vPos);

    trigger.trigger();
    cgl.popViewMatrix();
};

//--------------

function calcCameraMovement()
{
    var camMovementXComponent = 0.0,
        camMovementYComponent = 0.0,
        camMovementZComponent = 0.0,
        pitchFactor=0,
        yawFactor=0;

    if (pressedW)
    {
        // Control X-Axis movement
        pitchFactor = Math.cos(DEG2RAD*rotX.get());
                
        camMovementXComponent += ( movementSpeedFactor * (Math.sin(DEG2RAD*rotY.get())) ) * pitchFactor;

        // Control Y-Axis movement
        camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD*rotX.get())) * -1.0;

        // Control Z-Axis movement
        yawFactor = (Math.cos(DEG2RAD*rotX.get()));
        camMovementZComponent += ( movementSpeedFactor * (Math.cos(DEG2RAD*rotY.get())) * -1.0 ) * yawFactor;
    }

    if (pressedS)
    {
        // Control X-Axis movement
        pitchFactor = Math.cos(DEG2RAD*rotX.get());
        camMovementXComponent += ( movementSpeedFactor * (Math.sin(DEG2RAD*rotY.get())) * -1.0) * pitchFactor;

        // Control Y-Axis movement
        camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD*rotX.get()));

        // Control Z-Axis movement
        yawFactor = (Math.cos(DEG2RAD*rotX.get()));
        camMovementZComponent += ( movementSpeedFactor * (Math.cos(DEG2RAD*rotY.get())) ) * yawFactor;
    }

    if (pressedA)
    {
        // Calculate our Y-Axis rotation in radians once here because we use it twice
        var yRotRad = DEG2RAD*rotY.get();

        camMovementXComponent += -movementSpeedFactor * (Math.cos(yRotRad));
        camMovementZComponent += -movementSpeedFactor * (Math.sin(yRotRad));
    }

    if (pressedD)
    {
        // Calculate our Y-Axis rotation in radians once here because we use it twice
        var yRotRad = DEG2RAD*rotY.get();

        camMovementXComponent += movementSpeedFactor * (Math.cos(yRotRad));
        camMovementZComponent += movementSpeedFactor * (Math.sin(yRotRad));
    }

    speedx = camMovementXComponent;
    speedy = camMovementYComponent;
    speedz = camMovementZComponent;

    if (speedx > movementSpeedFactor) speedx = movementSpeedFactor;
    if (speedx < -movementSpeedFactor) speedx = -movementSpeedFactor;

    if (speedy > movementSpeedFactor) speedy = movementSpeedFactor;
    if (speedy < -movementSpeedFactor) speedy = -movementSpeedFactor;

    if (speedz > movementSpeedFactor) speedz = movementSpeedFactor;
    if (speedz < -movementSpeedFactor) speedz = -movementSpeedFactor;
}

function moveCallback(e)
{
    var mouseSensitivity=0.1;
    rotX.val+=e.movementY*mouseSensitivity;
    rotY.val+=e.movementX*mouseSensitivity;

    if (rotX.get() < -90.0) rotX.set( -90.0);
    if (rotX.get() > 90.0) rotX.set(90.0);
    if (rotY.get() < -180.0) rotY.set( rotY.get()+ 360.0);
    if (rotY.get() > 180.0) rotY.set( rotY.get() - 360.0);
}

var canvas = document.getElementById("glcanvas");

function lockChangeCallback(e)
{
    if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas)
    {
        document.addEventListener("mousemove", moveCallback, false);
        document.addEventListener("keydown", keyDown, false);
        document.addEventListener("keyup", keyUp, false);
        isLocked.set(true);

    }
    else
    {
        document.removeEventListener("mousemove", moveCallback, false);
        document.removeEventListener("keydown", keyDown, false);
        document.removeEventListener("keyup", keyUp, false);
        isLocked.set(false);
        pressedW=false;
        pressedA=false;
        pressedS=false;
        pressedD=false;
    }
}
   
document.addEventListener('pointerlockchange', lockChangeCallback, false);
document.addEventListener('mozpointerlockchange', lockChangeCallback, false);
document.addEventListener('webkitpointerlockchange', lockChangeCallback, false);

document.getElementById('glcanvas').addEventListener('mousedown',function()
{
    document.addEventListener("mousemove", moveCallback, false);
    canvas.requestPointerLock = canvas.requestPointerLock ||
                                canvas.mozRequestPointerLock ||
                                canvas.webkitRequestPointerLock;
    canvas.requestPointerLock();

});

var lastMove=0;
function move()
{
    var timeOffset = window.performance.now()-lastMove;

    posX.set(posX.get()+speedx);
    posY.set(posY.get()+speedy);
    posZ.set(posZ.get()+speedz);

    lastMove = window.performance.now();
}

var pressedW=false;
var pressedA=false;
var pressedS=false;
var pressedD=false;

function keyDown(e)
{
    switch(e.which)
    {
        case 87:
            pressedW=true;
        break;
        case 65:
            pressedA=true;
        break;
        case 83:
            pressedS=true;
        break;
        case 68:
            pressedD=true;
        break;

        default:

        break;
    }
}

function keyUp(e)
{
    switch(e.which)
    {
        case 87:
            pressedW=false;
        break;
        case 65:
            pressedA=false;
        break;
        case 83:
            pressedS=false;
        break;
        case 68:
            pressedD=false;
        break;
    }
}

