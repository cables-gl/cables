const
    mulAxis = op.inValue("Mul Orientation", 1),
    req = op.inTrigger("Request Permissions"),
    axis1 = op.outNumber("Orientation Alpha"),
    axis2 = op.outNumber("Orientation Beta"),
    axis3 = op.outNumber("Orientation Gamma"),
    accX = op.outNumber("Acceleration X"),
    accY = op.outNumber("Acceleration Y"),
    accZ = op.outNumber("Acceleration Z"),
    accNoGravX = op.outNumber("Acceleration X no gravity"),
    accNoGravY = op.outNumber("Acceleration Y no gravity"),
    accNoGravZ = op.outNumber("Acceleration Z no gravity"),

    rotRate1 = op.outNumber("Rotation Rate Alpha"),
    rotRate2 = op.outNumber("Rotation Rate Beta"),
    rotRate3 = op.outNumber("Rotation Rate Gamma"),
    outPermissions = op.outString("Permissions", "no"),

    outObj = op.outObject("Object");

let lastTime = 0;
let lastTimeAcc = 0;
let obj = {};

function handleDeviceMotion(event)
{
    if (CABLES.now() - lastTimeAcc > 15)
    {
        lastTimeAcc = CABLES.now();

        accX.set(event.accelerationIncludingGravity.x || 0);
        accY.set(event.accelerationIncludingGravity.y || 0);
        accZ.set(event.accelerationIncludingGravity.z || 0);

        accNoGravX.set(event.acceleration.x || 0);
        accNoGravY.set(event.acceleration.y || 0);
        accNoGravZ.set(event.acceleration.z || 0);

        obj.AccelerationX = accX.get();
        obj.AccelerationY = accY.get();
        obj.AccelerationZ = accZ.get();

        rotRate1.set(event.rotationRate.alpha || 0);
        rotRate2.set(event.rotationRate.beta || 0);
        rotRate3.set(event.rotationRate.gamma || 0);

        outObj.setRef(obj);
    }
}

function handleDeviceOrientation(event)
{
    if (CABLES.now() - lastTime > 15)
    {
        lastTime = CABLES.now();
        axis1.set((event.alpha || 0) * mulAxis.get());
        axis2.set((event.beta || 0) * mulAxis.get());
        axis3.set((event.gamma || 0) * mulAxis.get());

        if (evt.webkitCompassHeading) axis1.set(this.deviceAngleDelta = 360 - evt.webkitCompassHeading);

        obj.OrientationAlpha = axis1.get();
        obj.OrientationBeta = axis2.get();
        obj.OrientationGamma = axis3.get();

        outObj.setRef(obj);
    }
}

req.onTriggered = function ()
{
    outPermissions.set("requested");

    if (window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission)
    {
        window.DeviceMotionEvent.requestPermission()
            .then((response) =>
            {
                outPermissions.set(response);
                if (response == "granted") window.addEventListener("devicemotion", handleDeviceMotion, true);
            })
            .catch((e) =>
            {
                outPermissions.set("error: " + e.message);
                console.error(e);
            });

        window.DeviceOrientationEvent.requestPermission()
            .then((response) =>
            {
                outPermissions.set(response);
                if (response == "granted")
                {
                    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
                }
                // else
                // console.error(response);
            })
            .catch((e) =>
            {
                outPermissions.set("error: " + e.message);
                console.error(e);
            });
    }
    else
    {
        window.addEventListener("devicemotion", handleDeviceMotion, true);
        window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    }
};

if (window.self !== window.top)
{
    // outPermissions.set("iframe");
    op.setUiError("iframe", "MotionSensor does not work in an iframe, open the patch without an iframe to get it to work", 1);
    op.warn("MotionSensor does not work in an iframe, open the patch without an iframe to get it to work");
}
