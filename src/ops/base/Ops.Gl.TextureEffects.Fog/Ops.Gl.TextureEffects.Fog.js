Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='fog';

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.farPlane=this.addInPort(new Port(this,"farplane",OP_PORT_TYPE_VALUE));
this.nearPlane=this.addInPort(new Port(this,"nearplane",OP_PORT_TYPE_VALUE));
this.density=this.addInPort(new Port(this,"density",OP_PORT_TYPE_VALUE));

this.image=this.addInPort(new Port(this,"depth texture",OP_PORT_TYPE_TEXTURE));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var ignoreInf=this.addInPort(new Port(this,"ignore infinity",OP_PORT_TYPE_VALUE,{ display:'bool' }));
ignoreInf.set(false);
ignoreInf.onValueChanged=function()
{
    if(ignoreInf.get()) shader.define('FOG_IGNORE_INFINITY');
        else shader.removeDefine('FOG_IGNORE_INFINITY');
};

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D depthTex;'
    .endl()+'  uniform sampler2D image;'
    .endl()+'#endif'
    .endl()+'uniform float n;'
    .endl()+'uniform float f;'
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float density;'
    .endl()+'const float LOG2 = 1.442695;'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   vec4 colImg=texture2D(image,texCoord);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(depthTex,texCoord);'
    
    .endl()+'       float z=1.0-col.r;'
    .endl()+'       float c=(2.0*n)/(f+n-z*(f-n));'

    .endl()+'       float fogFactor = exp2( -density * '
    .endl()+'           density *'
    .endl()+'           z *'
    .endl()+'           z *'
    .endl()+'           LOG2);'
    
    
    .endl()+'#ifdef FOG_IGNORE_INFINITY'
    .endl()+'   if(z<0.001)'
    .endl()+'   {'
    .endl()+'   col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   }else'
    .endl()+'#endif'
    
    .endl()+'   {'
    .endl()+'       col=mix(colImg,vec4(r,g,b,1.0),fogFactor);'
    .endl()+'   }'
    .endl()+'   #endif'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','depthTex',1);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniFarplane=new CGL.Uniform(shader,'f','f',1.0);
var uniNearplane=new CGL.Uniform(shader,'f','n',1.0);
var uniDensity=new CGL.Uniform(shader,'f','density',1.0);

this.farPlane.onValueChanged=function()
{
    uniFarplane.setValue(self.farPlane.get());
};
self.farPlane.val=100.0;

this.nearPlane.onValueChanged=function()
{
    uniNearplane.setValue(self.nearPlane.get());
};
self.nearPlane.val=0.1;

this.density.onValueChanged=function()
{
    uniDensity.setValue(self.density.get());
};
self.density.val=5.0;

{
    // diffuse color

    var r=this.addInPort(new Port(this,"diffuse r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onValueChanged=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=this.addInPort(new Port(this,"diffuse g",OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onValueChanged=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=this.addInPort(new Port(this,"diffuse b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onValueChanged=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

    var a=this.addInPort(new Port(this,"diffuse a",OP_PORT_TYPE_VALUE,{ display:'range' }));
    a.onValueChanged=function()
    {
        if(!a.uniform) a.uniform=new CGL.Uniform(shader,'f','a',a.get());
        else a.uniform.setValue(a.get());
    };

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}


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