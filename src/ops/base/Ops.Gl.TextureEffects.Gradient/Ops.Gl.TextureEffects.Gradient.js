const render=op.inTrigger("Render");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const width=op.inValue("Width",1);
const gType=op.inValueSelect("Type",['X','Y','XY','Radial'],"X");
const pos1=op.inValueSlider("Pos",0.5);
const smoothStep=op.inValueBool("Smoothstep",true);

const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
r.setUiAttribs({ colorPick: true });

const r2 = op.inValueSlider("r2", Math.random());
const g2 = op.inValueSlider("g2", Math.random());
const b2 = op.inValueSlider("b2", Math.random());
r2.setUiAttribs({ colorPick: true });

const r3 = op.inValueSlider("r3", Math.random());
const g3 = op.inValueSlider("g3", Math.random());
const b3 = op.inValueSlider("b3", Math.random());
r3.setUiAttribs({ colorPick: true });

smoothStep.onChange=updateSmoothstep;

op.setPortGroup('Blending',[blendMode,amount]);
op.setPortGroup('Color A',[r,g,b]);
op.setPortGroup('Color B',[r2,g2,b2]);
op.setPortGroup('Color C',[r3,g3,b3]);

const randomize=op.inTriggerButton("Randomize");
var next=op.outTrigger("Next");

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'gradient');
var srcFrag=attachments.gradient_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag );
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var uniPos=new CGL.Uniform(shader,'f','pos',pos1);
var uniWidth=new CGL.Uniform(shader,'f','width',width);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var r3uniform,r2uniform,runiform;

r2.onChange=g2.onChange=b2.onChange=updateCol2;
r3.onChange=g3.onChange=b3.onChange=updateCol3;
r.onChange=g.onChange=b.onChange=updateCol;

updateCol();
updateCol2();
updateCol3();
updateSmoothstep();

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

    if(gType.get()=='XY') shader.define('GRAD_XY');
    if(gType.get()=='X') shader.define('GRAD_X');
    if(gType.get()=='Y') shader.define('GRAD_Y');
    if(gType.get()=='Radial')shader.define('GRAD_RADIAL');
};

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

randomize.onTriggered=function()
{
    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());

    r2.set(Math.random());
    g2.set(Math.random());
    b2.set(Math.random());

    r3.set(Math.random());
    g3.set(Math.random());
    b3.set(Math.random());
};

function updateCol()
{
    var colA=[r.get(),g.get(),b.get()];
    if(!runiform) runiform=new CGL.Uniform(shader,'3f','colA',colA);
        else runiform.setValue(colA);
}

function updateCol2()
{
    var colB=[r2.get(),g2.get(),b2.get()];
    if(!r2uniform) r2uniform=new CGL.Uniform(shader,'3f','colB',colB);
        else r2uniform.setValue(colB);
}

function updateCol3()
{
    var colC=[r3.get(),g3.get(),b3.get()];
    if(!r3uniform) r3uniform=new CGL.Uniform(shader,'3f','colC',colC);
        else r3uniform.setValue(colC);
}

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
