var self=this;
var cgl=this.patch.cgl;

this.name='SaltedPerceptionMaterial';

this.zBufferTex=this.addInPort(new Port(this,"zBufferTexture",OP_PORT_TYPE_TEXTURE));

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.doRender=function()
{
    cgl.setShader(shader);

    if(self.zBufferTex.val)
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.zBufferTex.val.tex);
    }

    self.trigger.call();
    cgl.setPreviousShader();
};


var shader_vert=""
    .endl()+'attribute vec3 vPosition;'
    .endl()+'attribute vec2 attrTexCoord;'
    .endl()+'attribute vec3 attrVertNormal;'

    .endl()+'precision highp float;'
    // .endl()+"uniform mat4 projMatrix,viewMatrix,modelMatrix;"
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'

    .endl()+"uniform float time;"
    .endl()+"uniform float zscale;"

    // .endl()+"attribute vec3 Position;"
    .endl()+"attribute vec3 Normal;"
    .endl()+"varying  vec2 texcoord;"
    // .endl()+"attribute vec2 TexCoordIn;"

    .endl()+'varying vec3 norm;'

    .endl()+"uniform sampler2D texDepth;"
    .endl()+"void main(void)"
    .endl()+"{"
    // .endl()+"   mat4 modelViewMatrix = viewMatrix*modelMatrix;"
    .endl()+'   norm=attrVertNormal;'
    .endl()+"   texcoord=attrTexCoord;"
    .endl()+"   float offX=1.0/640.0;"
    .endl()+"   float offY=1.0/480.0;"
    .endl()+"   vec4 texCol= 0.2*texture2D(texDepth, vec2(1.0-texcoord.s,1.0-texcoord.t));"
    .endl()+"   texCol+=0.2* texture2D(texDepth, vec2(1.0-texcoord.s+offX,1.0-texcoord.t+offY));"
    .endl()+"   texCol+=0.2* texture2D(texDepth, vec2(1.0-texcoord.s-offX,1.0-texcoord.t-offY));"
    .endl()+"   texCol+=0.2* texture2D(texDepth, vec2(1.0-texcoord.s+offX,1.0-texcoord.t-offY));"
    .endl()+"   texCol+=0.2* texture2D(texDepth, vec2(1.0-texcoord.s-offX,1.0-texcoord.t+offY));"

    .endl()+"   vec3 vertex=vPosition;"

    .endl()+"   vertex.z+=zscale*(texCol.r*190.0+sin(texCol.r*8.0+time*2.0)*5.0+sin(vertex.y+texture2D(texDepth,texcoord).r*10.0));"
    .endl()+"   texCol.b=0.0;"
    .endl()+"   gl_Position = projMatrix * mvMatrix * vec4(vertex,1.0);"
    .endl()+"}";


var shader_frag=""
    .endl()+'precision highp float;'
    .endl()+"uniform sampler2D texColor;"
    .endl()+"uniform sampler2D texDepth;"

    .endl()+"uniform float time;"
    .endl()+"varying  vec2 texcoord;"
    .endl()+"void main(){ "
    .endl()+"vec4 color=texture2D(texDepth, vec2(1.0-texcoord.s,1.0-texcoord.t));"
    .endl()+"color.a=1.0;"
    .endl()+"//float d= texture2D(texDepth, vec2(1.0-texcoord.s,texcoord.t)).r;"
    .endl()+"//if(d==1.0)color=vec4(0.0,0.0,0.0,0.0);"
    .endl()+"gl_FragColor = color;"
    .endl()+"}";

var shader=new CGL.Shader(cgl);
shader.setSource(shader_vert,shader_frag);



this.zBufferTexUniform=null;

this.zBufferTex.onValueChanged=function()
{

    if(self.zBufferTex.val)
    {
        if(self.zBufferTexUniform!==null)return;
        // console.log('TEXTURE ADDED');
        shader.removeUniform('texDepth');
        shader.define('HAS_TEXTURE_DIFFUSE');
        self.zBufferTexUniform=new CGL.Uniform(shader,'t','texDepth',0);
    }
    else
    {
        // console.log('TEXTURE REMOVED');
        shader.removeUniform('texDepth');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        self.zBufferTexUniform=null;
    }
};

this.zScale=this.addInPort(new Port(this,"zscale",OP_PORT_TYPE_VALUE));
this.zScale.onValueChanged=function()
{
    if(!self.zScale.uniform) self.zScale.uniform=new CGL.Uniform(shader,'f','zscale',self.zScale.val);
    else self.zScale.uniform.setValue(self.zScale.val);
};



this.time=this.addInPort(new Port(this,"time",OP_PORT_TYPE_VALUE));
this.time.onValueChanged=function()
{
    if(!self.time.uniform) self.time.uniform=new CGL.Uniform(shader,'f','time',self.time.val);
    else self.time.uniform.setValue(self.time.val);
};


this.zScale.val=1.0;

this.render.onTriggered=this.doRender;
this.doRender();
