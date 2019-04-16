const
    render=op.inTrigger('render'),
    inAttr=op.inValueSelect('Attribute',["Normals","Tangents","BiTangents"],"Normals"),
    trigger=op.outTrigger('trigger'),
    outShader=op.outObject("Shader");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(attachments.normalsmaterial_vert,attachments.normalsmaterial_frag);
outShader.set(shader);
render.onTriggered=doRender;
updateAttr();
inAttr.onChange=updateAttr;

function updateAttr()
{
    shader.toggleDefine("SHOW_NORMALS",inAttr.get()=="Normals");
    shader.toggleDefine("SHOW_TANGENTS",inAttr.get()=="Tangents");
    shader.toggleDefine("SHOW_BITANGENTS",inAttr.get()=="BiTangents");
}

function doRender()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
}

