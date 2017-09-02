op.name="ShadowSource";

var render=op.inFunction("Render");

var next=op.outFunction("Next");


var cgl=op.patch.cgl;
var lightMVP=mat4.create();


if(cgl.glVersion==1) fb=new CGL.Framebuffer(cgl,1024,1024);
else 
{
    console.log("new framebuffer...");
    fb=new CGL.Framebuffer2(cgl,1024,1024,{multisampling:false});
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
    vec3.set(vEye, 1,14,0);
    vec3.set(vCenter, -2,0,0);

    var ratio=100.0;
    mat4.perspective(cgl.pMatrix,45, 1, 0.1, 100.0);
    // mat4.ortho(cgl.pMatrix,
    //     1*ratio, 
    //     -1*ratio,  
    //     1*ratio, 
    //     -1*ratio, 
    //     0.1, 
    //     100
    //     );

    mat4.lookAt(cgl.vMatrix, vEye, vCenter, vUp);

    // =lightViewMatrix;
    
    // mat4.mul(lightMVP,lightViewMatrix,cgl.pMatrix);
    mat4.mul(lightMVP,cgl.vMatrix,cgl.pMatrix);

    
    // var biasMatrix=mat4.fromValues(
    //     0.5, 0.0, 0.0, 0.0,
    //     0.0, 0.5, 0.0, 0.0,
    //     0.0, 0.0, 0.5, 0.0,
    //     0.5, 0.5, 0.5, 1.0);
    // mat4.mul(lightMVP,biasMatrix,lightMVP);
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

    renderPickingPass();

    cgl.frameStore.shadowMap=fb.getTextureDepth();
    next.trigger();
    cgl.frameStore.shadowMap=null;
};


render.onTriggered=doRender;
