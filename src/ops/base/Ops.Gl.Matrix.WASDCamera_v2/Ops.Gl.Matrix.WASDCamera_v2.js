const
    render = op.inTrigger("render"),

    enablePointerLock = op.inBool("Enable pointer lock", true),
    enableTouchScreenMove = op.inBool("Enable TouchScreen move", false),

    moveSpeed = op.inFloat("Speed", 1),
    mouseSpeed = op.inFloat("Mouse Speed", 1),
    touchSpeed = op.inFloat("Touch Speed", 1),

    fly = op.inValueBool("Allow Flying", true),
    arrows = op.inValueBool("Enable Arrow Keys", true);


const
    trigger = op.outTrigger("trigger"),

    isLocked = op.outValue("isLocked", false),
    isMoving = op.outValue("isMoving", false),

    outPosX = op.outValue("posX"),
    outPosY = op.outValue("posY"),
    outPosZ = op.outValue("posZ"),

    outMouseDown = op.outTrigger("Mouse Left"),
    outMouseDownRight = op.outTrigger("Mouse Right"),

    outDirX = op.outValue("Dir X"),
    outDirY = op.outValue("Dir Y"),
    outDirZ = op.outValue("Dir Z");

const vPos = vec3.create();
let speedx = 0, speedy = 0, speedz = 0;
const movementSpeedFactor = 0.5;


let mouseNoPL = { "firstMove": true,
    "deltaX": 0,
    "deltaY": 0,
};

const DEG2RAD = 3.14159 / 180.0;

let rotX = 0;
let rotY = 0;

let posX = 0;
let posY = 0;
let posZ = 0;

let pressedW = false;
let pressedA = false;
let pressedS = false;
let pressedD = false;

const touchScreenMove = {
    started: false,
    touchStartX: 0,
    touchStartY: 0,
    currentX: 0,
    currentY: 0,
};

const cgl = op.patch.cgl;

const viewMatrix = mat4.create();

op.toWorkPortsNeedToBeLinked(render);
let lastMove = 0;

initListener();
initTouchScreenMove();

enablePointerLock.onChange = initListener;
enableTouchScreenMove.onChange = initTouchScreenMove;

render.onTriggered = function ()
{
    if (cgl.frameStore.shadowPass) return trigger.trigger();

    calcCameraMovement();
    move();

    if (!fly.get())posY = 0.0;

    if (speedx !== 0.0 || speedy !== 0.0 || speedz !== 0)
    {
        outPosX.set(posX);
        outPosY.set(posY);
        outPosZ.set(posZ);
    }

    cgl.pushViewMatrix();

    vec3.set(vPos, -posX, -posY, -posZ);

    mat4.identity(cgl.vMatrix);

    mat4.rotateX(cgl.vMatrix, cgl.vMatrix, DEG2RAD * rotX);
    mat4.rotateY(cgl.vMatrix, cgl.vMatrix, DEG2RAD * rotY);

    mat4.translate(cgl.vMatrix, cgl.vMatrix, vPos);

    trigger.trigger();
    cgl.popViewMatrix();

    // for dir vec
    mat4.identity(viewMatrix);
    mat4.rotateX(viewMatrix, viewMatrix, DEG2RAD * rotX);
    mat4.rotateY(viewMatrix, viewMatrix, DEG2RAD * rotY);
    mat4.transpose(viewMatrix, viewMatrix);

    const dir = vec4.create();
    vec4.transformMat4(dir, [0, 0, 1, 1], viewMatrix);

    vec4.normalize(dir, dir);
    outDirX.set(-dir[0]);
    outDirY.set(-dir[1]);
    outDirZ.set(-dir[2]);
};

//--------------

