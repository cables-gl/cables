/*
Shaders are from Iq's webapge
https://www.iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
*/

const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);

const shapeSelect=op.inValueSelect("Shape",['circle','eqi triangle','iso triangle','box','rhombus','pentagon',
        'hexagon','octogon','hexagram'],'circle');
const mirrorX = op.inValueBool("Mirror X",false);
const mirrorY = op.inValueBool("Mirror Y",false);

const xPos = op.inValueFloat("Offset X",0.0);
const yPos = op.inValueFloat("Offset Y",0.0);

const fillShape = op.inValueBool("fillShape",true);
const lineThickness=op.inValue("Line thickness",1.0);
const invertColor = op.inValueBool("Invert color", false);

const width=op.inValue("width",0.5);
const height=op.inValue("height",0.5);

const inRotate=op.inValueSlider("Rotate",0.0);

const r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a",1.0);
r.setUiAttribs({ colorPick: true });

const trigger=op.outTrigger('trigger');

var selectIndex = 0;

function onFilterChange()
{
    var selectedMode = shapeSelect.get();

    if((selectedMode === 'circle') || (selectedMode === 'eqi triangle') || (selectedMode === 'pentagon')
            || (selectedMode === 'hexagon') || (selectedMode === 'octogon') || (selectedMode === 'hexagram') )
                selectIndex = 0;

    else if((selectedMode === 'box') || (selectedMode === 'iso triangle') || (selectedMode === 'rhombus') )
                selectIndex = 1;

    if(selectIndex === 0)
    {
        height.setUiAttribs({greyout:true});
        width.setUiAttribs({title:"Size"});

    }
    else if (selectIndex === 1)
    {
        height.setUiAttribs({greyout:false});
        width.setUiAttribs({title:"Width"});
    }
};

fillShape.onChange = function ()
{
    lineThickness.setUiAttribs({greyout:fillShape.get()});
};

op.init = shapeSelect.onChange = function()
{
    onFilterChange();
    //choose shape
    shader.toggleDefine('IS_CIRCLE',shapeSelect.get());
    shader.toggleDefine('IS_EQUI_TRIANGLE',shapeSelect.get() === 'eqi triangle');
    shader.toggleDefine('IS_ISO_TRIANGLE',shapeSelect.get() === 'iso triangle');
    shader.toggleDefine('IS_BOX',shapeSelect.get() === 'box');
    shader.toggleDefine('IS_RHOMBUS',shapeSelect.get() === 'rhombus');
    shader.toggleDefine('IS_PENTAGON',shapeSelect.get() === 'pentagon');
    shader.toggleDefine('IS_HEXAGON',shapeSelect.get() === 'hexagon');
    shader.toggleDefine('IS_OCTOGON',shapeSelect.get() === 'octogon');
    shader.toggleDefine('IS_HEXAGRAM',shapeSelect.get() === 'hexagram');
}

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.shapes_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const mirrorXUniform=new CGL.Uniform(shader,'b','mirrorX',mirrorX);
const mirrorYUniform=new CGL.Uniform(shader,'b','mirrorY',mirrorY);

const xPosUniform=new CGL.Uniform(shader,'f','xPos',xPos);
const yPosUniform=new CGL.Uniform(shader,'f','yPos',yPos);
const invertColorUniform=new CGL.Uniform(shader,'b','invertColor',invertColor);
const fillShapeUniform=new CGL.Uniform(shader,'b','fillShape',fillShape);

const uniWidth=new CGL.Uniform(shader,'f','width',width);
const uniHeight=new CGL.Uniform(shader,'f','height',height);
const uniModifier=new CGL.Uniform(shader,'f','lineThickness',lineThickness);
const rotateUniform=new CGL.Uniform(shader,'f','rotate',inRotate);

var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformA=new CGL.Uniform(shader,'f','a',a);
var uniformAspect=new CGL.Uniform(shader,'f','aspect',1);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered= update;
function update()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    fillShapeUniform.setValue(fillShape.get());
    uniformAspect.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width/cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
