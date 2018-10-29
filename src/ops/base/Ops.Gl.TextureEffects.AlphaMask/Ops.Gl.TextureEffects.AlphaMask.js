var self=this;
var cgl=this.patch.cgl;

this.render=this.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
// this.amount=this.addInPort(new CABLES.Port(this,"amount",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
this.image=this.addInPort(new CABLES.Port(this,"image",CABLES.OP_PORT_TYPE_TEXTURE));
this.trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));


var shader=new CGL.Shader(cgl);
// this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  UNI sampler2D tex;'
    .endl()+'  UNI sampler2D image;'
    .endl()+'#endif'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'

    .endl()+'   #ifdef FROM_RED'
    .endl()+'       col.a=texture2D(image,texCoord).r;'
    .endl()+'   #endif'

    .endl()+'   #ifdef FROM_GREEN'
    .endl()+'       col.a=texture2D(image,texCoord).g;'
    .endl()+'   #endif'

    .endl()+'   #ifdef FROM_BLUE'
    .endl()+'       col.a=texture2D(image,texCoord).b;'
    .endl()+'   #endif'

    .endl()+'   #ifdef FROM_ALPHA'
    .endl()+'       col.a=texture2D(image,texCoord).a;'
    .endl()+'   #endif'

    .endl()+'   #ifdef FROM_LUMINANCE'
    .endl()+'       vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), texture2D(tex,texCoord).rgb ));'
    .endl()+'       col.a=(gray.r+gray.g+gray.b)/3.0;'
    .endl()+'   #endif'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);

this.method=this.addInPort(new CABLES.Port(this,"method",CABLES.OP_PORT_TYPE_VALUE ,{display:'dropdown',values:["luminance","image alpha","red","green","blue"]} ));

this.method.onValueChanged=function()
{
    if(self.method.val=='luminance') shader.define('FROM_LUMINANCE');
        else shader.removeDefine('FROM_LUMINANCE');
    if(self.method.val=='image alpha') shader.define('FROM_ALPHA');
        else shader.removeDefine('FROM_ALPHA');
    if(self.method.val=='red') shader.define('FROM_RED');
        else shader.removeDefine('FROM_RED');
    if(self.method.val=='green') shader.define('FROM_GREEN');
        else shader.removeDefine('FROM_GREEN');
    if(self.method.val=='blue') shader.define('FROM_BLUE');
        else shader.removeDefine('FROM_BLUE');
};

this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(self.image.val && self.image.val.tex)
    {
        cgl.setTexture(1, self.image.val.tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    self.trigger.trigger();
};