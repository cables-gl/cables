var render=op.inTrigger('render');
var blendMode=CGL.TextureEffect.AddBlendSelect(op,"blendMode");
var amount=op.inValueSlider("amount",1);

var image=op.inTexture("image");
var removeAlphaSrc=op.inValueBool("removeAlphaSrc",false);


var imageAlpha=op.inTexture("imageAlpha");
var alphaSrc=op.inValueSelect("alphaSrc",['alpha channel','luminance']);
var invAlphaChannel=op.inValueBool("invert alpha channel");



const inAspect=op.inValueBool("Aspect Ratio",false);
const inAspectAxis=op.inValueSelect("Stretch Axis",['X','Y'],"X");
const inAspectPos=op.inValueSlider("Position",0.0);
const inAspectCrop=op.inValueBool("Crop",false);


var trigger=op.outTrigger('trigger');

blendMode.set('normal');
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'drawimage');
var srcFrag=attachments.drawimage_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

imageAlpha.onLinkChanged=updateAlphaPorts;

op.setPortGroup("Mask",[imageAlpha,alphaSrc,invAlphaChannel]);
op.setPortGroup("Aspect Ratio",[inAspect,inAspectPos,inAspectCrop,inAspectAxis]);


removeAlphaSrc.onChange=updateRemoveAlphaSrc;

function updateAlphaPorts()
{
    if(imageAlpha.isLinked())
    {
        removeAlphaSrc.setUiAttribs({greyout:true});
        alphaSrc.setUiAttribs({greyout:false});
        invAlphaChannel.setUiAttribs({greyout:false});
    }
    else
    {
        removeAlphaSrc.setUiAttribs({greyout:false});
        alphaSrc.setUiAttribs({greyout:true});
        invAlphaChannel.setUiAttribs({greyout:true});
    }
}

op.toWorkPortsNeedToBeLinked(image);


