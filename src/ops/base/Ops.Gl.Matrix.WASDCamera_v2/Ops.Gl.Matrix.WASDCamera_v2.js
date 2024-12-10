const
    render = op.inTrigger("render"),
    enablePointerLock = op.inBool("Enable pointer lock", true),
    trigger = op.outTrigger("trigger"),
    isLocked = op.outBoolNum("isLocked", false),

    moveSpeed = op.inFloat("Speed", 1),
    mouseSpeed = op.inFloat("Mouse Speed", 1),
    fly = op.inValueBool("Allow Flying", true),
    inActive = op.inBool("Active", true),

    inMoveXPos = op.inBool("Move X+"),
    inMoveXNeg = op.inBool("Move X-"),
    inMoveYPos = op.inBool("Move Y+"),
    inMoveYNeg = op.inBool("Move Y-"),

    inReset = op.inTriggerButton("Reset"),

    outPosX = op.outNumber("posX"),
    outPosY = op.outNumber("posY"),
    outPosZ = op.outNumber("posZ"),

    outMouseDown = op.outTrigger("Mouse Left"),
    outMouseDownRight = op.outTrigger("Mouse Right"),

    outDirX = op.outNumber("Dir X"),
    outDirY = op.outNumber("Dir Y"),
    outDirZ = op.outNumber("Dir Z");

const vPos = vec3.create();
let speedx = 0, speedy = 0, speedz = 0;
const movementSpeedFactor = 0.5;

op.setPortGroup("Move", [inMoveYNeg, inMoveYPos, inMoveXNeg, inMoveXPos]);

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

const cgl = op.patch.cgl;

const viewMatrix = mat4.create();

op.toWorkPortsNeedToBeLinked(render);
let lastMove = 0;

initListener();

enablePointerLock.onChange = initListener;

inReset.onTriggered = () =>
{
    rotX = 0;
    rotY = 0;
    posX = 0;
    posY = 0;
    posZ = 0;
};

inActive.onChange = () =>
{
    document.exitPointerLock();
    removeListener();

    lockChangeCallback();

    if (inActive.get())
    {
        initListener();
    }
};

render.onTriggered = function ()
{
    if (cgl.tempData.shadowPass) return trigger.trigger();

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

const canvas = op.patch.cgl.canvas;

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
        document.addEventListener("pointerdown", mouseDown, false);
        document.addEventListener("pointermove", moveCallback, false);
        document.addEventListener("keydown", keyDown, false);
        document.addEventListener("keyup", keyUp, false);
        isLocked.set(true);
    }
    else
    {
        document.removeEventListener("pointerdown", mouseDown, false);
        document.removeEventListener("pointermove", moveCallback, false);
        document.removeEventListener("keydown", keyDown, false);
        document.removeEventListener("keyup", keyUp, false);
        isLocked.set(false);
        pressedW = false;
        pressedA = false;
        pressedS = false;
        pressedD = false;
    }
}

function startPointerLock()
{
    const test = false;
    if (render.isLinked() && enablePointerLock.get())
    {
        document.addEventListener("pointermove", moveCallback, false);
        canvas.requestPointerLock = canvas.requestPointerLock ||
                                    canvas.mozRequestPointerLock ||
                                    canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
    }
}

function removeListener()
{
    cgl.canvas.removeEventListener("pointermove", moveCallbackNoPL, false);
    cgl.canvas.removeEventListener("pointerup", upCallbackNoPL, false);
    cgl.canvas.removeEventListener("keydown", keyDown, false);
    cgl.canvas.removeEventListener("keyup", keyUp, false);

    document.removeEventListener("pointerlockchange", lockChangeCallback, false);
    document.removeEventListener("mozpointerlockchange", lockChangeCallback, false);
    document.removeEventListener("webkitpointerlockchange", lockChangeCallback, false);
    op.patch.cgl.canvas.removeEventListener("mousedown", startPointerLock);
}

function initListener()
{
    if (enablePointerLock.get())
    {
        document.addEventListener("pointerlockchange", lockChangeCallback, false);
        document.addEventListener("mozpointerlockchange", lockChangeCallback, false);
        document.addEventListener("webkitpointerlockchange", lockChangeCallback, false);
        op.patch.cgl.canvas.addEventListener("mousedown", startPointerLock);

        cgl.canvas.removeEventListener("pointermove", moveCallbackNoPL, false);
        cgl.canvas.removeEventListener("pointerup", upCallbackNoPL, false);
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
}

function keyUp(e)
{
    switch (e.which)
    {
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
}

inMoveXPos.onChange = () => { pressedD = inMoveXPos.get(); };
inMoveXNeg.onChange = () => { pressedA = inMoveXNeg.get(); };
inMoveYPos.onChange = () => { pressedW = inMoveYPos.get(); };
inMoveYNeg.onChange = () => { pressedS = inMoveYNeg.get(); };
