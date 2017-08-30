op.name='Hue';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var hue=op.addInPort(new Port(op,"hue",OP_PORT_TYPE_VALUE,{display:'range'}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

hue.set(1.0);
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float hue;'
    .endl()+''

    .endl()+'vec3 rgb2hsv(vec3 c)'
    .endl()+'{'
    .endl()+'    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);'
    .endl()+'    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));'
    .endl()+'    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));'
    .endl()+''
    .endl()+'    float d = q.x - min(q.w, q.y);'
    .endl()+'    float e = 1.0e-10;'
    .endl()+'    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);'
    .endl()+'}'

    .endl()+'vec3 hsv2rgb(vec3 c)'
    .endl()+'{'
    .endl()+'    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);'
    .endl()+'    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);'
    .endl()+'    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'

    .endl()+'       vec3 hsv = rgb2hsv(col.rgb);'
    .endl()+'       hsv.x=hsv.x+hue;'
    .endl()+'       col.rgb = hsv2rgb(hsv);'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniformHue=new CGL.Uniform(shader,'f','hue',1.0);

hue.onValueChanged=function(){ uniformHue.setValue(hue.get()); };

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
