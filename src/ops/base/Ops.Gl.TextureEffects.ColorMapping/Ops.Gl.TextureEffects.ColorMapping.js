
op.name='ColorLookup';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var image=op.addInPort(new Port(op,"image",OP_PORT_TYPE_TEXTURE));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform sampler2D image;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 colOrig=texture2D(tex,texCoord);'

    .endl()+'   float gray = dot(vec3(0.2126,0.7152,0.0722), colOrig.rgb );'

    .endl()+'   #ifdef VERT'
    .endl()+'   gl_FragColor = texture2D(image,vec2(texCoord.x,gray));'
    .endl()+'   #endif'

    .endl()+'   #ifdef HORI'
    .endl()+'   gl_FragColor = texture2D(image,vec2(gray,texCoord.x));'
    .endl()+'   #endif'

    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(image.get() && image.get().tex)
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
