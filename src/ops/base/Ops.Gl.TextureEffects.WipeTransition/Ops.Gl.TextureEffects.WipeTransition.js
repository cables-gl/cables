var self=this;
var cgl=this.patch.cgl;

this.name='WipeTransition';

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.fade=this.addInPort(new Port(this,"fade",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.fadeWidth=this.addInPort(new Port(this,"fadeWidth",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.image=this.addInPort(new Port(this,"image",OP_PORT_TYPE_TEXTURE));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform sampler2D image;'
    .endl()+'#endif'

    .endl()+'uniform float fade;'
    .endl()+'uniform float fadeWidth;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'
    .endl()+'       vec4 colWipe=texture2D(image,texCoord);'

    .endl()+'       float w=fadeWidth;'
    .endl()+'       float v=colWipe.r;'
    .endl()+'       float f=fade+fade*w;'

    .endl()+'       if(f<v) col.a=1.0;'
    .endl()+'       else if(f>v+w) col.a=0.0;'
    .endl()+'       else if(f>v && f<=v+w) col.a = 1.0-(f-v)/w; ;'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);
var fadeUniform=new CGL.Uniform(shader,'f','fade',0);
var fadeWidthUniform=new CGL.Uniform(shader,'f','fadeWidth',0);

this.fade.onValueChanged=function()
{
    fadeUniform.setValue(self.fade.val);
};

this.fadeWidth.onValueChanged=function()
{
    fadeWidthUniform.setValue(self.fadeWidth.val);
};

this.fade.val=0.5;
this.fadeWidth.val=0.2;

this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(self.image.val && self.image.val.tex)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.image.val.tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    self.trigger.trigger();
};