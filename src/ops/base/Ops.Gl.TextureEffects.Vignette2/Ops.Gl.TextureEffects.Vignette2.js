op.name="Vignette";

var render=op.inFunction("render");
var trigger=op.outFunction("trigger");

var amount=op.inValueSlider("Amount",1);
// var lensRadius1=op.inValue("lensRadius1",0.8);
var lensRadius1=op.inValueSlider("Radius",0.5);
var sharp=op.inValueSlider("sharp",0.25);
var aspect=op.inValue("Aspect",1);


var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D tex;'
    .endl()+'UNI float lensRadius1;'
    .endl()+'UNI float aspect;'
    .endl()+'UNI float amount;'
    .endl()+'UNI float sharp;'
    
    .endl()+'UNI float r,g,b;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 vcol=vec4(r,g,b,1.0);'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   vec2 tcPos=vec2(texCoord.x,(texCoord.y-0.5)*aspect+0.5);'
    .endl()+'   float dist = distance(tcPos, vec2(0.5,0.5));'
    .endl()+'   float am = (1.0-smoothstep( (lensRadius1+0.5), (lensRadius1*0.99+0.5)*sharp, dist));'
    
    .endl()+'   col=mix(col,vcol,am*amount);'
    
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniLensRadius1=new CGL.Uniform(shader,'f','lensRadius1',lensRadius1);
var uniaspect=new CGL.Uniform(shader,'f','aspect',aspect);
var uniAmount=new CGL.Uniform(shader,'f','amount',amount);
var unisharp=new CGL.Uniform(shader,'f','sharp',sharp);

var unir=new CGL.Uniform(shader,'f','r',r);
var unig=new CGL.Uniform(shader,'f','g',g);
var unib=new CGL.Uniform(shader,'f','b',b);


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
