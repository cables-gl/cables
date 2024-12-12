const
    render = op.inTrigger("render"),
    enablePointerLock = op.inBool("Enable pointer lock", true),
    trigger = op.outTrigger("trigger"),
    isLocked = op.outBoolNum("isLocked", false),
    inHeight = op.inFloat("Height", 2),
    inName = op.inString("Character Name", "player1"),
    mouseSpeed = op.inFloat("Mouse Speed", 1),
    inActive = op.inBool("Active", true),
    outMouseDown = op.outTrigger("Mouse Left"),
    outMouseDownRight = op.outTrigger("Mouse Right"),
    outDirX = op.outNumber("Dir X"),
    outDirY = op.outNumber("Dir Y"),
    outDirZ = op.outNumber("Dir Z"),
    outRotX = op.outNumber("Rot X"),
    outRotY = op.outNumber("Rot Y");

op.toWorkPortsNeedToBeLinked(render);

const cgl = op.patch.cgl;
const viewMatrix = mat4.create();
const vPos = vec3.create();
let speedx = 0, speedy = 0, speedz = 0;
const movementSpeedFactor = 0.5;
const canvas = cgl.canvas;
const DEG2RAD = 3.14159 / 180.0;
let rotX = 0;
let rotY = 0;
let lastMove = 0;
let mouseNoPL = { "firstMove": true,
    "deltaX": 0,
    "deltaY": 0,
};

initListener();

enablePointerLock.onChange = initListener;

inActive.onChange = () =>
{
    document.exitPointerLock();
    removeListener();

    lockChangeCallback();

    if (inActive.get()) initListener();
};

let tmpTrans = null;

render.onTriggered = function ()
{
    if (!Ammo) return;
    if (!inActive.get()) return trigger.trigger();
    if (!tmpTrans) tmpTrans = new Ammo.btTransform();

    if (cgl.frameStore.shadowPass) return trigger.trigger();

    cgl.pushViewMatrix();

    const ammoWorld = cgl.frameStore.ammoWorld;

    if (!ammoWorld)
    {
        op.log("char no ammoworld");
        return;
    }

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
        op.log("char body not found!");
    }

    if (rotX < -90)rotX = -90;
    if (rotX > 90)rotX = 90;

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
    cgl.canvas.removeEventListener("mousedown", startPointerLock);
}

function initListener()
{
    if (enablePointerLock.get())
    {
        document.addEventListener("pointerlockchange", lockChangeCallback, false);
        document.addEventListener("mozpointerlockchange", lockChangeCallback, false);
        document.addEventListener("webkitpointerlockchange", lockChangeCallback, false);
        cgl.canvas.addEventListener("mousedown", startPointerLock);

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
            const deltaX = (e.clientX - mouseNoPL.lastX) * mouseSpeed.get() * 0.5;
            const deltaY = (e.clientY - mouseNoPL.lastY) * mouseSpeed.get() * 0.5;

            rotX += deltaY;
            rotY += deltaX;
        }

        mouseNoPL.firstMove = false;
        mouseNoPL.lastX = e.clientX;
        mouseNoPL.lastY = e.clientY;
    }
}
