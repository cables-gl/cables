op.name='image compose';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var useVPSize=op.addInPort(new Port(op,"use viewport size",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var width=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addInPort(new Port(op,"height",OP_PORT_TYPE_VALUE));
var tfilter=op.addInPort(new Port(op,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var texOut=op.addOutPort(new Port(op,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));

op.onResize=updateResolution;

var cgl=op.patch.cgl;
var effect=new CGL.TextureEffect(cgl);
cgl.currentTextureEffect=effect;
var tex=new CGL.Texture(cgl);
tex.filter=CGL.Texture.FILTER_LINEAR;

var w=8,h=8;

function updateResolution()
{
    if(useVPSize.get())
    {
        w=cgl.getViewPort()[2];
        h=cgl.getViewPort()[3];
    }
    else
    {
        w=parseInt(width.get(),10);
        h=parseInt(height.get(),10);
    }

    if((w!=tex.width || h!= tex.height) && (w!==0 && h!==0))
    {
        height.set(h);
        width.set(w);
        tex.setSize(w,h);

        effect.setSourceTexture(tex);
        texOut.set(effect.getCurrentSourceTexture());
    }

    if(texOut.get())
        if(!texOut.get().isPowerOfTwo()) op.uiAttr({warning:'texture dimensions not power of two! - texture filtering will not work.'});
            else op.uiAttr({warning:''});

}


useVPSize.onValueChanged=function()
{
    if(useVPSize.get())
    {
        width.onValueChanged=null;
        height.onValueChanged=null;
    }
    else
    {
        width.onValueChanged=updateResolution;
        height.onValueChanged=updateResolution;
    }
    updateResolution();
};

var doRender=function()
{
    updateResolution();
    cgl.currentTextureEffect=effect;
    effect.startEffect();
    trigger.trigger();
    texOut.set(effect.getCurrentSourceTexture());
};

// texOut.onPreviewChanged=function()
// {
//     if(texOut.showPreview)
//         render.onTriggered=function()
//         {
//             doRender();
//             tex.preview();
//         };
//     else 
//         render.onTriggered=doRender;
// };


function onFilterChange()
{
    var newFilter=tex.filter;
    if(tfilter.get()=='nearest') newFilter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear')  newFilter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap')  newFilter=CGL.Texture.FILTER_MIPMAP;
    if(newFilter!=tex.filter)tex.width=0;
    tex.filter=newFilter;
    effect.setSourceTexture(tex);
    updateResolution();
}

tfilter.set('linear');
tfilter.onValueChanged=onFilterChange;

useVPSize.set(true);
render.onTriggered=doRender;

width.set(640);
height.set(360);
