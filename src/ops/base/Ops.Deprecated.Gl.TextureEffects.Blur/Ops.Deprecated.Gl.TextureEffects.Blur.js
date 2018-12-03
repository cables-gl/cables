//Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='Blur';
this.render=this.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

this.iterations=this.addInPort(new CABLES.Port(this,"iterations",CABLES.OP_PORT_TYPE_VALUE));
this.iterations.val=10;

var shader=new CGL.Shader(cgl);
// this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  UNI sampler2D tex;'
    .endl()+'  UNI float dirX;'
    .endl()+'  UNI float dirY;'
    .endl()+'  UNI float width;'
    .endl()+'  UNI float height;'
    .endl()+'#endif'
    .endl()+''
    .endl()+'vec4 blur9(sampler2D text, vec2 uv, vec2 red, vec2 dir)'
    .endl()+'{'
    .endl()+'   vec4 color = vec4(0.0);'
    .endl()+'   vec2 offset1 = vec2(1.3846153846) * dir;'
    .endl()+'   vec2 offset2 = vec2(3.2307692308) * dir;'
    .endl()+'   color += texture2D(text, uv) * 0.2270270270;'
    .endl()+'   color += texture2D(text, uv + (offset1 / red)) * 0.3162162162;'
    .endl()+'   color += texture2D(text, uv - (offset1 / red)) * 0.3162162162;'
    .endl()+'   color += texture2D(text, uv + (offset2 / red)) * 0.0702702703;'
    .endl()+'   color += texture2D(text, uv - (offset2 / red)) * 0.0702702703;'
    .endl()+'   return color;'
    .endl()+'}'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=blur9(tex,texCoord,vec2(width,height),vec2(dirX,dirY));'
    .endl()+'   #endif'
    .endl()+'   outColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniDirX=new CGL.Uniform(shader,'f','dirX',0);
var uniDirY=new CGL.Uniform(shader,'f','dirY',0);

var uniWidth=new CGL.Uniform(shader,'f','width',0);
var uniHeight=new CGL.Uniform(shader,'f','height',0);

var direction=this.addInPort(new CABLES.Port(this,"direction",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['both','vertical','horizontal']}));
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
        if(dir===0 || dir==2)
        {

            cgl.currentTextureEffect.bind();
            cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
            

            uniDirX.setValue(0.0);
            uniDirY.setValue(1.0);

            cgl.currentTextureEffect.finish();
        }

        // second pass
        if(dir===0 || dir==1)
        {

            cgl.currentTextureEffect.bind();
            cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
            

            uniDirX.setValue(1.0);
            uniDirY.setValue(0.0);

            cgl.currentTextureEffect.finish();
        }
    }

    cgl.setPreviousShader();
    self.trigger.trigger();
};
