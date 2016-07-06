op.name="ChromaKeyMaterial";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );

op.texture=op.addInPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
op.textureUniform=null;

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;


var doRender=function()
{
    // op.bindTextures();
    if(shader)
    {
        cgl.setShader(shader);
        shader.bindTextures();
        trigger.trigger();
        cgl.setPreviousShader();
        
    }
};

var shader=new CGL.Shader(cgl,'MinimalMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

var shader_vert='{{MODULES_HEAD}}'
.endl()+'attribute vec3 vPosition;'
.endl()+'uniform mat4 projMatrix;'
.endl()+'uniform mat4 mvMatrix;'
.endl()+'attribute vec2 attrTexCoord;'
.endl()+'varying mediump vec2 texCoord;'


.endl()+'void main()'
.endl()+'{'
.endl()+'  texCoord=vec2(attrTexCoord.x,1.0-attrTexCoord.y);'
.endl()+'  vec4 pos=vec4(vPosition,  1.0);'
.endl()+'  {{MODULE_VERTEX_POSITION}}'
.endl()+'  gl_Position = projMatrix * mvMatrix * pos;'
.endl()+'}'
.endl()+'';


var shader_frag='{{MODULE_BEGIN_FRAG}}'
.endl()+'precision highp float;'
.endl()+'uniform sampler2D tex;'
.endl()+'uniform float r;'
.endl()+'uniform float g;'
.endl()+'uniform float b;'
.endl()+'uniform float weightMul;'

.endl()+'varying mediump vec2 texCoord;'

.endl()+'vec3 rgb2hsv(vec4 rgb)'
.endl()+'{'
.endl()+'	float Cmax = max(rgb.r, max(rgb.g, rgb.b));'
.endl()+'	float Cmin = min(rgb.r, min(rgb.g, rgb.b));'
.endl()+'    float delta = Cmax - Cmin;'
.endl()+''
.endl()+'	vec3 hsv = vec3(0., 0., Cmax);'
.endl()+'	'
.endl()+'	if (Cmax > Cmin)'
.endl()+'	{'
.endl()+'		hsv.y = delta / Cmax;'

.endl()+'		if (rgb.r == Cmax)'
.endl()+'			hsv.x = (rgb.g - rgb.b) / delta;'
.endl()+'		else'
.endl()+'		{'
.endl()+'			if (rgb.g == Cmax)'
.endl()+'				hsv.x = 2. + (rgb.b - rgb.r) / delta;'
.endl()+'			else'
.endl()+'				hsv.x = 4. + (rgb.r - rgb.g) / delta;'
.endl()+'		}'
.endl()+'		hsv.x = fract(hsv.x / 6.);'
.endl()+'	}'
.endl()+'	return hsv;'
.endl()+'}'

.endl()+'float chromaKey(vec4 color)'
.endl()+'{'
.endl()+'	vec4 backgroundColor = vec4(r,g,b,0.0);'
.endl()+'	vec3 weights = vec3(4.*weightMul, 1., 2.*weightMul);'

.endl()+'	vec3 hsv = rgb2hsv(color);'
.endl()+'	vec3 target = rgb2hsv(backgroundColor);'
.endl()+'	float dist = length(weights * (target - hsv));'
.endl()+'	return 1. - clamp(3. * dist - 1.5, 0., 1.);'
.endl()+'}'



.endl()+''
.endl()+'void main()'
.endl()+'{'
.endl()+'  vec4 col=vec4(1.0,1.0,0.0,1.0);'
.endl()+'  {{MODULE_COLOR}}'
.endl()+'  col=texture2D(tex,texCoord);'
// .endl()+'  if(col.g>0.25 && (col.r+col.g+col.b)<2.0)col.a=0.0;'
// .endl()+'  if(col.g>0.25 && (col.r+col.g+col.b)/3.0<0.5)col.a=0.0;'

.endl()+'	float incrustation = chromaKey(col);'
// .endl()+'	col = mix(col, vec4(0.0,0.0,0.0,0.0), incrustation);'
// .endl()+'	col.r = incrustation;'
// .endl()+'	col.g = incrustation;'
// .endl()+'	col.b = incrustation;'
.endl()+'	col.a = 1.0-incrustation;'

.endl()+'  gl_FragColor = col;'
.endl()+'}'
.endl()+'';


shader.setSource(shader_vert,shader_frag);
op.onLoaded=shader.compile;

shader.bindTextures=function()
{
    if(op.texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, op.texture.val.tex);
    }
};

render.onTriggered=doRender;

doRender();


op.texture.onValueChanged=function()
{
    if(op.texture.get())
    {
        if(op.textureUniform!==null)return;
        shader.removeUniform('tex');
        shader.define('HAS_TEXTURE_DIFFUSE');
        op.textureUniform=new CGL.Uniform(shader,'t','tex',0);
    }
    else
    {
        shader.removeUniform('tex');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        op.textureUniform=null;
    }
};

var w=op.addInPort(new Port(op,"weightMul",OP_PORT_TYPE_VALUE,{ display:'range'}));
w.set(0.6);
w.uniform=new CGL.Uniform(shader,'f','weightMul',w);



var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
r.set(0.467);
r.uniform=new CGL.Uniform(shader,'f','r',r);

var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range'}));
g.set(0.836);
g.uniform=new CGL.Uniform(shader,'f','g',g);

var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
b.set(0.098);
r.uniform=new CGL.Uniform(shader,'f','b',b);

