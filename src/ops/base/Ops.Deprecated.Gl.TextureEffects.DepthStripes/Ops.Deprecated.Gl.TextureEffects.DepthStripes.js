op.name="DepthStripes";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var depthTexture=op.addInPort(new Port(op,"Depth Texture",OP_PORT_TYPE_TEXTURE));
var colorTexture=op.addInPort(new Port(op,"Color Texture",OP_PORT_TYPE_TEXTURE));
var farPlane=op.addInPort(new Port(op,"farplane",OP_PORT_TYPE_VALUE));
var nearPlane=op.addInPort(new Port(op,"nearplane",OP_PORT_TYPE_VALUE));

farPlane.set(100.0);
nearPlane.set(0.1);

var cgl=op.patch.cgl;
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D depthTex;'
    .endl()+'  uniform sampler2D colorTex;'
    .endl()+'#endif'
    .endl()+'uniform float n;'
    .endl()+'uniform float f;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(depthTex,texCoord);'
    
    .endl()+'       float z=col.r;'
    .endl()+'       float c=(2.0*n)/(f+n-z*(f-n));'
    // .endl()+'       if(c<25.0)col=texture2D(colorTex,texCoord+(c-0.5)*0.1);'
    // .endl()+'       else col=texture2D(colorTex,texCoord);'

    .endl()+'       c=mod(sin(2.0*c)*2.0,0.01+cos(2.0*texCoord.x-0.5)*2.0*0.01*sin(texCoord.y-0.5)*1.0*0.01)*100.0;'
    
    .endl()+'       if(c>0.5)c=1.0-c;'
    .endl()+'       col=vec4(c,c,c,1.0);'
    // .endl()+'       if(z>0.999) col=vec4(1.0,0.0,00.0,1.0);'
    .endl()+'   #endif'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','depthTex',0);
var textureUniform=new CGL.Uniform(shader,'t','colorTex',1);

var uniFarplane=new CGL.Uniform(shader,'f','f',1.0);
var uniNearplane=new CGL.Uniform(shader,'f','n',1.0);

farPlane.onValueChanged=function(){ uniFarplane.setValue(farPlane.get()); };

nearPlane.onValueChanged=function(){ uniNearplane.setValue(nearPlane.get()); };

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(depthTexture.val && depthTexture.val.tex)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, depthTexture.get().tex );

        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, colorTexture.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};