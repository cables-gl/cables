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
// this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D image;'
    .endl()+'UNI float width;'
    .endl()+'UNI float height;'
    .endl()+'UNI float n;'
    .endl()+'UNI float f;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    
    .endl()+'float pX=1.0/width;'
    .endl()+'float pY=1.0/height;'

    
    .endl()+'       float col0=texture2D(image,texCoord).r;'
    .endl()+'       float col1=texture2D(image,vec2(texCoord.x-pX*1.0,texCoord.y)).r;'
    .endl()+'       float col2=texture2D(image,vec2(texCoord.x+pX*1.0,texCoord.y)).r;'
    .endl()+'       float col3=texture2D(image,vec2(texCoord.x+pX*2.0,texCoord.y)).r;'

    .endl()+'       vec4 col4=texture2D(image,vec2(texCoord.x,texCoord.y-pY));'
    .endl()+'       vec4 col6=texture2D(image,vec2(texCoord.x,texCoord.y+pY));'

    .endl()+'       vec4 col7=texture2D(image,vec2(texCoord.x-pX,texCoord.y));'
    .endl()+'       vec4 col9=texture2D(image,vec2(texCoord.x+pX,texCoord.y));'

    // .endl()+'       float z=col.r;'
    // .endl()+'       float z2=col2.r;'
    // .endl()+'       float z3=col3.r;'
    // .endl()+'       float c=(2.0*n)/(f+n-z*(f-n));'
    // .endl()+'       float c2=(2.0*n)/(f+n-z2*(f-n));'
    // .endl()+'       float c3=(2.0*n)/(f+n-z3*(f-n));'

    .endl()+'       vec4 col=vec4(1.0,1.0,1.0,1.0);'
    // .endl()+'       if(col1>=col0 && col3<col2)col=vec4(0.0,0.0,0.0,1.0);'
    // .endl()+'       if(z2>z && z3<z2 )col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'       if(col0>col4.r && col6.r<col0 )col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'       if(col0>col7.r && col9.r<col0 )col=vec4(0.0,0.0,0.0,1.0);'
    // .endl()+'       else if( z2<1.0 && z3>=1.0 )col=vec4(0.0,0.0,0.0,1.0);'
    // .endl()+'       if( col4.r<1.0 && col6.r>=1.0 )col=vec4(0.0,0.0,0.0,1.0);'

    // .endl()+'       if(c>=0.999)col.a=0.0;'
    // .endl()+'           else col.a=1.0;'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniFarplane=new CGL.Uniform(shader,'f','f',1.0);
var uniNearplane=new CGL.Uniform(shader,'f','n',1.0);
var uniWidth=new CGL.Uniform(shader,'f','width',1.0);
var uniHeight=new CGL.Uniform(shader,'f','height',1.0);

farPlane.onValueChanged=function(){ uniFarplane.setValue(farPlane.get()); };

nearPlane.onValueChanged=function(){ uniNearplane.setValue(nearPlane.get()); };

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(image.val && image.val.tex)
    {
        uniWidth.setValue(image.get().width);
        uniHeight.setValue(image.get().height);
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};