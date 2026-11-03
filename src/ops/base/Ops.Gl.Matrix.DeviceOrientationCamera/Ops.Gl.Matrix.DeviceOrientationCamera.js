const
    render = op.inTrigger("Render"),
    inRequest = op.inTriggerButton("Request Permission"),
    next = op.outTrigger("Next"),
    winOrient = op.outNumber("Window Orientation"),
    cgl = op.patch.cgl,
    vCenter = vec3.create(),
    transMatrix = mat4.create(),
    displayOrientQuat = quat.create(),
    displayOrientMatrix = mat4.create();

let tempQuat = quat.create();
mat4.identity(transMatrix);

const viewDirQuat = quat.create();

// iOS (Safari) only allows requestPermission() inside a user gesture,
// so it must not be called from the render loop
const gestureEvents = ["click", "touchend"];
let requesting = false;

function setError(text, level)
{
    op.setUiError("permission", text, level);
}

function addGestureListeners()
{
    gestureEvents.forEach((name) => { document.addEventListener(name, requestPermission, true); });
}

function removeGestureListeners()
{
    gestureEvents.forEach((name) => { document.removeEventListener(name, requestPermission, true); });
}

// can be triggered from a button op (e.g. a html button), which counts as user gesture on iOS
inRequest.onTriggered = () =>
{
    if (typeof window.DeviceOrientationEvent?.requestPermission === "function") requestPermission();
};

function requestPermission()
{
    if (requesting) return;
    requesting = true;

    Promise.resolve(window.DeviceOrientationEvent.requestPermission())
        .then((response) =>
        {
            if (response == "granted")
            {
                setError(null);
                removeGestureListeners();
                window.addEventListener("deviceorientation", onOrientationChange, true);
            }
            else setError("device orientation permission denied, tap the screen to try again", 1);
        })
        .catch((e) =>
        {
            setError("could not get device orientation permission: " + e.message, 1);
        })
        .finally(() =>
        {
            requesting = false;
        });
}

function init()
{
    if (!window.DeviceOrientationEvent)
    {
        setError("device orientation is not supported by this browser", 1);
    }
    else if (typeof window.DeviceOrientationEvent.requestPermission === "function")
    {
        // iOS: permission can only be requested from a user gesture, not from the render loop
        if (!window.isSecureContext) setError("device orientation needs a secure context (https)", 1);
        else
        {
            setError("tap the screen or trigger \"Request Permission\" to enable device orientation", 0);
            addGestureListeners();
        }
    }
    else
    {
        window.addEventListener("deviceorientation", onOrientationChange, true);
    }
}

init();

op.onDelete = () =>
{
    removeGestureListeners();
    window.removeEventListener("deviceorientation", onOrientationChange, true);
};

render.onTriggered = function ()
{
    if (window.orientation === undefined)
    {
        next.trigger();
        return;
    }

    cgl.pushViewMatrix();

    tempQuat = quat.clone(viewDirQuat);
    quat.invert(tempQuat, tempQuat);

    if (window.orientation == 90 || window.orientation == -90)
    {
        quat.setAxisAngle(displayOrientQuat, [0, 0, 1], window.orientation * CGL.DEG2RAD);
        quat.multiply(tempQuat, displayOrientQuat, tempQuat);
    }

    mat4.fromQuat(transMatrix, tempQuat);
    // added rotateX by 90 as orientation was incorrect
    mat4.rotateX(transMatrix, transMatrix, 90.0 * CGL.DEG2RAD);
    mat4.rotateY(transMatrix, transMatrix, 90.0 * CGL.DEG2RAD);
    mat4.multiply(cgl.vMatrix, cgl.vMatrix, transMatrix);

    // mat4.translate(cgl.vMatrix,cgl.vMatrix,[1,0,0]);//original code

    next.trigger();
    cgl.popViewMatrix();
};

// frp, http://asterixcreative.com/blog/mobile-gyroscope-with-javascript-and-quaternions-programming-tutorial-part-1/
function quatFromEuler(quat, alpha, beta, gamma)
{
    const x = CGL.DEG2RAD * beta;
    const y = CGL.DEG2RAD * gamma;
    const z = CGL.DEG2RAD * alpha;

    const cX = Math.cos(x / 2);
    const cY = Math.cos(y / 2);
    const cZ = Math.cos(z / 2);
    const sX = Math.sin(x / 2);
    const sY = Math.sin(y / 2);
    const sZ = Math.sin(z / 2);

    quat[0] = sX * cY * cZ - cX * sY * sZ;
    quat[1] = cX * sY * cZ + sX * cY * sZ;
    quat[2] = cX * cY * sZ + sX * sY * cZ;
    quat[3] = cX * cY * cZ - sX * sY * sZ;

    return quat;
}

function onOrientationChange(event)
{
    const alpha = (event.alpha || 0);
    const beta = (event.beta || 0);
    const gamma = (event.gamma || 0);

    winOrient.set(window.orientation || 0);
    quatFromEuler(viewDirQuat, alpha, beta, gamma);
}