function calcCameraMovement()
{
    let camMovementXComponent = 0.0,
        camMovementYComponent = 0.0,
        camMovementZComponent = 0.0,
        pitchFactor = 0,
        yawFactor = 0;

    if (pressedW)
    {
        // Control X-Axis movement
        pitchFactor = Math.cos(DEG2RAD * rotX);

        camMovementXComponent += (movementSpeedFactor * (Math.sin(DEG2RAD * rotY))) * pitchFactor;

        // Control Y-Axis movement
        camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD * rotX)) * -1.0;

        // Control Z-Axis movement
        yawFactor = (Math.cos(DEG2RAD * rotX));
        camMovementZComponent += (movementSpeedFactor * (Math.cos(DEG2RAD * rotY)) * -1.0) * yawFactor;
    }

    if (pressedS)
    {
        // Control X-Axis movement
        pitchFactor = Math.cos(DEG2RAD * rotX);
        camMovementXComponent += (movementSpeedFactor * (Math.sin(DEG2RAD * rotY)) * -1.0) * pitchFactor;

        // Control Y-Axis movement
        camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD * rotX));

        // Control Z-Axis movement
        yawFactor = (Math.cos(DEG2RAD * rotX));
        camMovementZComponent += (movementSpeedFactor * (Math.cos(DEG2RAD * rotY))) * yawFactor;
    }

    let yRotRad = DEG2RAD * rotY;

    if (pressedA)
    {
        // Calculate our Y-Axis rotation in radians once here because we use it twice

        camMovementXComponent += -movementSpeedFactor * (Math.cos(yRotRad));
        camMovementZComponent += -movementSpeedFactor * (Math.sin(yRotRad));
    }

    if (pressedD)
    {
        // Calculate our Y-Axis rotation in radians once here because we use it twice

        camMovementXComponent += movementSpeedFactor * (Math.cos(yRotRad));
        camMovementZComponent += movementSpeedFactor * (Math.sin(yRotRad));
    }

    const mulSpeed = 0.016;

    speedx = camMovementXComponent * mulSpeed;
    speedy = camMovementYComponent * mulSpeed;
    speedz = camMovementZComponent * mulSpeed;

    if (speedx > movementSpeedFactor) speedx = movementSpeedFactor;
    if (speedx < -movementSpeedFactor) speedx = -movementSpeedFactor;

    if (speedy > movementSpeedFactor) speedy = movementSpeedFactor;
    if (speedy < -movementSpeedFactor) speedy = -movementSpeedFactor;

    if (speedz > movementSpeedFactor) speedz = movementSpeedFactor;
    if (speedz < -movementSpeedFactor) speedz = -movementSpeedFactor;
}

function moveCallback(e)
{
    const mouseSensitivity = 0.1;
    rotX += e.movementY * mouseSensitivity * mouseSpeed.get();
    rotY += e.movementX * mouseSensitivity * mouseSpeed.get();

    if (rotX < -90.0) rotX = -90.0;
    if (rotX > 90.0) rotX = 90.0;
    if (rotY < -180.0) rotY += 360.0;
    if (rotY > 180.0) rotY -= 360.0;
}

const canvas = document.getElementById("glcanvas");

function mouseDown(e)
{
    if (e.which == 3) outMouseDownRight.trigger();
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
        pressedW = false;
        pressedA = false;
        pressedS = false;
        pressedD = false;
    }
}

function calculateTouchMove() {
    const width = cgl.canvas.width;
    const height = cgl.canvas.height;

    const dx = touchScreenMove.touchStartX - touchScreenMove.currentX;
    const dy = touchScreenMove.touchStartY - touchScreenMove.currentY;

    const px = (-dx/width) * touchSpeed.get() * 40;
    const py = (dy/-height) * touchSpeed.get() * 20;

    moveCallback({movementX: px, movementY: py});

    if(touchScreenMove.started)
        requestAnimationFrame(calculateTouchMove)
}

function startPointerLock()
{
    const test = false;
    if (render.isLinked() && enablePointerLock.get())
    {
        canvas.requestPointerLock = canvas.requestPointerLock ||
                                    canvas.mozRequestPointerLock ||
                                    canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
    }
}

function initTouchScreenMove()
{
    if (enableTouchScreenMove.get()) {
        document.addEventListener("touchstart", touchStart, false);
        document.addEventListener("touchend", touchEnd, false);
        document.addEventListener("touchmove", touchMove, false);
    } else {
        document.removeEventListener("touchstart", touchStart, false);
        document.removeEventListener("touchend", touchEnd, false);
        document.removeEventListener("touchmove", touchMove, false);
    }
}

