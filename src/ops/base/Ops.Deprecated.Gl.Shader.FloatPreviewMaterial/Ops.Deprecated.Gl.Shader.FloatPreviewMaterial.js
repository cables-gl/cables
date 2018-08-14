this.name="fp material";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var texture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));

var srcVert=''
    .endl()+'IN float attrVertIndex;'
    .endl()+'IN vec2 attrTexCoord;'
    .endl()+'UNI mat4 projMatrix;'
    .endl()+'UNI mat4 mvMatrix;'
    .endl()+'IN vec3 vPosition;'
    .endl()+'OUT float num;'
    .endl()+'OUT vec2 texCoord;'


    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   texCoord=attrTexCoord;'
    .endl()+'   num=attrVertIndex;'
    .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';

var srcFrag=''
    .endl()+'precision highp float;'

    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D tex;'
    .endl()+'IN float num;'
    .endl()+'UNI float numVertices;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(tex,vec2(texCoord.x,(1.0-texCoord.y)))/2.0;'
    .endl()+'   col.a=1.0;'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

var shader=new CGL.Shader(cgl,'fp preview material');
shader.setSource(srcVert,srcFrag);

var doRender=function()
{
    cgl.setShader(shader);

    if(texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.get().tex);
    }

    trigger.trigger();
    cgl.setPreviousShader();
};




var textureUniform=new CGL.Uniform(shader,'t','tex',0);
texture.onValueChanged=function()
{
    if(texture.get())
    {
        if(textureUniform!==null)return;
        shader.removeUniform('tex');
        // shader.define('HAS_TEXTURE_DIFFUSE');
        textureUniform=new CGL.Uniform(shader,'t','tex',0);
    }
};



render.onTriggered=doRender;

doRender();
