var inStartVr=op.inFunctionButton("Start VR");

var nextVr=op.outFunction("VR Mainloop");
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
        console.log('frameCount',frameCount);
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
            
            
            // Starting the presentation when the button is clicked: It can only be called in response to a user gesture
            // btn.addEventListener('click', function()
            // {
            // if(btn.textContent === 'Start VR display')
            // {
            //   vrDisplay.requestPresent([{ source: canvas }]).then(function() {
            //     console.log('Presenting to WebVR display');
        
            //     // Set the canvas size to the size of the vrDisplay viewport
        
            //     var leftEye = vrDisplay.getEyeParameters('left');
            //     var rightEye = vrDisplay.getEyeParameters('right');
        
            //     canvas.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
            //     canvas.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
        
            //     // stop the normal presentation, and start the vr presentation
            //     window.cancelAnimationFrame(normalSceneFrame);
            //     drawVRScene();
        
            //     btn.textContent = 'Exit VR display';
            //   });
            // } else {
            //   vrDisplay.exitPresent();
            //   console.log('Stopped presenting to WebVR display');
        
            //   btn.textContent = 'Start VR display';
        
            //   // Stop the VR presentation, and start the normal presentation
            //   vrDisplay.cancelAnimationFrame(vrSceneFrame);
            //   drawScene();
            // }
        //   });
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