function touchStart(e)
{
    touchScreenMove.touchStartX = e.touches[0].screenX;
    touchScreenMove.touchStartY = e.touches[0].screenY;
    touchScreenMove.currentX = e.touches[0].screenX;
    touchScreenMove.currentY = e.touches[0].screenY;
    touchScreenMove.started = true;
    pressedW = true;

    calculateTouchMove();
}
function touchEnd(e)
{
    touchScreenMove.started = false;
    pressedW = false;
}
function touchMove(e)
{
    touchScreenMove.currentX = e.touches[0].screenX;
    touchScreenMove.currentY = e.touches[0].screenY;
}

function initListener()
{
    if (enablePointerLock.get())
    {
        document.addEventListener("pointerlockchange", lockChangeCallback, false);
        document.addEventListener("mozpointerlockchange", lockChangeCallback, false);
        document.addEventListener("webkitpointerlockchange", lockChangeCallback, false);
        document.getElementById("glcanvas").addEventListener("mousedown", startPointerLock);

        cgl.canvas.removeEventListener("mousemove", moveCallbackNoPL, false);
        cgl.canvas.removeEventListener("mouseup", upCallbackNoPL, false);
        cgl.canvas.removeEventListener("keydown", keyDown, false);
        cgl.canvas.removeEventListener("keyup", keyUp, false);
    }
    else
    {
        cgl.canvas.addEventListener("pointermove", moveCallbackNoPL, false);
        cgl.canvas.addEventListener("pointerup", upCallbackNoPL, false);
        cgl.canvas.addEventListener("keydown", keyDown, false);
        cgl.canvas.addEventListener("keyup", keyUp, false);
    }
}

function upCallbackNoPL(e)
{
    try { cgl.canvas.releasePointerCapture(e.pointerId); }
    catch (e) {}
    mouseNoPL.firstMove = true;
}

function moveCallbackNoPL(e)
{
    if (e && e.buttons == 1)
    {
        try { cgl.canvas.setPointerCapture(e.pointerId); }
        catch (_e) {}

        if (!mouseNoPL.firstMove)
        {
            // outDragging.set(true);
            const deltaX = (e.clientX - mouseNoPL.lastX) * mouseSpeed.get() * 0.5;
            const deltaY = (e.clientY - mouseNoPL.lastY) * mouseSpeed.get() * 0.5;

            rotX += deltaY;
            rotY += deltaX;
            // outDeltaX.set(deltaX);
            // outDeltaY.set(deltaY);
        }

        mouseNoPL.firstMove = false;

        mouseNoPL.lastX = e.clientX;
        mouseNoPL.lastY = e.clientY;
    }
}

function move()
{
    let timeOffset = window.performance.now() - lastMove;
    timeOffset *= moveSpeed.get();
    posX += speedx * timeOffset;
    posY += speedy * timeOffset;
    posZ += speedz * timeOffset;

    lastMove = window.performance.now();
}

function keyDown(e)
{
    switch (e.which)
    {
    case 38:
        pressedW = arrows.get() || pressedW;
        break;
    case 37:
        pressedA = arrows.get() || pressedA;
        break;
    case 40:
        pressedS = arrows.get() || pressedS;
        break;
    case 39:
        pressedD = arrows.get() || pressedD;
        break;
    case 87:
        pressedW = true;
        break;
    case 65:
        pressedA = true;
        break;
    case 83:
        pressedS = true;
        break;
    case 68:
        pressedD = true;
        break;

    default:
        break;
    }

    isMoving.set(pressedW || pressedA || pressedS || pressedD);
}

function keyUp(e)
{
    switch (e.which)
    {
    case 38:
        pressedW = arrows.get() ? false : pressedW;
        break;
    case 37:
        pressedA = arrows.get() ? false : pressedA;
        break;
    case 40:
        pressedS = arrows.get() ? false : pressedS;
        break;
    case 39:
        pressedD = arrows.get() ? false : pressedD;
        break;
    case 87:
        pressedW = false;
        break;
    case 65:
        pressedA = false;
        break;
    case 83:
        pressedS = false;
        break;
    case 68:
        pressedD = false;
        break;
    }

    isMoving.set(pressedW || pressedA || pressedS || pressedD);
}