shader.setSource(attachments.drawimage_vert,srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureImaghe=new CGL.Uniform(shader,'t','image',1);
var textureAlpha=new CGL.Uniform(shader,'t','imageAlpha',2);

const uniTexAspect=new CGL.Uniform(shader,'f','aspectTex',1);
const uniAspectPos=new CGL.Uniform(shader,'f','aspectPos',inAspectPos);

invAlphaChannel.onChange=function()
{
    if(invAlphaChannel.get()) shader.define('INVERT_ALPHA');
        else shader.removeDefine('INVERT_ALPHA');
};


inAspect.onChange=updateAspectRatio;
inAspectCrop.onChange=updateAspectRatio;
inAspectAxis.onChange=updateAspectRatio;
function updateAspectRatio()
{
    shader.removeDefine('ASPECT_AXIS_X');
    shader.removeDefine('ASPECT_AXIS_Y');

    if(inAspect.get())
    {
        shader.define('ASPECT_RATIO');

        if(inAspectCrop.get()) shader.define('ASPECT_CROP');
            else shader.removeDefine('ASPECT_CROP');

        if(inAspectAxis.get()=="X") shader.define('ASPECT_AXIS_X');
        if(inAspectAxis.get()=="Y") shader.define('ASPECT_AXIS_Y');


        inAspectPos.setUiAttribs({greyout:false});
        inAspectCrop.setUiAttribs({greyout:false});
        inAspectAxis.setUiAttribs({greyout:false});
    }
    else
    {
        shader.removeDefine('ASPECT_RATIO');
        if(inAspectCrop.get()) shader.define('ASPECT_CROP');
            else shader.removeDefine('ASPECT_CROP');

        if(inAspectAxis.get()=="X") shader.define('ASPECT_AXIS_X');
        if(inAspectAxis.get()=="Y") shader.define('ASPECT_AXIS_Y');

        inAspectPos.setUiAttribs({greyout:true});
        inAspectCrop.setUiAttribs({greyout:true});
        inAspectAxis.setUiAttribs({greyout:true});
    }
}




function updateRemoveAlphaSrc()
{
    if(removeAlphaSrc.get()) shader.define('REMOVE_ALPHA_SRC');
        else shader.removeDefine('REMOVE_ALPHA_SRC');
}


alphaSrc.onChange=function()
{
    if(alphaSrc.get()=='luminance') shader.define('ALPHA_FROM_LUMINANCE');
        else shader.removeDefine('ALPHA_FROM_LUMINANCE');
};

alphaSrc.set("alpha channel");


{
    //
    // texture flip
    //
    var flipX=op.addInPort(new CABLES.Port(op,"flip x",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
    var flipY=op.addInPort(new CABLES.Port(op,"flip y",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

    flipX.onChange=function()
    {
        if(flipX.get()) shader.define('TEX_FLIP_X');
            else shader.removeDefine('TEX_FLIP_X');
    };

    flipY.onChange=function()
    {
        if(flipY.get()) shader.define('TEX_FLIP_Y');
            else shader.removeDefine('TEX_FLIP_Y');
    };
}

{
    //
    // texture transform
    //

    var doTransform=op.inValueBool("Transform");

    var scaleX=op.inValueSlider("Scale X",1);
    var scaleY=op.inValueSlider("Scale Y",1);

    var posX=op.inValue("Position X",0);
    var posY=op.inValue("Position Y",0);

    var rotate=op.inValue("Rotation",0);

    var inClipRepeat=op.inValueBool("Clip Repeat",false);

    inClipRepeat.onChange=updateClip;
    function updateClip()
    {
        if(inClipRepeat.get()) shader.define('CLIP_REPEAT');
            else shader.removeDefine('CLIP_REPEAT');
    }


    var uniScaleX=new CGL.Uniform(shader,'f','scaleX',scaleX);
    var uniScaleY=new CGL.Uniform(shader,'f','scaleY',scaleY);

    var uniPosX=new CGL.Uniform(shader,'f','posX',posX);
    var uniPosY=new CGL.Uniform(shader,'f','posY',posY);
    var uniRotate=new CGL.Uniform(shader,'f','rotate',rotate);

    doTransform.onChange=updateTransformPorts;
}

function updateTransformPorts()
{
    if(doTransform.get())
    {
        shader.define('TEX_TRANSFORM');
        scaleX.setUiAttribs({hidePort:false,greyout:false});
        scaleY.setUiAttribs({hidePort:false,greyout:false});
        posX.setUiAttribs({hidePort:false,greyout:false});
        posY.setUiAttribs({hidePort:false,greyout:false});
        rotate.setUiAttribs({hidePort:false,greyout:false});
    }
    else
    {
        shader.removeDefine('TEX_TRANSFORM');
        scaleX.setUiAttribs({hidePort:true,greyout:true});
        scaleY.setUiAttribs({hidePort:true,greyout:true});
        posX.setUiAttribs({hidePort:true,greyout:true});
        posY.setUiAttribs({hidePort:true,greyout:true});
        rotate.setUiAttribs({hidePort:true,greyout:true});
    }
}



CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);


var amountUniform=new CGL.Uniform(shader,'f','amount',amount);



imageAlpha.onChange=function()
{
    if(imageAlpha.get() && imageAlpha.get().tex)
    {
        shader.define('HAS_TEXTUREALPHA');
    }
    else
    {
        shader.removeDefine('HAS_TEXTUREALPHA');
    }
};


function doRender()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var tex=image.get();
    if(tex && tex.tex && amount.get()>0.0)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        const imgTex=cgl.currentTextureEffect.getCurrentSourceTexture();
        cgl.setTexture(0,imgTex.tex );

        uniTexAspect.setValue( 1/(tex.height/tex.width*imgTex.width/imgTex.height));



        cgl.setTexture(1, tex.tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        if(imageAlpha.get() && imageAlpha.get().tex)
        {
            cgl.setTexture(2, imageAlpha.get().tex );
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, imageAlpha.get().tex );
        }

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
}

render.onTriggered=doRender;
updateTransformPorts();
updateRemoveAlphaSrc();
updateAlphaPorts();
updateAspectRatio();
