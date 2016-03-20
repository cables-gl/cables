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



var srcCausticsHead=''
// .endl()+'// NOTE:'
// .endl()+'// This shader is based on the original work by Daniel Sanchez-Crespo'
// .endl()+'// of the Universitat Pompeu Fabra, Barcelona, Spain.'
.endl()+'uniform sampler2D lightMap;'
.endl()+'uniform float causticsTime;'
.endl()+''
.endl()+'#define VTXSIZE 0.0004   // Amplitude'
.endl()+''
.endl()+'#define WAVESIZE 13.0  // Frequency'
.endl()+''
.endl()+'#define FACTOR 1.0'
.endl()+'#define SPEED 2.0'
.endl()+'#define OCTAVES 4.0'
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
.endl()+'  for(int i=0;i<4;i++)'
.endl()+'  {'
.endl()+'    z -= factor * cos(timer * SPEED + (1.0/factor) * x * y * WAVESIZE);'
.endl()+'    factor = factor/2.0;'
.endl()+'    octaves--;'
// .endl()+'  } while (octaves > 0.0);'
.endl()+'  }'
.endl()+''
.endl()+'  return 2.0 * VTXSIZE * d * z;'
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
.endl()+'  for(int i=0;i<4;i++)'
.endl()+'  {'
.endl()+'    dZx += d * sin(timer * SPEED + (1.0/factor) * x * y * WAVESIZE) *'
.endl()+'             y * WAVESIZE - factor *'
.endl()+'             cos(timer * SPEED + (1.0/factor) * x * y * WAVESIZE) * x/d;'
.endl()+'    dZy += d * sin(timer * SPEED + (1.0/factor) * x * y * WAVESIZE) *'
.endl()+'             x * WAVESIZE - factor *'
.endl()+'             cos(timer * SPEED + (1.0/factor) * x * y * WAVESIZE) * y/d;'
.endl()+'    factor = factor/2.0;'
.endl()+'    octaves--;'
.endl()+'  }'
// .endl()+'  } while (octaves > 0.0);'
.endl()+''
.endl()+'  return vec2(2.0 * VTXSIZE * dZx, 2.0 * VTXSIZE * dZy);'
.endl()+'}'
.endl()+''
.endl()+''


.endl()+'vec3 line_plane_intercept(vec3 lineP, vec3 lineN, vec3 planeN, float  planeD)'
.endl()+'{'
// .endl()+'  // Unoptimized'
// .endl()+'   // float distance = (planeD - dot(planeN, lineP)) '
// .endl()+'   //                    dot(lineN, planeN);'
// .endl()+'   // Optimized (assumes planeN always points up)'
.endl()+'  '
.endl()+'  float distance = (planeD - lineP.z) / lineN.z;'
.endl()+'  return lineP + lineN * distance;'
.endl()+'}';

var srcCausticsColor=''
// .endl()+'// Generate a normal (line direction) from the gradient'
// .endl()+'// of the wave function and intercept with the water plane.'
// .endl()+'// We use screen-space z to attenuate the effect to avoid aliasing.'
.endl()+'vec2 dxdy = gradwave(vert.x, vert.y, causticsTime);'
.endl()+'vec3 intercept = line_plane_intercept( vert.xyz, vec3(dxdy, 1.0 /*saturate(vert.w) */), vec3(0, 0, 1), -0.8);'

// .endl()+'// OUTPUT'


.endl()+'col.rgb += vec3(texture2D(lightMap, intercept.xy * 0.8));'
// .endl()+'col.r = 1.0;'
// .endl()+'col.rgb += vec3(texture2D(lightMap, vec2(0.5,0.5)));'

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
        uniCausticsTime=new CGL.Uniform(shader,'f','causticsTime',0);
    }
    
    cgl.gl.activeTexture(cgl.gl.TEXTURE4);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, lightmap.get().tex);
    uniCausticsTime.setValue(Date.now()/1000.0-startTime);

    trigger.trigger();
}