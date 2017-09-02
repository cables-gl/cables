op.name="ShadowSource";

var render=op.inFunction("Render");

var next=op.outFunction("Next");


var cgl=op.patch.cgl;
var lightMVP=mat4.create();


if(cgl.glVersion==1) fb=new CGL.Framebuffer(cgl,512,512);
else 
{
    console.log("new framebuffer...");
    fb=new CGL.Framebuffer2(cgl,512,512,{multisampling:true});
}

var tex=op.outTexture("shadow texture");
tex.set( fb.getTextureDepth() );

function renderPickingPass()
{
    fb.renderStart();

    cgl.pushMvMatrix();
    cgl.pushViewMatrix();
    // cgl.resetViewPort();

    cgl.pushPMatrix();

    vec3.set(vUp, 0,1,0);
    vec3.set(vEye, 1,44,0);
    vec3.set(vCenter, 1,0,1);

    var ratio=15.0;
    // mat4.perspective(cgl.pMatrix,45, 1, 0.1, 100.0);
    mat4.ortho(cgl.pMatrix,
        1*ratio, 
        -1*ratio,  
        1*ratio, 
        -1*ratio, 
        0.01,
        100
        );

    mat4.lookAt(cgl.vMatrix, vEye, vCenter, vUp);

    // =lightViewMatrix;
    
    // mat4.mul(lightMVP,lightViewMatrix,cgl.pMatrix);
    mat4.mul(lightMVP,cgl.pMatrix,cgl.vMatrix);

    
    var biasMatrix=mat4.fromValues(
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.5, 0.5, 0.5, 1.0);
    mat4.mul(lightMVP,biasMatrix,lightMVP);
    // mat4.mul(lightMVP,lightMVP,biasMatrix);

    
    cgl.frameStore.lightMVP=lightMVP;
    // console.log(cgl.frameStore.lightMVP);

    // mat4.mul(cgl.pMatrix);
    
    // g_mvpMatrix.set(viewProjMatrix);
    // g_mvpMatrix.multiply(g_modelMatrix);


    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
    next.trigger();
    
    
    

    cgl.popPMatrix();
    
    cgl.popMvMatrix();
    cgl.popViewMatrix();
    

    
    fb.renderEnd();
}

var vUp=vec3.create();
var vEye=vec3.create();
var vCenter=vec3.create();
var lightViewMatrix=mat4.create();

var doRender=function()
{
    var minimizeFB=8;

    cgl.gl.enable(cgl.gl.CULL_FACE);
    cgl.gl.cullFace(cgl.gl.FRONT);


    renderPickingPass();



    cgl.frameStore.shadowMap=fb.getTextureDepth();
    
    cgl.gl.cullFace(cgl.gl.BACK);

    next.trigger();
    cgl.frameStore.shadowMap=null;

    cgl.gl.disable(cgl.gl.CULL_FACE);

};


render.onTriggered=doRender;
