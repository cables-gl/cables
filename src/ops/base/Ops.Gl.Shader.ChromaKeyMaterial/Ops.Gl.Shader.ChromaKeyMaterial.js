
var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION) );


op.texture=op.addInPort(new CABLES.Port(op,"texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
op.textureUniform=null;

var inMode=op.inValueSelect("Mode",["G","R"]);


var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var startTime=Date.now()/1000;

var doRender=function()
{
    // op.bindTextures();
    if(shader)
    {
        if(uniTime)uniTime.setValue(Date.now()/1000-startTime);
        cgl.setShader(shader);
        shader.bindTextures();
        trigger.trigger();
        cgl.setPreviousShader();
    }
};

var shader=new CGL.Shader(cgl,'MinimalMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

var shader_vert='{{MODULES_HEAD}}'
.endl()+'IN vec3 vPosition;'
.endl()+'UNI mat4 projMatrix;'
.endl()+'UNI mat4 mvMatrix;'
.endl()+'IN vec2 attrTexCoord;'
.endl()+'OUT mediump vec2 texCoord;'

.endl()+'#ifdef TEXTURE_REPEAT'
.endl()+'   UNI float diffuseRepeatX;'
.endl()+'   UNI float diffuseRepeatY;'
.endl()+'   UNI float texOffsetX;'
.endl()+'   UNI float texOffsetY;'
.endl()+'#endif'


.endl()+'void main()'
.endl()+'{'
.endl()+'   texCoord=vec2(attrTexCoord.x,1.0-attrTexCoord.y);'

.endl()+'   #ifdef TEXTURE_REPEAT'
.endl()+'       texCoord.s=texCoord.s*diffuseRepeatX+texOffsetX;'
.endl()+'       texCoord.t=texCoord.t*diffuseRepeatY+texOffsetY;'
.endl()+'   #endif'

.endl()+'   vec4 pos=vec4(vPosition,  1.0);'
.endl()+'   {{MODULE_VERTEX_POSITION}}'
.endl()+'   gl_Position = projMatrix * mvMatrix * pos;'
.endl()+'}'
.endl()+'';


var shader_frag='{{MODULE_BEGIN_FRAG}}'
.endl()+'precision highp float;'
.endl()+'UNI sampler2D tex;'
.endl()+'UNI float r;'
.endl()+'UNI float g;'
.endl()+'UNI float b;'
.endl()+'UNI float weightMul;'
.endl()+'UNI float white;'
.endl()+'UNI float time;'

.endl()+'IN mediump vec2 texCoord;'

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

.endl()+'float random(vec2 co)'
.endl()+'{'
.endl()+'   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * (43758.5453));'
.endl()+'}'

.endl()+'void main()'
.endl()+'{'
.endl()+'   vec4 col=vec4(1.0,1.0,0.0,1.0);'
.endl()+'   {{MODULE_COLOR}}'
.endl()+'   col=texture2D(tex,texCoord);'

.endl()+'#ifdef MODE_R'
.endl()+'   float maxrb = max( col.g, col.b );'
.endl()+'   float perc = min(1.0,(col.r*weightMul-maxrb)*2.0);'
.endl()+'#endif'

.endl()+'#ifdef MODE_G'
.endl()+'   float maxrb = max( col.r, col.b );'
.endl()+'   float perc = min(1.0,(col.g*weightMul-maxrb)*2.0);'
.endl()+'   col.g=min(maxrb,col.g);'
.endl()+'#endif'

.endl()+'   float len=length(col);'
.endl()+'   col=normalize(col)*len;'

.endl()+'   col.a=1.0-perc;'

 // JUST A TEST / REMOVE AGAIN
  // JUST A TEST / REMOVE AGAIN
   // JUST A TEST / REMOVE AGAIN
    // JUST A TEST / REMOVE AGAIN
     // JUST A TEST / REMOVE AGAIN
      // JUST A TEST / REMOVE AGAIN
       // JUST A TEST / REMOVE AGAIN
        // JUST A TEST / REMOVE AGAIN
         // JUST A TEST / REMOVE AGAIN
          // JUST A TEST / REMOVE AGAIN
           // JUST A TEST / REMOVE AGAIN
            // JUST A TEST / REMOVE AGAIN
// .endl()+'   if(col.a<=0.9){col.a=0.4;col.g=1.0;}'



.endl()+'   gl_FragColor = col;'
.endl()+'}'
.endl()+'';


shader.setSource(shader_vert,shader_frag);
shader.define('MODE_G');
//op.onLoaded=shader.compile;

shader.bindTextures=function()
{
    if(op.texture.get())
    {
        /* --- */cgl.setTexture(0, op.texture.val.tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, op.texture.val.tex);
    }
};

render.onTriggered=doRender;


var uniTime=new CGL.Uniform(shader,'f','time',0);

inMode.onChange=function()
{


    if(inMode.get()=="R")
    {
        shader.removeDefine('MODE_G');
        shader.define('MODE_R');
    }
    if(inMode.get()=="G")
    {
        shader.removeDefine('MODE_R');
        shader.define('MODE_G');
    }
};


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

var w=op.addInPort(new CABLES.Port(op,"weightMul",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));
w.set(0.6);
w.uniform=new CGL.Uniform(shader,'f','weightMul',w);

var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
r.set(0.467);
r.uniform=new CGL.Uniform(shader,'f','r',r);

var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));
g.set(0.836);
g.uniform=new CGL.Uniform(shader,'f','g',g);

var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
b.set(0.098);
b.uniform=new CGL.Uniform(shader,'f','b',b);

var white=op.addInPort(new CABLES.Port(op,"white",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
white.set(0.0);
white.uniform=new CGL.Uniform(shader,'f','white',white);





var diffuseRepeatX=op.addInPort(new CABLES.Port(op,"diffuseRepeatX",CABLES.OP_PORT_TYPE_VALUE));
var diffuseRepeatY=op.addInPort(new CABLES.Port(op,"diffuseRepeatY",CABLES.OP_PORT_TYPE_VALUE));
diffuseRepeatX.set(1);
diffuseRepeatY.set(1);

diffuseRepeatX.onValueChanged=updateTexRepeat;
diffuseRepeatY.onValueChanged=updateTexRepeat;


var diffuseOffsetX=op.addInPort(new CABLES.Port(op,"Tex Offset X",CABLES.OP_PORT_TYPE_VALUE));
var diffuseOffsetY=op.addInPort(new CABLES.Port(op,"Tex Offset Y",CABLES.OP_PORT_TYPE_VALUE));
diffuseOffsetX.set(0);
diffuseOffsetY.set(0);

diffuseOffsetY.onValueChanged=updateTexRepeat;
diffuseOffsetX.onValueChanged=updateTexRepeat;

var diffuseRepeatXUniform=null;
var diffuseRepeatYUniform=null;
var diffuseOffsetXUniform=null;
var diffuseOffsetYUniform=null;


function updateTexRepeat()
{
    if(diffuseRepeatY.get()!=1 ||
        diffuseRepeatX.get()!=1 ||
        diffuseOffsetY.get()!==0 ||
        diffuseOffsetX.get()!==0)
        {
            shader.define('TEXTURE_REPEAT');

            if(!diffuseRepeatXUniform)
            {
                diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX);
                diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY);
                diffuseOffsetXUniform=new CGL.Uniform(shader,'f','texOffsetX',diffuseOffsetX);
                diffuseOffsetYUniform=new CGL.Uniform(shader,'f','texOffsetY',diffuseOffsetY);
            }
        }
        else shader.removeDefine('TEXTURE_REPEAT');
}



doRender();
