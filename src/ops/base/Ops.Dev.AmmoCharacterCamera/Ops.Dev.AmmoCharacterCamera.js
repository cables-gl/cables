const
    render = op.inTrigger("render"),
    enablePointerLock = op.inBool("Enable pointer lock", true),
    trigger = op.outTrigger("trigger"),
    isLocked = op.outBoolNum("isLocked", false),

    inHeight = op.inFloat("Height", 2),

    // moveSpeed = op.inFloat("Speed", 1),
    inName = op.inString("Character Name", "player1"),
    mouseSpeed = op.inFloat("Mouse Speed", 1),
    // fly = op.inValueBool("Allow Flying", true),
    inActive = op.inBool("Active", true),

    // inMoveXPos = op.inBool("Move X+"),
    // inMoveXNeg = op.inBool("Move X-"),
    // inMoveYPos = op.inBool("Move Y+"),
    // inMoveYNeg = op.inBool("Move Y-"),

    inReset = op.inTriggerButton("Reset"),

    // outPosX = op.outValue("posX"),
    // outPosY = op.outValue("posY"),
    // outPosZ = op.outValue("posZ"),

    outMouseDown = op.outTrigger("Mouse Left"),
    outMouseDownRight = op.outTrigger("Mouse Right"),
    outDirX = op.outValue("Dir X"),
    outDirY = op.outValue("Dir Y"),
    outDirZ = op.outValue("Dir Z"),
    outRotX = op.outNumber("Rot X"),
    outRotY = op.outNumber("Rot Y");
const vPos = vec3.create();
let speedx = 0, speedy = 0, speedz = 0;
const movementSpeedFactor = 0.5;

// op.setPortGroup("Move", [inMoveYNeg, inMoveYPos, inMoveXNeg,]);

let mouseNoPL = { "firstMove": true,
    "deltaX": 0,
    "deltaY": 0,
};

const DEG2RAD = 3.14159 / 180.0;

let rotX = 0;
let rotY = 0;

// let posX = 0;
// let posY = 0;
// let posZ = 0;

// let pressedW = false;
// let pressedA = false;
// let pressedS = false;
// let pressedD = false;

const cgl = op.patch.cgl;

const viewMatrix = mat4.create();

op.toWorkPortsNeedToBeLinked(render);
let lastMove = 0;

initListener();

enablePointerLock.onChange = initListener;

