const
    accX = op.outNumber("Acceleration X"),
    accY = op.outNumber("Acceleration Y"),
    accZ = op.outNumber("Acceleration Z");

let lastTime = 0;
let lastTimeAcc = 0;

let obj = {};

registerEvents();

let lastX = 0;
let lastY = 0;
let lastZ = 0;

function moved(event)
{
    if (CABLES.now() - lastTimeAcc > 30)
    {
        lastTimeAcc = CABLES.now();

        let deltaX = lastX - event.accelerationIncludingGravity.x;
        let deltaY = lastY - event.accelerationIncludingGravity.y;
        let deltaZ = lastZ - event.accelerationIncludingGravity.z;

        accX.set(Math.abs(deltaX));
        accY.set(Math.abs(deltaY));
        accZ.set(Math.abs(deltaZ));

        lastX = event.accelerationIncludingGravity.x;
        lastY = event.accelerationIncludingGravity.y;
        lastZ = event.accelerationIncludingGravity.z;
    }
}

function registerEvents()
{
    window.addEventListener("devicemotion", moved, true);
}

op.onDelete = function ()
{
    window.removeEventListener("devicemotion", moved);
};
