const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);

const lineThicknessX=op.inValueSlider("Line thickness X",0.4);
const lineThicknessY=op.inValueSlider("Line thickness Y",0.4);
const cellsX=op.inValueFloat("Cells X",10);
const cellsY=op.inValueFloat("Cells Y",10);
const inRotate=op.inValueSlider("Rotate",0.0);
const offsetX=op.inValue("Offset X",0.0);
const offsetY=op.inValue("Offset Y",0.0);

const invertColor=op.inValueBool("Invert color",false);
const r=op.inValueSlider("Line red",Math.random());
const g=op.inValueSlider("Line green",Math.random());
const b=op.inValueSlider("Line Blue",Math.random());

r.setUiAttribs({colorPick:true});

op.setPortGroup('LineThickness',[lineThicknessX,lineThicknessY]);
op.setPortGroup('Cells',[cellsX,cellsY]);
op.setPortGroup('Position',[inRotate,offsetX,offsetY]);

const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.grid_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);

const uniInvertColor=new CGL.Uniform(shader,'b','invertColor',invertColor);
const unilineThicknessX=new CGL.Uniform(shader,'f','lineThicknessX',lineThicknessX);
const unilineThicknessY=new CGL.Uniform(shader,'f','lineThicknessY',lineThicknessY);
const unicellsX=new CGL.Uniform(shader,'f','cellsX',cellsX);
const unicellsY=new CGL.Uniform(shader,'f','cellsY',cellsY);
const rotateUniform=new CGL.Uniform(shader,'f','rotate',inRotate);
const offsetXUniform=new CGL.Uniform(shader,'f','offsetX',offsetX);
const offsetYUniform=new CGL.Uniform(shader,'f','offsetY',offsetY);

const uniformLineR=new CGL.Uniform(shader,'f','lineR',r);
const uniformLineG=new CGL.Uniform(shader,'f','lineG',g);
const uniformLineB=new CGL.Uniform(shader,'f','lineB',b);



CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