inReset.onTriggered = () =>
{
    // rotX = 0;
    // rotY = 0;
    // posX = 0;
    // posY = 0;
    // posZ = 0;
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

let tmpTrans = null;

render.onTriggered = function ()
{
    if (!Ammo) return;
    if (!inActive.get()) return trigger.trigger();
    if (!tmpTrans)
    {
        tmpTrans = new Ammo.btTransform();
    }

    if (cgl.frameStore.shadowPass) return trigger.trigger();

    calcCameraMovement();

    if (speedx !== 0.0 || speedy !== 0.0 || speedz !== 0)
    {
    }

    cgl.pushViewMatrix();

    const ammoWorld = cgl.frameStore.ammoWorld;

    if (!ammoWorld)
    {
        console.log("char no ammoworld");
        return;
    }

    // vec3.set(vPos, -posX, -posY, -posZ);
    const body = ammoWorld.getBodyByName(inName.get());

    if (body)
    {
        let ms = body.getMotionState();
        ms.getWorldTransform(tmpTrans);
        let p = tmpTrans.getOrigin();
        vec3.set(vPos, -p.x(), -p.y() - inHeight.get(), -p.z());
    }
    else
    {
        console.log("char body not found!");
    }

    mat4.identity(cgl.vMatrix);

    mat4.rotateX(cgl.vMatrix, cgl.vMatrix, DEG2RAD * rotX);
    mat4.rotateY(cgl.vMatrix, cgl.vMatrix, DEG2RAD * rotY);

    mat4.translate(cgl.vMatrix, cgl.vMatrix, vPos);

    trigger.trigger();
    cgl.popViewMatrix();

    outRotX.set(rotX);
    outRotY.set(rotY);

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

    // if (pressedW)
    // {
    //     // Control X-Axis movement
    //     pitchFactor = Math.cos(DEG2RAD * rotX);

    //     camMovementXComponent += (movementSpeedFactor * (Math.sin(DEG2RAD * rotY))) * pitchFactor;

    //     // Control Y-Axis movement
    //     camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD * rotX)) * -1.0;

    //     // Control Z-Axis movement
    //     yawFactor = (Math.cos(DEG2RAD * rotX));
    //     camMovementZComponent += (movementSpeedFactor * (Math.cos(DEG2RAD * rotY)) * -1.0) * yawFactor;
    // }

    // if (pressedS)
    // {
    //     // Control X-Axis movement
    //     pitchFactor = Math.cos(DEG2RAD * rotX);
    //     camMovementXComponent += (movementSpeedFactor * (Math.sin(DEG2RAD * rotY)) * -1.0) * pitchFactor;

    //     // Control Y-Axis movement
    //     camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD * rotX));

    //     // Control Z-Axis movement
    //     yawFactor = (Math.cos(DEG2RAD * rotX));
    //     camMovementZComponent += (movementSpeedFactor * (Math.cos(DEG2RAD * rotY))) * yawFactor;
    // }

    let yRotRad = DEG2RAD * rotY;

    // if (pressedA)
    // {
    //     // Calculate our Y-Axis rotation in radians once here because we use it twice

    //     camMovementXComponent += -movementSpeedFactor * (Math.cos(yRotRad));
    //     camMovementZComponent += -movementSpeedFactor * (Math.sin(yRotRad));
    // }

    // if (pressedD)
    // {
    //     // Calculate our Y-Axis rotation in radians once here because we use it twice

    //     camMovementXComponent += movementSpeedFactor * (Math.cos(yRotRad));
    //     camMovementZComponent += movementSpeedFactor * (Math.sin(yRotRad));
    // }

    const mulSpeed = 0.016;

    // speedx = camMovementXComponent * mulSpeed;
    // speedy = camMovementYComponent * mulSpeed;
    // speedz = camMovementZComponent * mulSpeed;

    // if (speedx > movementSpeedFactor) speedx = movementSpeedFactor;
    // if (speedx < -movementSpeedFactor) speedx = -movementSpeedFactor;

    // if (speedy > movementSpeedFactor) speedy = movementSpeedFactor;
    // if (speedy < -movementSpeedFactor) speedy = -movementSpeedFactor;

    // if (speedz > movementSpeedFactor) speedz = movementSpeedFactor;
    // if (speedz < -movementSpeedFactor) speedz = -movementSpeedFactor;
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
        document.addEventListener("pointerdown", mouseDown, false);
        document.addEventListener("pointermove", moveCallback, false);
        isLocked.set(true);
    }
    else
    {
        document.removeEventListener("pointerdown", mouseDown, false);
        document.removeEventListener("pointermove", moveCallback, false);
        isLocked.set(false);
    }
}

function startPointerLock(e)
{
    const test = false;

    if (render.isLinked() && enablePointerLock.get() && e.buttons == 1)
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

    document.removeEventListener("pointerlockchange", lockChangeCallback, false);
    document.removeEventListener("mozpointerlockchange", lockChangeCallback, false);
    document.removeEventListener("webkitpointerlockchange", lockChangeCallback, false);
    document.getElementById("glcanvas").removeEventListener("mousedown", startPointerLock);
}

function initListener()
{
    if (enablePointerLock.get())
    {
        document.addEventListener("pointerlockchange", lockChangeCallback, false);
        document.addEventListener("mozpointerlockchange", lockChangeCallback, false);
        document.addEventListener("webkitpointerlockchange", lockChangeCallback, false);
        document.getElementById("glcanvas").addEventListener("mousedown", startPointerLock);

        cgl.canvas.removeEventListener("pointermove", moveCallbackNoPL, false);
        cgl.canvas.removeEventListener("pointerup", upCallbackNoPL, false);
    }
    else
    {
        cgl.canvas.addEventListener("pointermove", moveCallbackNoPL, false);
        cgl.canvas.addEventListener("pointerup", upCallbackNoPL, false);
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
