
var render=op.inTrigger("Render");

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);
var width=op.inValue("Width",1);

var gType=op.inValueSelect("Type",['X','Y','XY','Radial'],"X");

var pos1=op.inValueSlider("Pos",0.5);

var smoothStep=op.inValueBool("Smoothstep",true);
smoothStep.onChange=updateSmoothstep;


var r=op.addInPort(new CABLES.Port(op,"r1",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new CABLES.Port(op,"g1",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new CABLES.Port(op,"b1",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var r2=op.addInPort(new CABLES.Port(op,"r2",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g2=op.addInPort(new CABLES.Port(op,"g2",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b2=op.addInPort(new CABLES.Port(op,"b2",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var r3=op.addInPort(new CABLES.Port(op,"r3",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g3=op.addInPort(new CABLES.Port(op,"g3",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b3=op.addInPort(new CABLES.Port(op,"b3",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));


var next=op.outTrigger("Next");


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
var srcFrag=attachments.gradient_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag );

updateSmoothstep();

var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var uniPos=new CGL.Uniform(shader,'f','pos',pos1);
var uniWidth=new CGL.Uniform(shader,'f','width',width);

var textureUniform=new CGL.Uniform(shader,'t','tex',0);

function updateSmoothstep()
{
    if(smoothStep.get()) shader.define('GRAD_SMOOTHSTEP');
        else shader.removeDefine('GRAD_SMOOTHSTEP');
}

gType.onChange=function()
{
    shader.removeDefine('GRAD_X');
    shader.removeDefine('GRAD_Y');
    shader.removeDefine('GRAD_XY');
    shader.removeDefine('GRAD_RADIAL');
    
    if(gType.get()=='XY')shader.define('GRAD_XY');
    if(gType.get()=='X')shader.define('GRAD_X');
    if(gType.get()=='Y')shader.define('GRAD_Y');
    if(gType.get()=='Radial')shader.define('GRAD_RADIAL');
    
};

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

r.onChange=g.onChange=b.onChange=function()
{
    var colA=[r.get(),g.get(),b.get()];
    if(!r.uniform) r.uniform=new CGL.Uniform(shader,'3f','colA',colA);
    else r.uniform.setValue(colA);
};

r2.onChange=g2.onChange=b2.onChange=function()
{
    var colB=[r2.get(),g2.get(),b2.get()];
    if(!r2.uniform) r2.uniform=new CGL.Uniform(shader,'3f','colB',colB);
    else r2.uniform.setValue(colB);
};

r3.onChange=g3.onChange=b3.onChange=function()
{
    var colC=[r3.get(),g3.get(),b3.get()];
    if(!r3.uniform) r3.uniform=new CGL.Uniform(shader,'3f','colC',colC);
    else r3.uniform.setValue(colC);
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    next.trigger();
};
