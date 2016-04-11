var self=this;
var cgl=this.patch.cgl;

// use this: https://www.shadertoy.com/view/XsX3zB

this.name='SimplexNoise';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

var smoothness=this.addInPort(new Port(this,"smoothness",OP_PORT_TYPE_VALUE,{  }));
var scale=this.addInPort(new Port(this,"scale",OP_PORT_TYPE_VALUE,{  }));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE,{  }));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE,{  }));
var time=this.addInPort(new Port(this,"time",OP_PORT_TYPE_VALUE,{  }));

time.set(0.314);
smoothness.set(130.0);
scale.set(1.0);
x.set(0);
y.set(0);

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float smoothness;'
    .endl()+'uniform float scale;'
    .endl()+'uniform float seed;'
    .endl()+'uniform float x;'
    .endl()+'uniform float y;'
    .endl()+'uniform float time;'
    .endl()+''
    .endl()+'vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }'
    .endl()+''
    .endl()+'float snoise(vec2 v){'
    .endl()+'  vec4 C = vec4(0.211324865405187, 0.366025403784439,-0.577350269189626, time);'
    .endl()+'  vec2 i  = floor(v + dot(v, C.yy) );'
    .endl()+'  vec2 x0 = v -   i + dot(i, C.xx);'
    .endl()+'  vec2 i1;'
    .endl()+'  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);'
    .endl()+'  vec4 x12 = x0.xyxy + C.xxzz;'
    .endl()+'  x12.xy -= i1;'
    .endl()+'  i = mod(i, 289.0);'
    .endl()+'  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))'
    .endl()+'  + i.x + vec3(0.0, i1.x, 1.0 ));'
    .endl()+'  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);'
    .endl()+'  m = m*m ;'
    .endl()+'  m = m*m ;'
    .endl()+'  vec3 x = 2.0 * fract(p * C.www) - 1.0;'
    .endl()+'  vec3 h = abs(x) - 0.5;'
    .endl()+'  vec3 ox = floor(x + 0.5);'
    .endl()+'  vec3 a0 = x - ox;'
    .endl()+'  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );'
    .endl()+'  vec3 g;'
    .endl()+'  g.x  = a0.x  * x0.x  + h.x  * x0.y;'
    .endl()+'  g.yz = a0.yz * x12.xz + h.yz * x12.yw;'
    .endl()+'  return smoothness * dot(m, g);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    
    .endl()+'   vec2 p=vec2(texCoord.x+x-0.5,texCoord.y+y-0.5);'
    .endl()+'   p=p*scale;'
    .endl()+'   p=vec2(p.x+0.5,p.y+0.5);'
    
    .endl()+'   float v=snoise(p);'
    .endl()+'   vec4 col=vec4(v,v,v,1.0);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniSmoothness=new CGL.Uniform(shader,'f','smoothness',smoothness.get());
var uniScale=new CGL.Uniform(shader,'f','scale',scale.get());
var uniX=new CGL.Uniform(shader,'f','x',x.get());
var uniY=new CGL.Uniform(shader,'f','y',y.get());
var uniTime=new CGL.Uniform(shader,'f','time',time.get());

x.onValueChanged=function() { uniX.setValue(x.get()/100); };
y.onValueChanged=function(){ uniY.setValue(y.get()/100); };
time.onValueChanged=function(){ uniTime.setValue(time.get()/100); };

smoothness.onValueChanged=function(){ uniSmoothness.setValue(smoothness.get());};
scale.onValueChanged=function(){ uniScale.setValue(scale.get()); };

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
