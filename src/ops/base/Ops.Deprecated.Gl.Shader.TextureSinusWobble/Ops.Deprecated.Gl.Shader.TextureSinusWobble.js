var self=this;
var cgl=self.patch.cgl;

this.name='texture sinus wobble';
this.render=this.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION) );
this.trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

this.doRender=function()
{
    cgl.setShader(shader);

    if(self.texture.get())
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, self.texture.val.tex);
    }

    self.trigger.trigger();


    cgl.setPreviousShader();
};

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'   IN vec2 texCoord;'
    .endl()+'   #ifdef HAS_TEXTURE_DIFFUSE'
    .endl()+'       uniform sampler2D tex;'
    .endl()+'   #endif'
    .endl()+'#endif'
    .endl()+'uniform float a;'
    .endl()+'uniform float time;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1,1,1,a);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'      #ifdef HAS_TEXTURE_DIFFUSE'

    // float smoothstep(float edge0, float edge1, float x)

    // .endl()+'          col=texture2D(tex,texCoord);'
    // .endl()+'           float x=smoothstep(-1.0,1.0,texCoord.x*sin(time+texCoord.y*(col.r-0.5)) );'
    .endl()+'           float x=texCoord.x+sin(time+texCoord.y*(3.0))*0.15 ;'
    .endl()+'           float y=texCoord.y+sin(time+texCoord.x*(3.0))*0.15 ;'
    // .endl()+'           float y=smoothstep(-1.0,1.0,texCoord.x*sin(time+texCoord.x*3.0)*cos(texCoord.x) );'
    // .endl()+'           float y=texCoord.y;'

    .endl()+'           vec2 tc=vec2(x,y );'
    .endl()+'          col=texture2D(tex,tc);'

    .endl()+'      #endif'
    .endl()+'       col.a*=a;'
    .endl()+'   #endif'
    .endl()+'gl_FragColor = col;'
    .endl()+'}';


var shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

this.a=this.addInPort(new CABLES.Port(this,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
this.a.onChange=function()
{
    if(!self.a.uniform) self.a.uniform=new CGL.Uniform(shader,'f','a',self.a.val);
    else self.a.uniform.setValue(self.a.val);
};

this.a.val=1.0;

this.time=this.addInPort(new CABLES.Port(this,"time",CABLES.OP_PORT_TYPE_VALUE,{  }));
this.time.onChange=function()
{
    if(!self.time.uniform) self.time.uniform=new CGL.Uniform(shader,'f','time',self.a.val);
    else self.time.uniform.setValue(self.time.val);
};

this.time.val=1.0;


this.render.onTriggered=this.doRender;
this.texture=this.addInPort(new CABLES.Port(this,"texture",CABLES.OP_PORT_TYPE_TEXTURE));
this.textureUniform=null;

this.texture.onChange=function()
{

    if(self.texture.get())
    {
        if(self.textureUniform!==null)return;
        // console.log('TEXTURE ADDED');
        shader.removeUniform('tex');
        shader.define('HAS_TEXTURE_DIFFUSE');
        self.textureUniform=new CGL.Uniform(shader,'t','tex',0);
    }
    else
    {
        // console.log('TEXTURE REMOVED');
        shader.removeUniform('tex');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        self.textureUniform=null;
    }
};

this.doRender();
