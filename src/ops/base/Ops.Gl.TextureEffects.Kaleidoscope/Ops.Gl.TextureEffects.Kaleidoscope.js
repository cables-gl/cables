op.name="Kaleidoscope";

var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));

var sides=op.inValue("Sides",10);
var angle=op.inValueSlider("Angle",0);
var slidex=op.inValueSlider("Slide X",0);
var slidey=op.inValueSlider("Slide Y",0);
var centerX=op.inValueSlider("Center X",0.5);
var centerY=op.inValueSlider("Center Y",0.5);

var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var unisides=new CGL.Uniform(shader,'f','sides',sides);
var uniangle=new CGL.Uniform(shader,'f','angle',angle);
var unislidex=new CGL.Uniform(shader,'f','slidex',slidex);
var unislidey=new CGL.Uniform(shader,'f','slidey',slidey);
var uniCenterX=new CGL.Uniform(shader,'f','centerX',centerX);
var uniCenterY=new CGL.Uniform(shader,'f','centerY',centerY);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'

    .endl()+'uniform float sides;'
    .endl()+'uniform float angle;'

    .endl()+'uniform float slidex;'
    .endl()+'uniform float slidey;'
    .endl()+'uniform float centerX;'
    .endl()+'uniform float centerY;'

    .endl()+'const float tau = 6.28318530718;'

    .endl()+'void main()'
    .endl()+'{'
//     .endl()+'   vec4 base=texture2D(tex,texCoord);'

// 	.endl()+'   vec4 inputRange = min(max(base - vec4(inMin), vec4(0.0)) / (vec4(inMax) - vec4(inMin)), vec4(1.0));'
// 	.endl()+'   inputRange = pow(inputRange, vec4(1.0 / (1.5 - midPoint)));'

// 	.endl()+'   gl_FragColor = mix(vec4(outMin), vec4(outMax), inputRange);'


    .endl()+'vec2 center=vec2(centerX,centerY);'

// 	.endl()+'vec2 loc = 1.0 * vec2(isf_FragNormCoord[0],isf_FragNormCoord[1]);'
	.endl()+'vec2 loc = texCoord;'
	.endl()+'float r = distance(center, loc);'
	.endl()+'float a = atan ((loc.y-center.y),(loc.x-center.x));'

	// kaleidoscope
	.endl()+'a = mod(a, tau/sides);'
	.endl()+'a = abs(a - tau/sides/2.);'

	.endl()+'loc.x = r * cos(a + tau * angle);'
	.endl()+'loc.y = r * sin(a + tau * angle);'

	.endl()+'loc = (center + loc) *2.1;'

// 	.endl()+'loc.y = (loc.y-0.5)*3.7777+0.5;'
// 	.endl()+'loc = (center + loc) *3.97777;'

	.endl()+'loc.x = mod(loc.x + slidex, 1.0);'
	.endl()+'loc.y = mod(loc.y + slidey, 1.0);'

	// sample the image
	.endl()+'if(loc.x < 0.0)loc.x = mod(abs(loc.x),1.0);'
	.endl()+'if(loc.y < 0.0)loc.y = mod(abs(loc.y),1.0);'

	.endl()+'if(loc.x > 1.0) loc.x = mod(abs(1.0-loc.x),1.0);'
	.endl()+'if(loc.y > 1.0) loc.y = mod(abs(1.0-loc.y),1.0);'
	


// 	.endl()+'gl_FragColor = IMG_NORM_PIXEL(inputImage, loc);'
	.endl()+'gl_FragColor = texture2D(tex,loc);'

    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
