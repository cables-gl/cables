// adapted from: math.hws.edu/graphicsbook/source/webgl/cube-camera.html

var render=op.inFunction("Render");
var next=op.outFunction("Next");
var outTex=op.outObject("cubemap");

var inSize=op.inValueInt("Size",512);

var gl=op.patch.cgl.gl;
var cgl=op.patch.cgl;

var initialized=false;
var framebuffer=null;
var modelview = mat4.create();
var dynamicCubemap;
inSize.onChange=reInit;

var cubemapTargets=[  // targets for use in some gl functions for working with cubemaps
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
    ];

function reInit()
{
    if(dynamicCubemap)cgl.gl.deleteTexture(dynamicCubemap);
    init();
}

function checkError(when)
{
    var err=gl.getError();
    if (err != gl.NO_ERROR) {
        console.log("error "+when);
        console.log('error size',inSize.get());
        if(err==cgl.gl.NO_ERROR)console.error("NO_ERROR");
        if(err==cgl.gl.OUT_OF_MEMORY)console.error("OUT_OF_MEMORY");
        if(err==cgl.gl.INVALID_ENUM)console.error("INVALID_ENUM");
        if(err==cgl.gl.INVALID_OPERATION)console.error("INVALID_OPERATION");
        if(err==cgl.gl.INVALID_FRAMEBUFFER_OPERATION)console.error("INVALID_FRAMEBUFFER_OPERATION");
        if(err==cgl.gl.INVALID_VALUE)console.error("INVALID_VALUE");
        if(err==cgl.gl.CONTEXT_LOST_WEBGL)console.error("CONTEXT_LOST_WEBGL");

        // throw "Some WebGL error occurred while trying to create framebuffer.  Maybe you need more resources; try another browser or computer.";
    }
    
}

function init()
{
    var i=0;
    
    checkError(221);
    
    dynamicCubemap = gl.createTexture(); // Create the texture object for the reflection map

checkError(111);
    
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);  // create storage for the reflection map images
    
    checkError(122);
    
    for (i = 0; i < 6; i++)
    {
        gl.texImage2D(cubemapTargets[i], 0, gl.RGBA, inSize.get(), inSize.get(), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        //With null as the last parameter, the previous function allocates memory for the texture and fills it with zeros.
    }
    checkError(1);

    framebuffer = gl.createFramebuffer();  // crate the framebuffer that will draw to the reflection map
    
    checkError(2);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);  // select the framebuffer, so we can attach the depth buffer to it
    
    checkError(3);
    
    var depthBuffer = gl.createRenderbuffer();   // renderbuffer for depth buffer in framebuffer
    checkError(4);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // so we can create storage for the depthBuffer
    checkError(5);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, inSize.get(), inSize.get());
    checkError(6);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    checkError(7);
        // The same framebuffer will be used to draw all six faces of the cubemap.  Each side will be attached
        // as the color buffer of the framebuffer while that side is being drawn.
    
    // Check form WebGL errors (since I'm not sure all platforms will be able to create the framebuffer)

    outTex.set({"cubemap":dynamicCubemap});

    
    initialized=true;
}

render.onTriggered=function()
{
    if(!initialized) init();
    
    cgl.pushViewMatrix();
    cgl.pushPMatrix();

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0,0,inSize.get(),inSize.get());  //match size of the texture images
    mat4.perspective(cgl.pMatrix, Math.PI/2, 1, 1, 400);  // Set projection to give 90-degree field of view.
    
    mat4.identity(modelview);
    mat4.scale(modelview,modelview,[-1,-1,1]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, dynamicCubemap, 0);
    cgl.vMatrix=modelview;
    next.trigger();
 
    mat4.identity(modelview);
    mat4.scale(modelview,modelview,[-1,-1,1]);
    mat4.rotateY(modelview,modelview,Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X, dynamicCubemap, 0);
    cgl.vMatrix=modelview;
    next.trigger();

    mat4.identity(modelview);
    mat4.scale(modelview,modelview,[-1,-1,1]);
    mat4.rotateY(modelview,modelview,Math.PI);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, dynamicCubemap, 0);
    cgl.vMatrix=modelview;
    next.trigger();

    mat4.identity(modelview);
    mat4.scale(modelview,modelview,[-1,-1,1]);
    mat4.rotateY(modelview,modelview,-Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, dynamicCubemap, 0);
    cgl.vMatrix=modelview;
    next.trigger();

    mat4.identity(modelview);
    mat4.rotateX(modelview,modelview,Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, dynamicCubemap, 0);
    next.trigger();
    
    mat4.identity(modelview);
    mat4.rotateX(modelview,modelview,-Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, dynamicCubemap, 0);
    next.trigger();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);
    gl.generateMipmap( gl.TEXTURE_CUBE_MAP );
    cgl.popPMatrix();
    cgl.popViewMatrix();
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    cgl.resetViewPort();
};
