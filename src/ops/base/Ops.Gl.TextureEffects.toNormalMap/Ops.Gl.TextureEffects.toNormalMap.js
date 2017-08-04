op.name="toNormalMap";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var strength=op.inValue("Strength",4);
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;


// from: https://forum.openframeworks.cc/t/compute-normal-map-from-image/1400/11


var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+''
    .endl()+'  uniform float strength;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    
    .endl()+'float texelSize=1.0/1024.0;'

    .endl()+'float tl = abs(texture2D(tex, texCoord + texelSize * vec2(-1.0, -1.0)).x);   // top left'
    .endl()+'float  l = abs(texture2D(tex, texCoord + texelSize * vec2(-1.0,  0.0)).x);   // left'
    .endl()+'float bl = abs(texture2D(tex, texCoord + texelSize * vec2(-1.0,  1.0)).x);   // bottom left'
    .endl()+'float  t = abs(texture2D(tex, texCoord + texelSize * vec2( 0.0, -1.0)).x);   // top'
    .endl()+'float  b = abs(texture2D(tex, texCoord + texelSize * vec2( 0.0,  1.0)).x);   // bottom'
    .endl()+'float tr = abs(texture2D(tex, texCoord + texelSize * vec2( 1.0, -1.0)).x);   // top right'
    .endl()+'float  r = abs(texture2D(tex, texCoord + texelSize * vec2( 1.0,  0.0)).x);   // right'
    .endl()+'float br = abs(texture2D(tex, texCoord + texelSize * vec2( 1.0,  1.0)).x);   // bottom right'

//     // Compute dx using Sobel:
//     //           -1 0 1 
//     //           -2 0 2
//     //           -1 0 1
.endl()+'float dX = tr + 2.0*r + br -tl - 2.0*l - bl;'
 
//     // Compute dy using Sobel:
//     //           -1 -2 -1 
//     //            0  0  0
//     //            1  2  1
.endl()+'float dY = bl + 2.0*b + br -tl - 2.0*t - tr;'
 
//     // Build the normalized normal

.endl()+'vec4 N = vec4(normalize(vec3(dX,dY, 1.0 / strength)), 1.0);'
 
//     //convert (-1.0 , 1.0) to (0.0 , 1.0), if needed
.endl()+'N= N * 0.5 + 0.5;'

    .endl()+'   gl_FragColor = N;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniStrength=new CGL.Uniform(shader,'f','strength',strength);

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

// float textureSize = 256.0f;
// float texelSize =  1.0f / textureSize ; //size of one texel;
// float normalStrength = 8;
 
// float4 ComputeNormalsPS(in float2 uv:TEXCOORD0) : COLOR
//     {
//     float tl = abs(tex2D (displacementSampler, uv + texelSize * float2(-1, -1)).x);   // top left
//     float  l = abs(tex2D (displacementSampler, uv + texelSize * float2(-1,  0)).x);   // left
//     float bl = abs(tex2D (displacementSampler, uv + texelSize * float2(-1,  1)).x);   // bottom left
//     float  t = abs(tex2D (displacementSampler, uv + texelSize * float2( 0, -1)).x);   // top
//     float  b = abs(tex2D (displacementSampler, uv + texelSize * float2( 0,  1)).x);   // bottom
//     float tr = abs(tex2D (displacementSampler, uv + texelSize * float2( 1, -1)).x);   // top right
//     float  r = abs(tex2D (displacementSampler, uv + texelSize * float2( 1,  0)).x);   // right
//     float br = abs(tex2D (displacementSampler, uv + texelSize * float2( 1,  1)).x);   // bottom right
 
//     // Compute dx using Sobel:
//     //           -1 0 1 
//     //           -2 0 2
//     //           -1 0 1
//     float dX = tr + 2*r + br -tl - 2*l - bl;
 
//     // Compute dy using Sobel:
//     //           -1 -2 -1 
//     //            0  0  0
//     //            1  2  1
//     float dY = bl + 2*b + br -tl - 2*t - tr;
 
//     // Build the normalized normal
//     float4 N = float4(normalize(float3(dX, 1.0f / normalStrength, dY)), 1.0f);
 
//     //convert (-1.0 , 1.0) to (0.0 , 1.0), if needed
//     return N * 0.5f + 0.5f;
// }