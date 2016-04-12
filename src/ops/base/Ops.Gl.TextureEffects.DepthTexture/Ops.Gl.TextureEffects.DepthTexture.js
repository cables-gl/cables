var cgl=this.patch.cgl;

this.name='DepthTexture';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var image=this.addInPort(new Port(this,"image",OP_PORT_TYPE_TEXTURE));
var farPlane=this.addInPort(new Port(this,"farplane",OP_PORT_TYPE_VALUE));
var nearPlane=this.addInPort(new Port(this,"nearplane",OP_PORT_TYPE_VALUE));

farPlane.set(100.0);
nearPlane.set(0.1);

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
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

    // .endl()+'       if(c>=0.999)col.a=0.0;'
    // .endl()+'           else col.a=1.0;'
    .endl()+'   #endif'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniFarplane=new CGL.Uniform(shader,'f','f',1.0);
var uniNearplane=new CGL.Uniform(shader,'f','n',1.0);

farPlane.onValueChanged=function(){ uniFarplane.setValue(farPlane.get()); };

nearPlane.onValueChanged=function(){ uniNearplane.setValue(nearPlane.get()); };

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