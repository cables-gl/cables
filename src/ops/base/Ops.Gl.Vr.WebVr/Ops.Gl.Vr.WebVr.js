var inStartVr=op.inTriggerButton("Start VR");

var nextVr=op.outTrigger("VR Mainloop");
var outSupported=op.outValue("Supported");
var outDisplayName=op.outValue("VR Display");
var outFps=op.outValue("FPS");

var cgl=op.patch.cgl;
var vrDisplay=null;
var zero=vec3.create();
var frameCount=0;
var frameLast=0;
var frameData=null;

inStartVr.onTriggered=function()
{
    op.patch.cgl.pixelDensity=window.devicePixelRatio;
    op.patch.cgl.updateSize();
    if(CABLES.UI) gui.setLayout();

    if(!vrDisplay)
    {
        console.error("could not start vr / no vr display found");
        return;
    }

    vrDisplay.requestPresent([{ source: cgl.canvas }]).then(
        function()
        {
            console.log('Presenting to WebVR display');

            var leftEye = vrDisplay.getEyeParameters('left');
            var rightEye = vrDisplay.getEyeParameters('right');

            console.log(leftEye.renderWidth);
            console.log(leftEye.renderHeight);

            frameData=new VRFrameData();

            vrDisplay.requestAnimationFrame(mainloopVr);
        });
};

function mainloopVr()
{
    var vrSceneFrame = vrDisplay.requestAnimationFrame(mainloopVr);

    vrDisplay.getFrameData(frameData);


    if(CABLES.now()-frameLast>1000)
    {
        // console.log('frameCount',frameCount);
        outFps.set(frameCount);
        frameCount=0;
        frameLast=CABLES.now();
    }



    // console.log(frameData);


    // cgl.renderStart(cgl,zero,zero);

    CGL.MESH.lastShader=null;
    CGL.MESH.lastMesh=null;


    // cgl.gl.enable(cgl.gl.DEPTH_TEST);


    cgl.pushBlend(true);
    // cgl.gl.enable(cgl.gl.BLEND);
    cgl.gl.blendEquationSeparate( cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD );
    cgl.gl.blendFuncSeparate( cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA );

    cgl.gl.clearColor(0,0,0,1);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);


    // left eye

    cgl.pushPMatrix();
    mat4.multiply(cgl.pMatrix,cgl.pMatrix,frameData.leftProjectionMatrix);

    cgl.pushViewMatrix();
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,frameData.leftViewMatrix);

    cgl.gl.viewport(0, 0, cgl.canvasWidth * 0.5, cgl.canvasHeight);

    nextVr.trigger();

    cgl.popViewMatrix();
    cgl.popPMatrix();


    // right eye

    // cgl.renderStart(cgl,zero,zero);

    cgl.pushPMatrix();
    mat4.multiply(cgl.pMatrix,cgl.pMatrix,frameData.rightProjectionMatrix);

    cgl.pushViewMatrix();
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,frameData.rightViewMatrix);

    cgl.gl.viewport(cgl.canvasWidth * 0.5, 0, cgl.canvasWidth * 0.5, cgl.canvasHeight);

    nextVr.trigger();

    cgl.popViewMatrix();
    cgl.popPMatrix();
    cgl.popBlend(true);



    vrDisplay.submitFrame();

    frameCount++;

    // cgl.renderEnd(cgl);
}


if(navigator.getVRDisplays)
{
    outSupported.set(true);
    navigator.getVRDisplays().then(function(displays)
    {
        // If a display is available, use it to present the scene
        if(displays.length > 0)
        {
            vrDisplay = displays[0];
            outDisplayName.set(vrDisplay.displayName);
            console.log('Display found',vrDisplay.displayName);


        }
        else
        {
            console.error("could not find vr display...");
        }
    });

}
else
{
    outSupported.set(false);
}
