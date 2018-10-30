op.name='WASDCamera';
op.requirements=[CABLES.Requirements.POINTERLOCK];
var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var isLocked=op.outValue("isLocked",false);

var vPos=vec3.create();
var speedx=0,speedy=0,speedz=0;
var movementSpeedFactor = 0.5;

var fly=op.inValueBool("Allow Flying");

var outPosX=op.addOutPort(new CABLES.Port(op,"posX",CABLES.OP_PORT_TYPE_VALUE));
var outPosY=op.addOutPort(new CABLES.Port(op,"posY",CABLES.OP_PORT_TYPE_VALUE));
var outPosZ=op.addOutPort(new CABLES.Port(op,"posZ",CABLES.OP_PORT_TYPE_VALUE));

var outMouseDown=op.outTrigger("Mouse Left");
var outMouseDownRight=op.outTrigger("Mouse Right");

var outDirX=op.outValue("Dir X");
var outDirY=op.outValue("Dir Y");
var outDirZ=op.outValue("Dir Z");


var rotX=0;
var rotY=0;

var posX=0;
var posY=0;
var posZ=0;

var cgl=op.patch.cgl;
var DEG2RAD=3.14159/180.0;
var viewMatrix = mat4.create();





render.onTriggered=function()
{
    calcCameraMovement();
    move();
    
    if(!fly.get())posY=0.0;

    if(speedx!==0.0 || speedy!==0.0 || speedz!==0)
    {
        outPosX.set(posX);
        outPosY.set(posY);
        outPosZ.set(posZ);
    }

    cgl.pushViewMatrix();

    vec3.set(vPos, -posX,-posY,-posZ);

    mat4.rotateX( cgl.vMatrix ,cgl.vMatrix,DEG2RAD*rotX);
    mat4.rotateY( cgl.vMatrix ,cgl.vMatrix,DEG2RAD*rotY);
    
    mat4.translate( cgl.vMatrix ,cgl.vMatrix,vPos);

    trigger.trigger();
    cgl.popViewMatrix();
    
    // for dir vec
    mat4.identity(viewMatrix);
    mat4.rotateX( viewMatrix ,viewMatrix,DEG2RAD*rotX);
    mat4.rotateY( viewMatrix ,viewMatrix,DEG2RAD*rotY);
    mat4.transpose(viewMatrix,viewMatrix);
    
    var dir=vec4.create();
    vec4.transformMat4(dir,[0,0,1,1],viewMatrix);
    
    vec4.normalize(dir,dir);
    outDirX.set(-dir[0]);
    outDirY.set(-dir[1]);
    outDirZ.set(-dir[2]);

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
        pitchFactor = Math.cos(DEG2RAD*rotX);
                
        camMovementXComponent += ( movementSpeedFactor * (Math.sin(DEG2RAD*rotY)) ) * pitchFactor;

        // Control Y-Axis movement
        camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD*rotX)) * -1.0;

        // Control Z-Axis movement
        yawFactor = (Math.cos(DEG2RAD*rotX));
        camMovementZComponent += ( movementSpeedFactor * (Math.cos(DEG2RAD*rotY)) * -1.0 ) * yawFactor;
    }

    if (pressedS)
    {
        // Control X-Axis movement
        pitchFactor = Math.cos(DEG2RAD*rotX);
        camMovementXComponent += ( movementSpeedFactor * (Math.sin(DEG2RAD*rotY)) * -1.0) * pitchFactor;

        // Control Y-Axis movement
        camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD*rotX));

        // Control Z-Axis movement
        yawFactor = (Math.cos(DEG2RAD*rotX));
        camMovementZComponent += ( movementSpeedFactor * (Math.cos(DEG2RAD*rotY)) ) * yawFactor;
    }

    if (pressedA)
    {
        // Calculate our Y-Axis rotation in radians once here because we use it twice
        var yRotRad = DEG2RAD*rotY;

        camMovementXComponent += -movementSpeedFactor * (Math.cos(yRotRad));
        camMovementZComponent += -movementSpeedFactor * (Math.sin(yRotRad));
    }

    if (pressedD)
    {
        // Calculate our Y-Axis rotation in radians once here because we use it twice
        var yRotRad = DEG2RAD*rotY;

        camMovementXComponent += movementSpeedFactor * (Math.cos(yRotRad));
        camMovementZComponent += movementSpeedFactor * (Math.sin(yRotRad));
    }

var mulSpeed=0.5;


    speedx = camMovementXComponent*mulSpeed;
    speedy = camMovementYComponent*mulSpeed;
    speedz = camMovementZComponent*mulSpeed;
    



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
    rotX+=e.movementY*mouseSensitivity;
    rotY+=e.movementX*mouseSensitivity;

    if (rotX < -90.0) rotX= -90.0;
    if (rotX > 90.0) rotX=90.0;
    if (rotY < -180.0) rotY= rotY+ 360.0;
    if (rotY > 180.0) rotY= rotY - 360.0;
}

var canvas = document.getElementById("glcanvas");

function mouseDown(e)
{
    if(e.which==3) outMouseDownRight.trigger();
        else outMouseDown.trigger();
    
}


function lockChangeCallback(e)
{
    if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas)
    {
        document.addEventListener("mousedown", mouseDown, false);
        document.addEventListener("mousemove", moveCallback, false);
        document.addEventListener("keydown", keyDown, false);
        document.addEventListener("keyup", keyUp, false);
        isLocked.set(true);

    }
    else
    {
        document.removeEventListener("mousedown", mouseDown, false);
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

    posX=posX+speedx;
    posY=posY+speedy;
    posZ=posZ+speedz;
    

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

