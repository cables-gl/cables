this.name="Ops.Gl.Shader.Caustics";

var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var lightmap=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
var lightmapUniform=null;


var mod=null;
var shader=null;
var uniCausticsTime=null;
render.onTriggered=doRender;


var pOpacity=this.addInPort(new Port(this,"opacity",OP_PORT_TYPE_VALUE));

var pAmplitude=this.addInPort(new Port(this,"amplitude",OP_PORT_TYPE_VALUE));
var pFrequency=this.addInPort(new Port(this,"frequency",OP_PORT_TYPE_VALUE));
var pRepeat=this.addInPort(new Port(this,"repeat",OP_PORT_TYPE_VALUE));
pRepeat.set(1.0);
pOpacity.set(1.0);

var uniAmplitude=null;
var uniFrequency=null;
var uniRepeat=null;
var uniOpacity=null;

pOpacity.onValueChange(function(){
    if(uniOpacity)
    {
        uniOpacity.setValue(parseFloat(pOpacity.get()));
    }
});

pRepeat.onValueChange(function(){
    if(uniRepeat)
    {
        uniRepeat.setValue(parseFloat(pRepeat.get()));
    }
});

pAmplitude.onValueChange(function(){
    if(uniAmplitude)
    {
        uniAmplitude.setValue(parseFloat(pAmplitude.get()));
    }
});

pFrequency.onValueChange(function(){
    if(uniFrequency)
    {
        uniFrequency.setValue(parseFloat(pFrequency.get()));
    }
});


var startTime=Date.now()/1000;

function doRender()
{
    if(cgl.getShader() && cgl.getShader()!=shader)
    {
        if(shader && mod)
        {
            shader.removeModule(mod);
            shader=null;
        }

        shader=cgl.getShader();

        mod=shader.addModule(
            {
                name: 'MODULE_COLOR',
                srcHeadFrag: srcCausticsHead,
                srcBodyFrag: srcCausticsColor
            });
        lightmapUniform=new CGL.Uniform(shader,'t','lightMap',4);
        uniCausticsTime=new CGL.Uniform(shader,'f',mod.prefix+'_time',0);
        
        uniFrequency=new CGL.Uniform(shader,'f',mod.prefix+'_frequency',pFrequency.get());
        uniAmplitude=new CGL.Uniform(shader,'f',mod.prefix+'_amplitude',pAmplitude.get());
        uniRepeat=new CGL.Uniform(shader,'f',mod.prefix+'_repeat',pRepeat.get());
        uniOpacity=new CGL.Uniform(shader,'f',mod.prefix+'_opacity',pOpacity.get());
    }
    
    cgl.gl.activeTexture(cgl.gl.TEXTURE4);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, lightmap.get().tex);
    uniCausticsTime.setValue(Date.now()/1000.0-startTime);

    trigger.trigger();
}




var srcCausticsHead=''
// NOTE:'
// http://http.developer.nvidia.com/GPUGems/gpugems_ch02.html
// This shader is based on the original work by Daniel Sanchez-Crespo'
// of the Universitat Pompeu Fabra, Barcelona, Spain.'
.endl()+'uniform sampler2D lightMap;'
.endl()+'uniform float {{mod}}_time;'
.endl()+''
.endl()+'uniform float {{mod}}_frequency;'
.endl()+'uniform float {{mod}}_amplitude;'
.endl()+'uniform float {{mod}}_repeat;'
.endl()+'uniform float {{mod}}_opacity;'

