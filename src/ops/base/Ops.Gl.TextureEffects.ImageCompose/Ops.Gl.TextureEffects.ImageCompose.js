var self=this;
var cgl=this.patch.cgl;

this.name='image compose';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

var useVPSize=this.addInPort(new Port(this,"use viewport size",OP_PORT_TYPE_VALUE,{ display:'bool' }));

var width=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE));
var height=this.addInPort(new Port(this,"height",OP_PORT_TYPE_VALUE));
var tfilter=this.addInPort(new Port(this,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var texOut=this.addOutPort(new Port(this,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));

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
        height.val=h;
        width.val=w;
        tex.setSize(w,h);

        effect.setSourceTexture(tex);
        texOut.set(effect.getCurrentSourceTexture());
    }

    if(texOut.get())
        if(!texOut.get().isPowerOfTwo()) self.uiAttr({warning:'texture dimensions not power of two! - texture filtering will not work.'});
            else self.uiAttr({warning:''});

}

this.onResize=updateResolution;

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
    texOut.val=effect.getCurrentSourceTexture();
};

texOut.onPreviewChanged=function()
{
    if(texOut.showPreview)
        render.onTriggered=function()
        {
            doRender();
            tex.preview();
        };
    else 
        render.onTriggered=doRender;
};


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
