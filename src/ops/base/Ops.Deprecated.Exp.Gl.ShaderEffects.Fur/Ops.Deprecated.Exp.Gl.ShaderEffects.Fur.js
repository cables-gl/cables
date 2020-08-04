
var render=op.inTrigger("render");
var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;


var inLayer=op.inValueInt("Layer");
var inNumLayers=op.inValueInt("Num Layers");
var inStrength=op.inValue("Strength",1);
var inTime=op.inValue("Time");


var doRender=function()
{
    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();
};

var shader=new CGL.Shader(cgl,'furmaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

shader.setSource(attachments.fur_vert,attachments.fur_frag);
shader.bindTextures=bindTextures;

inStrength.uniform=new CGL.Uniform(shader,'f','strength',inStrength);
inLayer.uniform=new CGL.Uniform(shader,'f','layer',inLayer);
inNumLayers.uniform=new CGL.Uniform(shader,'f','numLayers',inNumLayers);
inTime.uniform=new CGL.Uniform(shader,'f','time',inTime);



var texStructure=op.inTexture("Tex Structure");
var texStructureUniform=null;
shader.bindTextures=bindTextures;
texStructure.uniform=new CGL.Uniform(shader,'t','texStructure',0);

var texColor=op.inTexture("Tex Color");
var texColorUniform=null;
shader.bindTextures=bindTextures;
texColor.uniform=new CGL.Uniform(shader,'t','texColor',1);

var texLength=op.inTexture("Tex Length");
var texLengthUniform=null;
shader.bindTextures=bindTextures;
texLength.uniform=new CGL.Uniform(shader,'t','texLength',2);


render.onTriggered=doRender;

function bindTextures()
{
    if(texStructure.get())
    {
        cgl.setTexture(0,texStructure.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texStructure.get().tex);
    }

    if(texColor.get())
    {
        cgl.setTexture(1,texColor.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texColor.get().tex);
    }

    if(texLength.get())
    {
        cgl.setTexture(2,texLength.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texLength.get().tex);
    }


}


