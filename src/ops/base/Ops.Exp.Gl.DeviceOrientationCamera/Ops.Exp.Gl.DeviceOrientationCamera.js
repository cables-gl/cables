const
    render=op.inTrigger("Render"),
    next=op.outTrigger("Next"),
    winOrient=op.outValue("Window Orientation"),
    cgl=op.patch.cgl,
    vCenter=vec3.create(),
    transMatrix = mat4.create(),
    displayOrientQuat=quat.create(),
    displayOrientMatrix=mat4.create();

window.addEventListener("deviceorientation", onOrientationChange,true);
var tempQuat=quat.create();
mat4.identity(transMatrix);

var viewDirQuat=quat.create();

render.onTriggered=function()
{
    //check for new permission request on IOS or android
    if(DeviceMotionEvent && DeviceMotionEvent.requestPermission)
    {
        DeviceOrientationEvent.requestPermission()
            .then(response =>
            {
                if (response == 'granted')
                {

                    window.addEventListener("deviceorientation", onOrientationChange, true);
                }
            })
            .catch(console.error);
    }
    else
    {
        window.addEventListener("deviceorientation", onOrientationChange, true);
    }

    if(window.orientation===undefined)
    {
        next.trigger();
        return;
    }

    cgl.pushViewMatrix();

    tempQuat=quat.clone(viewDirQuat);
    quat.invert(tempQuat,tempQuat);

    if(window.orientation==90 ||window.orientation==-90)
    {
        quat.setAxisAngle(displayOrientQuat,[0,0,1],window.orientation*CGL.DEG2RAD);
        quat.multiply(tempQuat,displayOrientQuat,tempQuat);
    }

    mat4.fromQuat(transMatrix,tempQuat);
    //added rotateX by 90 as orientation was incorrect
    mat4.rotateX(transMatrix,transMatrix, 90.0*CGL.DEG2RAD);
    mat4.rotateY(transMatrix,transMatrix, 90.0*CGL.DEG2RAD);
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);

    //mat4.translate(cgl.vMatrix,cgl.vMatrix,[1,0,0]);//original code

    next.trigger();
    cgl.popViewMatrix();
};

// frp, http://asterixcreative.com/blog/mobile-gyroscope-with-javascript-and-quaternions-programming-tutorial-part-1/
function quatFromEuler(quat,alpha,beta,gamma)
{
	var x = CGL.DEG2RAD*beta;
	var y = CGL.DEG2RAD*gamma;
	var z = CGL.DEG2RAD*alpha;

	var cX = Math.cos( x/2 );
	var cY = Math.cos( y/2 );
	var cZ = Math.cos( z/2 );
	var sX = Math.sin( x/2 );
	var sY = Math.sin( y/2 );
	var sZ = Math.sin( z/2 );

	quat[0] = sX * cY * cZ - cX * sY * sZ;
	quat[1] = cX * sY * cZ + sX * cY * sZ;
	quat[2] = cX * cY * sZ + sX * sY * cZ;
	quat[3] = cX * cY * cZ - sX * sY * sZ;

	return quat;
};

function onOrientationChange(event)
{
    var alpha = (event.alpha || 0);
    var beta  = (event.beta || 0 );
    var gamma = (event.gamma || 0);

    winOrient.set( window.orientation||0 );
    quatFromEuler(viewDirQuat,alpha,beta,gamma);
};