// .endl()+'#define VTXSIZE 0.0004   // Amplitude'
// .endl()+'#define WAVESIZE 13.0  // Frequency'
.endl()+''
.endl()+'#define FACTOR 1.0'
.endl()+'#define SPEED 2.0'
.endl()+'#define OCTAVES 3.0'
.endl()+''
.endl()+''
// .endl()+'// Example of the same wave function used in the vertex engine'
.endl()+''
.endl()+'float wave(float x, float y, float timer)'
.endl()+'{'
.endl()+'  float z = 0.0;'
.endl()+'  float octaves = OCTAVES;'
.endl()+'  float factor = FACTOR;'
.endl()+'  float d = sqrt(x * x + y * y);'
.endl()+''
// .endl()+'  do {'
// .endl()+'  for(int i=0;i<14;i++)'
.endl()+'  {'
// .endl()+'       if(octaves>0.0)'
.endl()+'       {'
.endl()+'    z -= factor * cos(timer * SPEED + (1.0/factor) * x  * {{mod}}_frequency);'
.endl()+'    factor = factor/2.0;'
.endl()+'    octaves--;'
// .endl()+'  } while (octaves > 0.0);'
.endl()+'       }'
.endl()+'  }'
.endl()+''
.endl()+'  return 2.0 * {{mod}}_amplitude *z;'
.endl()+'}'
.endl()+''
// .endl()+'// This is a derivative of the above wave function.'
// .endl()+'// It returns the d(wave)/dx and d(wave)/dy partial derivatives.'
.endl()+''
.endl()+'vec2 gradwave(float x, float y, float timer)'
.endl()+'{'
.endl()+'  float dZx = 0.0;'
.endl()+'  float dZy = 0.0;'
.endl()+'  float octaves = OCTAVES;'
.endl()+'  float factor = FACTOR;'
.endl()+'  float d = sqrt(x * x + y * y);'
.endl()+''
// .endl()+'  do'
.endl()+'  for(int i=0;i<14;i++)'
.endl()+'  {'
.endl()+'       if(octaves>0.0)'
.endl()+'       {'
.endl()+'    dZx += d * sin(timer * SPEED + (1.0/factor) * x * y * {{mod}}_frequency) *'
.endl()+'             y * {{mod}}_frequency - factor *'
.endl()+'             cos(timer * SPEED + (1.0/factor) * x * y * {{mod}}_frequency) * x/d;'
.endl()+'    dZy += d * sin(timer * SPEED + (1.0/factor) * x * y * {{mod}}_frequency) *'
.endl()+'             x * {{mod}}_frequency - factor *'
.endl()+'             cos(timer * SPEED + (1.0/factor) * x * y * {{mod}}_frequency) * y/d;'
.endl()+'    factor = factor/2.0;'
.endl()+'    octaves--;'
.endl()+'       }'
.endl()+'  }'
// .endl()+'  } while (octaves > 0.0);'
.endl()+''
.endl()+'  return vec2(2.0 * {{mod}}_amplitude * dZx, 2.0 * {{mod}}_amplitude * dZy);'
.endl()+'}'
.endl()+''


.endl()+'vec3 line_plane_intercept(vec3 lineP, vec3 lineN, vec3 planeN, float  planeD)'
.endl()+'{'
// .endl()+'  // Unoptimized'
.endl()+'    float distance = (planeD - dot(planeN, lineP))/dot(lineN, planeN); '

// .endl()+'   // Optimized (assumes planeN always points up)'
// .endl()+'  '
// .endl()+'  float distance = (planeD - lineP.z) / lineN.z;'
.endl()+'  return lineP + lineN * distance;'
.endl()+'}';

var srcCausticsColor=''
// .endl()+'// Generate a normal (line direction) from the gradient'
// .endl()+'// of the wave function and intercept with the water plane.'
// .endl()+'// We use screen-space z to attenuate the effect to avoid aliasing.'

.endl()+'vec4 tvert=modelMatrix*vec4(vert,1.0);'

.endl()+'vec2 dxdy = vec2(wave(tvert.x, tvert.y, {{mod}}_time));'
.endl()+'vec3 intercept = line_plane_intercept( tvert.xzy, vec3(dxdy, 1.0) , vec3(0, 0,1), -0.8);'

.endl()+'intercept.x+={{mod}}_time*1.0;'
// .endl()+'// OUTPUT'

.endl()+'   float saturation = 0.25+vec3(dot(vec3(0.2126,0.7152,0.0722), col.rgb)).r;'

.endl()+'col.rgb += {{mod}}_opacity*saturation*vec3(texture2D(lightMap, intercept.xy*{{mod}}_repeat ));'
// .endl()+'col.r = 1.0;'
// .endl()+'col.rgb += vec3(texture2D(lightMap, vec2(0.5,0.5)));'
