op.name="ShadowSource";

var render=op.inFunction("Render");
var strength=op.inValueSlider("Strength",0.5);


var areaSize=op.inValueInt("Area Size",20);
var mapSize=op.inValueInt("Map Size",512);
var samples=op.inValueInt("Samples",4);

var polyOff=op.inValueInt("Poly Offset",0);

var bias=op.inValueInt("Bias",0.001);

var lookat=op.inArray("Look at");

var next=op.outFunction("Next");


var cgl=op.patch.cgl;
var lightMVP=mat4.create();

mapSize.onChange=setSize;


function setSize()
{
    fb.setSize(mapSize.get(),mapSize.get());
}

if(cgl.glVersion==1) fb=new CGL.Framebuffer(cgl,32,32);
else 
{
    console.log("new framebuffer...");
    fb=new CGL.Framebuffer2(cgl,32,32,{multisampling:false});
}
setSize();

var tex=op.outTexture("shadow texture");
tex.set( fb.getTextureDepth() );

function renderPickingPass()
{
    fb.renderStart();

    cgl.pushMvMatrix();
    cgl.pushViewMatrix();
    // cgl.resetViewPort();

    cgl.pushPMatrix();

    if(!lookat.get())
    {
        vec3.set(vUp, 0,1,0);
        vec3.set(vEye, 1,50,0);
        vec3.set(vCenter, 0,0,0);
    }
    else
    {
        var la=lookat.get();

        vec3.set(vEye, la[0],la[1],la[2]);
        vec3.set(vCenter, la[3],la[4],la[5]+0.00001);
        vec3.set(vUp, la[6],la[7],la[8]);
        
    }

    

    var ratio=areaSize.get();
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


var shadowObj={};

var doRender=function()
{
    var minimizeFB=8;

    cgl.gl.enable(cgl.gl.CULL_FACE);
    cgl.gl.cullFace(cgl.gl.FRONT);


cgl.gl.enable(cgl.gl.POLYGON_OFFSET_FILL);
cgl.gl.polygonOffset(polyOff.get(),polyOff.get());


    renderPickingPass();


cgl.gl.disable(cgl.gl.POLYGON_OFFSET_FILL);


    shadowObj.strength=strength.get();
    shadowObj.samples=Math.max(1,samples.get());
    shadowObj.bias=bias.get();
    shadowObj.shadowMap=fb.getTextureDepth();
    cgl.frameStore.shadow=shadowObj;
    
    cgl.gl.cullFace(cgl.gl.BACK);

    next.trigger();
    cgl.frameStore.shadow=null;

    cgl.gl.disable(cgl.gl.CULL_FACE);

};


render.onTriggered=doRender;
