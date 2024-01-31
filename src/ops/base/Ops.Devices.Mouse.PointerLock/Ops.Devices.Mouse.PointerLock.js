const canvas = op.patch.cgl.canvas;
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;

const
    inRender = op.inTrigger("Render"),
    inStart = op.inTriggerButton("Start"),
    next = op.outTrigger("Next"),
    outSupported = op.outBoolNum("Supported", !!canvas.requestPointerLock),
    isLocked = op.outBoolNum("Is Locked");

inStart.onTriggered = startPointerLock;

op.on("delete", () =>
{
    removeListener();
});

initListener();

function startPointerLock()
{
    const test = false;
    canvas.requestPointerLock();
}

function lockChangeCallback(e)
{
    isLocked.set(document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas);
    op.patch.cgl.emitEvent("pointerLockChange", isLocked.get());
}

function removeListener()
{
    document.removeEventListener("pointerlockchange", lockChangeCallback, false);
    document.removeEventListener("mozpointerlockchange", lockChangeCallback, false);
    document.removeEventListener("webkitpointerlockchange", lockChangeCallback, false);
}

function initListener()
{
    document.addEventListener("pointerlockchange", lockChangeCallback, false);
    document.addEventListener("mozpointerlockchange", lockChangeCallback, false);
    document.addEventListener("webkitpointerlockchange", lockChangeCallback, false);
}

inRender.onTriggered = () =>
{
    next.trigger();
};
