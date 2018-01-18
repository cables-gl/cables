
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var image=op.addInPort(new Port(op,"image",OP_PORT_TYPE_TEXTURE));
var farPlane=op.addInPort(new Port(op,"farplane",OP_PORT_TYPE_VALUE));
var nearPlane=op.addInPort(new Port(op,"nearplane",OP_PORT_TYPE_VALUE));

farPlane.set(100.0);
nearPlane.set(0.1);

var cgl=op.patch.cgl;
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D image;'
    .endl()+'#endif'
    .endl()+'uniform float n;'
    .endl()+'uniform float f;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(image,texCoord);'
    .endl()+'       float z=col.r;'
    .endl()+'       float c=(2.0*n)/(f+n-z*(f-n));'

    .endl()+'       col=vec4(c,c,c,1.0);'

    .endl()+'   #endif'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniFarplane=new CGL.Uniform(shader,'f','f',farPlane);
var uniNearplane=new CGL.Uniform(shader,'f','n',nearPlane);


render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(image.val && image.val.tex)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};