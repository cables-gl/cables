CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='image compose';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.useVPSize=this.addInPort(new Port(this,"use viewport size",OP_PORT_TYPE_VALUE,{ display:'bool' }));

this.width=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE));
this.height=this.addInPort(new Port(this,"height",OP_PORT_TYPE_VALUE));
var tfilter=this.addInPort(new Port(this,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.texOut=this.addOutPort(new Port(this,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));

var effect=new CGL.TextureEffect(cgl);

cgl.currentTextureEffect=effect;
this.tex=new CGL.Texture(cgl);
this.tex.filter=CGL.Texture.FILTER_LINEAR;

var w=8,h=8;

function updateResolution()
{
    if(self.useVPSize.val)
    {
        w=cgl.getViewPort()[2];
        h=cgl.getViewPort()[3];
    }
    else
    {
        w=self.width.get();
        h=self.height.get();
    }

    if((w!= self.tex.width || h!= self.tex.height) && (w!==0 && h!==0))
    {
        self.height.val=h;
        self.width.val=w;
        self.tex.setSize(w,h);
        effect.setSourceTexture(self.tex);
        self.texOut.val=effect.getCurrentSourceTexture();
    }

    if(!self.texOut.get().isPowerOfTwo()) self.uiAttr({warning:'texture dimensions not power of two! - texture filtering will not work.'});
        else self.uiAttr({warning:''});


}

this.onResize=updateResolution;

this.useVPSize.onValueChanged=function()
{
    if(self.useVPSize.val)
    {
        self.width.onValueChanged=null;
        self.height.onValueChanged=null;
    }
    else
    {
        self.width.onValueChanged=resize;
        self.height.onValueChanged=resize;
    }
};
this.useVPSize.val=true;

function resize()
{
    h=parseInt(self.height.val,10);
    w=parseInt(self.width.val,10);
    updateResolution();
}

var render=function()
{
    // cgl.gl.disable(cgl.gl.SCISSOR_TEST);

    // cgl.gl.disable(cgl.gl.BLEND);
    // cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);


    updateResolution();

    cgl.currentTextureEffect=effect;

    effect.startEffect();

        // cgl.currentTextureEffect.bind();

        // cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
        // cgl.gl.clearColor(0,0,0,0.0);

        // cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

        // cgl.currentTextureEffect.finish();

    self.trigger.trigger();
    self.texOut.val=effect.getCurrentSourceTexture();

    // cgl.gl.enable(cgl.gl.SCISSOR_TEST);

};


this.texOut.onPreviewChanged=function()
{
    if(self.texOut.showPreview) self.render.onTriggered=self.texOut.val.preview;
    else self.render.onTriggered=render;
};


var onFilterChange=function()
{
    if(tfilter.get()=='nearest') self.tex.filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear')  self.tex.filter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap')  self.tex.filter=CGL.Texture.FILTER_MIPMAP;
    effect.setSourceTexture(self.tex);

    // this.tex.setSize(this.tex.width,this.tex.height);
    
};

tfilter.set('linear');
tfilter.onValueChange(onFilterChange);


this.width.val=640;
this.height.val=360;
this.render.onTriggered=render;