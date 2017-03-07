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

// var distNear=this.addInPort(new Port(this,"distance near",OP_PORT_TYPE_VALUE,{'display':'range'}));
var distFar=this.addInPort(new Port(this,"distance far",OP_PORT_TYPE_VALUE,{'display':'range'}));

var stepWidth=this.addInPort(new Port(this,"step width",OP_PORT_TYPE_VALUE,{}));

var showDistances=this.addInPort(new Port(this,"showDistances",OP_PORT_TYPE_VALUE,{display:'bool'}));
showDistances.set(false);

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision mediump float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex1;'
    .endl()+'uniform sampler2D tex2;'
    .endl()+'uniform sampler2D tex3;'
    .endl()+'uniform sampler2D tex4;'

    .endl()+'uniform sampler2D depthTex;'
    .endl()+'uniform float f;'
    .endl()+'uniform float n;'
    
    .endl()+'uniform float stepWidth;'
    
    .endl()+'uniform float distNear;'
    .endl()+'uniform float distFar;'
    

    .endl()+'float getDepth(vec2 tc)'
    .endl()+'{'
    .endl()+'    float z=texture2D(depthTex,tc).r*1.1;'
    .endl()+'    float c=(2.0*n)/(f+n-z*(f-n));'
    .endl()+'    return c;'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   col=texture2D(tex1, texCoord);'
    .endl()+'   float d=getDepth(texCoord);'
    
    // .endl()+'   if(d<0.05) col=texture2D(tex4, texCoord);'
    // .endl()+'   else if(d<0.1) col=texture2D(tex2, texCoord);'
    // .endl()+'   else if(d<0.7)col=texture2D(tex1, texCoord);'
    // .endl()+'   else if(d<0.8) col=texture2D(tex2, texCoord);'
    // .endl()+'   else if(d<0.9) col=texture2D(tex3, texCoord);'
    // .endl()+'   else col=texture2D(tex4, texCoord);'
    
    // .endl()+'   if(d>distFar) col=texture2D(tex4, texCoord);'
    .endl()+'   if(d>=distFar)'
    .endl()+'   {'
    .endl()+'       float df=distFar;'
    
    .endl()+'       float step=(1.0-df)/stepWidth;'
    .endl()+'       float blend=step/2.0;'
    .endl()+'       vec4 newCol;;'

    .endl()+'       if(d>=df && d<df+step)'
    .endl()+'       {'
    .endl()+'           newCol=texture2D(tex2, texCoord);'
    .endl()+'           #ifdef SHOWAREAS'.endl()+'newCol.r+=1.0;'.endl()+'#endif'
    .endl()+'       }'
    .endl()+'       else'
    .endl()+'       {'
    .endl()+'           df+=step;'
    .endl()+'           if(d>=df && d<df+step*1.2  )'
    .endl()+'           {'
    .endl()+'               col=texture2D(tex2, texCoord);'
    .endl()+'               newCol=texture2D(tex3, texCoord);'
    .endl()+'               #ifdef SHOWAREAS'.endl()+'newCol.g+=1.0;'.endl()+'#endif'
    .endl()+'           }'
    .endl()+'           else'
    .endl()+'           {'
    .endl()+'               df+=step*1.2;'
    .endl()+'               if(d>=df)'
    .endl()+'               {'
    .endl()+'                   col=texture2D(tex3, texCoord);'
    .endl()+'                   newCol=texture2D(tex4, texCoord);'
    .endl()+'                   #ifdef SHOWAREAS'.endl()+'newCol.b+=1.0;'.endl()+'#endif'
    .endl()+'               }'
    .endl()+'           }'
    .endl()+'       }'

    .endl()+'       blend=1.0-min(1.0,(d-df)/blend);'
    .endl()+'       col=col*blend+( (1.0-blend)*newCol);'
    .endl()+'   }'

    
    
    .endl()+'   col.a=1.0;'
    
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

// var uniDistNear=new CGL.Uniform(shader,'f','distNear',distNear.get());
var uniDistFar=new CGL.Uniform(shader,'f','distFar',distFar.get());
var uniStepWidth=new CGL.Uniform(shader,'f','stepWidth',stepWidth.get());


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

showDistances.onValueChange(
    function()
    {
        if(showDistances.get()) shader.define('SHOWAREAS');
            else shader.removeDefine('SHOWAREAS');
    });

// distNear.onValueChange(function(){ uniDistNear.setValue(distNear.get()); });
distFar.onValueChange(function(){ uniDistFar.setValue(distFar.get()); });
stepWidth.onValueChange(function(){ uniStepWidth.setValue(stepWidth.get()); });
// distNear.set(0.2);
distFar.set(0.5);
stepWidth.set(10);


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