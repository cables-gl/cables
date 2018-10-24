op.name="DepthStripes";

var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var depthTexture=op.addInPort(new CABLES.Port(op,"Depth Texture",CABLES.OP_PORT_TYPE_TEXTURE));
var colorTexture=op.addInPort(new CABLES.Port(op,"Color Texture",CABLES.OP_PORT_TYPE_TEXTURE));
var farPlane=op.addInPort(new CABLES.Port(op,"farplane",CABLES.OP_PORT_TYPE_VALUE));
var nearPlane=op.addInPort(new CABLES.Port(op,"nearplane",CABLES.OP_PORT_TYPE_VALUE));

farPlane.set(100.0);
nearPlane.set(0.1);

var cgl=op.patch.cgl;
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

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

        /* --- */cgl.setTexture(0,depthTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, depthTexture.get().tex );

        /* --- */cgl.setTexture(1,colorTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, colorTexture.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};