Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='DepthOfField';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.depthTex=this.addInPort(new Port(this,"depth map",OP_PORT_TYPE_TEXTURE));

var tex1=this.addInPort(new Port(this,"tex",OP_PORT_TYPE_TEXTURE));
var tex2=this.addInPort(new Port(this,"tex 1",OP_PORT_TYPE_TEXTURE));
var tex3=this.addInPort(new Port(this,"tex 2",OP_PORT_TYPE_TEXTURE));
var tex4=this.addInPort(new Port(this,"tex 3",OP_PORT_TYPE_TEXTURE));

this.farPlane=this.addInPort(new Port(this,"farplane",OP_PORT_TYPE_VALUE));
this.nearPlane=this.addInPort(new Port(this,"nearplane",OP_PORT_TYPE_VALUE));

this.showIntensity=this.addInPort(new Port(this,"showIntensity",OP_PORT_TYPE_VALUE,{display:'bool'}));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision mediump float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex1;'
    .endl()+'  uniform sampler2D tex2;'
    .endl()+'  uniform sampler2D tex3;'
    .endl()+'  uniform sampler2D tex4;'
    
    .endl()+'  uniform sampler2D depthTex;'


    .endl()+'  uniform float f;'
    .endl()+'  uniform float n;'

    .endl()+'#endif'


    .endl()+'float getDepth(vec2 tc)'
    .endl()+'{'
    .endl()+'       float z=texture2D(depthTex,tc).r;'
    .endl()+'       float c=(2.0*n)/(f+n-z*(f-n));'
    // .endl()+'       if(c>=0.99)c=0.0;'
    .endl()+'       return c;'
    .endl()+'}'


    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    // .endl()+'   #ifdef HAS_TEXTURES'
    // .endl()+'   float dirY=0.0;'
    // .endl()+'   if(dirX==0.0)dirY=1.0;'

    .endl()+'   float d=getDepth(texCoord);'
    
    .endl()+'   if(d<0.7)col=texture2D(tex1, texCoord);'
    .endl()+'   else if(d<0.8) col=texture2D(tex2, texCoord);'
    .endl()+'   else if(d<0.9) col=texture2D(tex3, texCoord);'
    .endl()+'   else col=texture2D(tex4, texCoord);'
    
    .endl()+'   col.a=1.0;'
    




    // .endl()+'   float d=getDepth(texCoord);'
    // // .endl()+'   float ds=d+getDepth(texCoord*1.1)+getDepth(texCoord*0.9);'

    // // .endl()+'       if(ds>0.0)'
    // .endl()+'           col=blur9(tex,texCoord,vec2(width,height),vec2(dirX,dirY));'
    // .endl()+'       col=mix(baseCol,col,d );'

    // .endl()+'       #ifdef SHOW_INTENSITY'
    // .endl()+'       col=vec4(d,d,d,1.0);'
    // .endl()+'       #endif'

    // .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex1',0);
var depthTexUniform=new CGL.Uniform(shader,'t','depthTex',1);

var textureUniform2=new CGL.Uniform(shader,'t','tex2',2);
var textureUniform3=new CGL.Uniform(shader,'t','tex3',3);
var textureUniform4=new CGL.Uniform(shader,'t','tex4',4);

var uniFarplane=new CGL.Uniform(shader,'f','f',self.farPlane.get());
var uniNearplane=new CGL.Uniform(shader,'f','n',self.nearPlane.get());


this.farPlane.onValueChanged=function()
{
    uniFarplane.setValue(self.farPlane.val);
};
self.farPlane.val=5.0;

this.nearPlane.onValueChanged=function()
{
    uniNearplane.setValue(self.nearPlane.val);
};
self.nearPlane.val=0.01;

this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;
    cgl.setShader(shader);


    // first pass

    cgl.currentTextureEffect.bind();
    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex1.get().tex );

    cgl.gl.activeTexture(cgl.gl.TEXTURE1);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.depthTex.get().tex );

    cgl.gl.activeTexture(cgl.gl.TEXTURE2);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex2.get().tex );

    cgl.gl.activeTexture(cgl.gl.TEXTURE3);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex3.get().tex );

    cgl.gl.activeTexture(cgl.gl.TEXTURE4);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex4.get().tex );


    cgl.currentTextureEffect.finish();


    cgl.setPreviousShader();
    self.trigger.trigger();
};