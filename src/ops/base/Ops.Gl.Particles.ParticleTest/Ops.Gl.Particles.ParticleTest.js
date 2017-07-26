this.name="particletest";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));


// var texOut=this.addOutPort(new Port(this,"compute tex",OP_PORT_TYPE_TEXTURE,{preview:true}));
var texOut=op.outTexture("compute tex");


var effect=new CGL.TextureEffect(cgl);

var tex=new CGL.Texture(cgl);
tex.filter=CGL.Texture.FILTER_NEAREST;
tex.setSize(1024,1024);
effect.setSourceTexture(tex);

// 
// http://blog.bongiovi.tw/webgl-gpu-particle-stream/
// 

var srcVert=''
    .endl()+'attribute float attrVertIndex;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'
    .endl()+'attribute vec3 vPosition;'
    .endl()+'varying float num;'

    .endl()+'attribute vec2 attrTexCoord;'
    .endl()+'varying vec2 texCoord;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   texCoord=attrTexCoord;'
    .endl()+'   num=attrVertIndex;'
    .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying float num;'
    .endl()+'uniform float numVertices;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'varying vec2 texCoord;'

    .endl()+'float texWidth=1024.0;'
    .endl()+'float texHeight=1024.0;'
    
    .endl()+'void main()'
    .endl()+'{'

    .endl()+'  float n=gl_FragCoord.x + gl_FragCoord.y*texWidth;'

    .endl()+'  if(n<1024.0) gl_FragColor = vec4(1.0,0.0,texCoord.y,1.0);'
    .endl()+'      else gl_FragColor = vec4(0.0,0.0,texCoord.y,1.0);'
    .endl()+'}';



var doRender=function()
{
    effect.startEffect();
    cgl.setShader(shader);
    effect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, effect.getCurrentSourceTexture().tex );

    effect.finish();
    cgl.setPreviousShader();

    texOut.set(effect.getCurrentSourceTexture());
    
    effect.endEffect();

    trigger.trigger();
};

var shader=new CGL.Shader(cgl,'vertexnumber material');
shader.setSource(srcVert,srcFrag);
this.onLoaded=shader.compile;

render.onTriggered=doRender;

// doRender();







