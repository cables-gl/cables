var cgl=op.patch.cgl;

var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var fast=op.inValueBool("Fast",true);




var amount=op.addInPort(new CABLES.Port(op,"amount",CABLES.OP_PORT_TYPE_VALUE));
amount.set(10);

var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

shader.define("FASTBLUR");

fast.onChange=function()
{
    if(fast.get()) shader.define("FASTBLUR");
        else shader.removeDefine("FASTBLUR");
};

shader.setSource(shader.getDefaultVertexShader(),attachments.blur_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniDirX=new CGL.Uniform(shader,'f','dirX',0);
var uniDirY=new CGL.Uniform(shader,'f','dirY',0);

var uniWidth=new CGL.Uniform(shader,'f','width',0);
var uniHeight=new CGL.Uniform(shader,'f','height',0);

var uniAmount=new CGL.Uniform(shader,'f','amount',amount.get());
amount.onValueChange(function(){ uniAmount.setValue(amount.get()); });

var textureAlpha=new CGL.Uniform(shader,'t','imageMask',1);


var direction=op.addInPort(new CABLES.Port(op,"direction",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['both','vertical','horizontal']}));
var dir=0;
direction.set('both');
direction.onValueChange(function()
{
    if(direction.get()=='both')dir=0;
    if(direction.get()=='horizontal')dir=1;
    if(direction.get()=='vertical')dir=2;
});

var mask=op.addInPort(new CABLES.Port(op,"mask",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true }));

mask.onChange=function()
{
    if(mask.get() && mask.get().tex) shader.define('HAS_MASK');
        else shader.removeDefine('HAS_MASK');
};



render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    // first pass
    if(dir===0 || dir==2)
    {

        cgl.currentTextureEffect.bind();
        /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        if(mask.get() && mask.get().tex)
        {
            /* --- */cgl.setTexture(1, mask.get().tex );
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );
        }


        uniDirX.setValue(0.0);
        uniDirY.setValue(1.0);

        cgl.currentTextureEffect.finish();
    }

    // second pass
    if(dir===0 || dir==1)
    {

        cgl.currentTextureEffect.bind();
        /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        if(mask.get() && mask.get().tex)
        {
            /* --- */cgl.setTexture(1, mask.get().tex );
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );
        }

        uniDirX.setValue(1.0);
        uniDirY.setValue(0.0);

        cgl.currentTextureEffect.finish();
    }

    cgl.setPreviousShader();
    trigger.trigger();
};
