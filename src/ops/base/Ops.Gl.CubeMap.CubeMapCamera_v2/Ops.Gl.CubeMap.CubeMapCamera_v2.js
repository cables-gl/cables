// adapted from: math.hws.edu/graphicsbook/source/webgl/cube-camera.html
const cgl = op.patch.cgl;
const gl = cgl.gl;

const render=op.inTrigger("Render");
const next=op.outTrigger("Next");
const outTex=op.outObject("cubemap");

const inSize=op.inInt("Size", 512);



var cubemapInitialized = false;
var initialized=false;
var modelview = mat4.create();

inSize.onChange=reInit;
render.onTriggered=doRender;
op.preRender=doRender;

var cubemapTargets=[  // targets for use in some gl functions for working with cubemaps
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

const CUBEMAP_PROPERTIES = [  // targets for use in some gl functions for working with cubemaps
    {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        lookAt: vec3.fromValues(1.0, 0.0, 0.0),
        up: vec3.fromValues(0.0, -1.0, 0.0),
    }, {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        lookAt: vec3.fromValues(-1.0, 0.0, 0.0),
        up: vec3.fromValues(0.0, -1.0, 0.0),
    }, {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        lookAt: vec3.fromValues(0.0, 1.0, 0.0),
        up: vec3.fromValues(0.0, 0.0, 1.0),
    }, {
        lookAt: vec3.fromValues(0.0, -1.0, 0.0),
        up: vec3.fromValues(0.0, 0.0, -1.0),
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    }, {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        lookAt: vec3.fromValues(0.0, 0.0, 1.0),
        up: vec3.fromValues(0.0, -1.0, 0.0),
    }, {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        lookAt: vec3.fromValues(0.0, 0.0, -1.0),
        up: vec3.fromValues(0.0, -1.0, 0.0),
    },
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
        op.log("error "+when);
        op.log('error size',inSize.get());
        if(err==cgl.gl.NO_ERROR)op.error("NO_ERROR");
        if(err==cgl.gl.OUT_OF_MEMORY)op.error("OUT_OF_MEMORY");
        if(err==cgl.gl.INVALID_ENUM)op.error("INVALID_ENUM");
        if(err==cgl.gl.INVALID_OPERATION)op.error("INVALID_OPERATION");
        if(err==cgl.gl.INVALID_FRAMEBUFFER_OPERATION)op.error("INVALID_FRAMEBUFFER_OPERATION");
        if(err==cgl.gl.INVALID_VALUE)op.error("INVALID_VALUE");
        if(err==cgl.gl.CONTEXT_LOST_WEBGL)op.error("CONTEXT_LOST_WEBGL");

        // throw "Some WebGL error occurred while trying to create framebuffer.  Maybe you need more resources; try another browser or computer.";
    }

}

var framebuffer = null;
var depthBuffer = null;
const cubeMap = { cubemap: null, size: null };
var dynamicCubemap = null;


function initializeCubemap() {
    var i=0;

    checkError(221);

    dynamicCubemap = gl.createTexture(); // Create the texture object for the reflection map

    checkError(111);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);  // create storage for the reflection map images
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    checkError(122);

    for (i = 0; i < 6; i++)
    {
        gl.texImage2D(
            CUBEMAP_PROPERTIES[i].face,
            0,
            gl.RGBA,
            Number(inSize.get()),
            Number(inSize.get()),
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
            );
        //With null as the last parameter, the previous function allocates memory for the texture and fills it with zeros.
    }
    checkError(1);

    framebuffer = gl.createFramebuffer();  // crate the framebuffer that will draw to the reflection map

    checkError(2);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);  // select the framebuffer, so we can attach the depth buffer to it
    checkError(3);

    depthBuffer = gl.createRenderbuffer();   // renderbuffer for depth buffer in framebuffer
    checkError(4);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // so we can create storage for the depthBuffer
    checkError(5);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, Number(inSize.get()), Number(inSize.get()));
    checkError(6);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    checkError(7);
        // The same framebuffer will be used to draw all six faces of the cubemap.  Each side will be attached
        // as the color buffer of the framebuffer while that side is being drawn.

    // Check form WebGL errors (since I'm not sure all platforms will be able to create the framebuffer)

    outTex.set({ cubemap: dynamicCubemap });

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    cubemapInitialized = true;
}

const identityMat = mat4.create();
const lookAt = vec3.create();
function renderCubeSide(index) {
    cgl.pushModelMatrix();
    cgl.pushViewMatrix();
    cgl.pushPMatrix();

    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        CUBEMAP_PROPERTIES[index].face,
        dynamicCubemap,
        0
    );

    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthBuffer
    );

    gl.clearColor(1, 1, 1, 1);

    // * calculate matrices & camPos vector
    // mat4.copy(cgl.mMatrix, identityMat); // M

    vec3.add(lookAt, vec3.fromValues(0, 0, 0), CUBEMAP_PROPERTIES[index].lookAt);

    mat4.lookAt(cgl.vMatrix, vec3.fromValues(0, 0, 0), lookAt, CUBEMAP_PROPERTIES[index].up); // V
    // mat4.copy(cgl.pMatrix, lightProjectionMatrix); // P

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    next.trigger();

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
}

function renderCubemap() {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.viewport(0, 0, Number(inSize.get()), Number(inSize.get()));


    for (let i = 0; i < 6; i += 1) renderCubeSide(i);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    cgl.resetViewPort();
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


function doRender()
{
    if(!cubemapInitialized) initializeCubemap();

    renderCubemap();
    /*
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
    cgl.vMatrix=modelview;
    next.trigger();

    mat4.identity(modelview);
    mat4.rotateX(modelview,modelview,-Math.PI/2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, dynamicCubemap, 0);
    cgl.vMatrix=modelview;
    next.trigger();






    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);
    gl.generateMipmap( gl.TEXTURE_CUBE_MAP );
    cgl.popPMatrix();
    cgl.popViewMatrix();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    cgl.resetViewPort();
    */
};
