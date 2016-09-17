
var rframes=0;
var rframeStart=0;

if(!op.patch.cgl) op.uiAttr( { 'error': 'No webgl cgl context' } );

var patch=op.patch;
var cgl=op.patch.cgl;

op.name='renderer';

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var width=op.addOutPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addOutPort(new Port(op,"height",OP_PORT_TYPE_VALUE));
var fpsLimit=op.inValue("FPS Limit",0);

var identTranslate=vec3.create();
vec3.set(identTranslate, 0,0,0);
var identTranslateView=vec3.create();
vec3.set(identTranslateView, 0,0,-2);

fpsLimit.onChange=function()
{
    op.patch.config.fpsLimit=fpsLimit.get()||0;
    console.log(op.patch.config.fpsLimit);
};


op.onDelete=function()
{
    cgl.gl.clearColor(0,0,0,0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    op.patch.removeOnAnimFrame(op);
};

op.onAnimFrame=function(time)
{
    if(cgl.aborted || cgl.canvas.clientWidth===0 || cgl.canvas.clientHeight===0)return;

    if(cgl.canvasWidth==-1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if(cgl.canvasWidth!=cgl.canvas.clientWidth || cgl.canvasHeight!=cgl.canvas.clientHeight)
    {
        cgl.canvasWidth=cgl.canvas.clientWidth;
        width.set(cgl.canvasWidth);
        cgl.canvasHeight=cgl.canvas.clientHeight;
        height.set(cgl.canvasHeight);
    }

    if(Date.now()-rframeStart>1000)
    {
        CGL.fpsReport=CGL.fpsReport||[];
        if(patch.loading.getProgress()>=1.0 && rframeStart!==0)CGL.fpsReport.push(rframes);
        rframes=0;
        rframeStart=Date.now();
    }
    CGL.MESH.lastShader=null;
    CGL.MESH.lastMesh=null;


    cgl.renderStart(cgl,identTranslate,identTranslateView);



    trigger.trigger();

    if(CGL.Texture.previewTexture)
    {
        if(!CGL.Texture.texturePreviewer) CGL.Texture.texturePreviewer=new CGL.Texture.texturePreview(cgl);
        CGL.Texture.texturePreviewer.render(CGL.Texture.previewTexture);
    }
    cgl.renderEnd(cgl);
    
    if(!cgl.frameStore.phong)cgl.frameStore.phong={}
    rframes++;
    

};
