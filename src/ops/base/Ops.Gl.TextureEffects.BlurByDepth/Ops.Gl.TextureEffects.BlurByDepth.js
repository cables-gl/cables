CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='Blur Depth Range';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var depthTex=this.addInPort(new Port(this,"depth texture",OP_PORT_TYPE_TEXTURE));

this.nearPlane=this.addInPort(new Port(this,"nearplane",OP_PORT_TYPE_VALUE));
this.farPlane=this.addInPort(new Port(this,"farplane",OP_PORT_TYPE_VALUE));

var depthStart=this.addInPort(new Port(this,"depth start",OP_PORT_TYPE_VALUE,{"display":"range"}));
var depthEnd=this.addInPort(new Port(this,"depth end",OP_PORT_TYPE_VALUE,{"display":"range"}));

this.iterations=this.addInPort(new Port(this,"iterations",OP_PORT_TYPE_VALUE));
this.iterations.val=10;

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform sampler2D texDepth;'
    .endl()+'  uniform float dirX;'
    .endl()+'  uniform float dirY;'
    .endl()+'  uniform float width;'
    .endl()+'  uniform float height;'
    
    .endl()+'  uniform float depthStart;'
    .endl()+'  uniform float depthEnd;'
    
    .endl()+'#endif'
    .endl()+'uniform float n;'
    .endl()+'uniform float f;'

    .endl()+''
    .endl()+'vec4 blur9(sampler2D texture, vec2 uv, vec2 red, vec2 dir)'
    .endl()+'{'
    .endl()+'   vec4 color = vec4(0.0);'
    .endl()+'   vec2 offset1 = vec2(1.3846153846) * dir;'
    .endl()+'   vec2 offset2 = vec2(3.2307692308) * dir;'
    
    .endl()+'   float z = texture2D(texDepth, uv).r;'
    .endl()+'   float c=(2.0*n)/(f+n-z*(f-n));'
    .endl()+'   if(!(c>=depthStart && c<=depthEnd)) return vec4( texture2D(tex, uv).rgb ,1.0);'
    // .endl()+'   if(!(c>depthStart && c<depthEnd)) return vec4( 1.0,0.0,0.0 ,1.0);'


    .endl()+'   color += texture2D(texture, uv) * 0.2270270270;'
    .endl()+'   color += texture2D(texture, uv + (offset1 / red)) * 0.3162162162;'
    .endl()+'   color += texture2D(texture, uv - (offset1 / red)) * 0.3162162162;'
    .endl()+'   color += texture2D(texture, uv + (offset2 / red)) * 0.0702702703;'
    .endl()+'   color += texture2D(texture, uv - (offset2 / red)) * 0.0702702703;'
    .endl()+'   return color;'
    .endl()+'}'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=blur9(tex,texCoord,vec2(width,height),vec2(dirX,dirY));'
    .endl()+'   #endif'
    
    // .endl()+'   float z = texture2D(texDepth, texCoord).r;'
    // .endl()+'   float c=(2.0*n)/(f+n-z*(f-n));'
    // .endl()+'   col = vec4(c,c,c,1.0);'


    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


    var uniFarplane=new CGL.Uniform(shader,'f','f',1.0);
    var uniNearplane=new CGL.Uniform(shader,'f','n',1.0);

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
    
    depthStart.onValueChanged=function()
    {
        uniDepthStart.setValue(depthStart.get());
    };
    depthStart.val=0.0;

    depthEnd.onValueChanged=function()
    {
        uniDepthEnd.setValue(depthEnd.get());
    };
    depthEnd.val=0.0;


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var textureDepthUniform=new CGL.Uniform(shader,'t','texDepth',1);

var uniDirX=new CGL.Uniform(shader,'f','dirX',0);
var uniDirY=new CGL.Uniform(shader,'f','dirY',0);

var uniWidth=new CGL.Uniform(shader,'f','width',0);
var uniHeight=new CGL.Uniform(shader,'f','height',0);

var uniDepthStart=new CGL.Uniform(shader,'f','depthStart',0);
var uniDepthEnd=new CGL.Uniform(shader,'f','depthEnd',50);

var direction=this.addInPort(new Port(this,"direction",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['both','vertical','horizontal']}));
var dir=0;
direction.set('both');
direction.onValueChange(function()
{
    if(direction.get()=='both')dir=0;
    if(direction.get()=='horizontal')dir=1;
    if(direction.get()=='vertical')dir=2;
});

this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;
    cgl.setShader(shader);

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    for(var i =0;i<self.iterations.val;i++)
    {
        // first pass
        if(dir==0 || dir==2)
        {
            
            cgl.currentTextureEffect.bind();
            cgl.gl.activeTexture(cgl.gl.TEXTURE0);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

            cgl.gl.activeTexture(cgl.gl.TEXTURE1);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, depthTex.get().tex );

    
            uniDirX.setValue(0.0);
            uniDirY.setValue(1.0);
    
            cgl.currentTextureEffect.finish();
        }

        // second pass
        if(dir==0 || dir==1)
        {

            cgl.currentTextureEffect.bind();
            cgl.gl.activeTexture(cgl.gl.TEXTURE0);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

            cgl.gl.activeTexture(cgl.gl.TEXTURE1);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, depthTex.get().tex );
    
            uniDirX.setValue(1.0);
            uniDirY.setValue(0.0);
    
            cgl.currentTextureEffect.finish();
        }
    }

    cgl.setPreviousShader();
    self.trigger.trigger();
};