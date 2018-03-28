var render=op.inFunction("render");
var amount=op.inValue("Amount",300);
var height=op.inValue("Height",2);
var inTex=op.inTexture("Texture");
var trigger=op.outFunction("Trigger");
var axis=op.inValueSelect("Axis",["XZ","XY","YZ","X","Y","Z"],"XZ");

var uniAmount=null,uniHeight=null,uniPoints=null;
var cgl=op.patch.cgl;
var shader=null;
var mod=null;
axis.onChange=updateAxis;

function updateAxis()
{
    if(!shader)return;
    
    shader.removeDefine(mod.prefix+"AXIS_XZ");
    shader.removeDefine(mod.prefix+"AXIS_XY");
    shader.removeDefine(mod.prefix+"AXIS_YZ");
    shader.removeDefine(mod.prefix+"AXIS_X");
    shader.removeDefine(mod.prefix+"AXIS_X");
    shader.removeDefine(mod.prefix+"AXIS_Z");
    
    if(axis.get()=="XZ")shader.define(mod.prefix+"AXIS_XZ");
    if(axis.get()=="XY")shader.define(mod.prefix+"AXIS_XY");
    if(axis.get()=="YZ")shader.define(mod.prefix+"AXIS_YZ");
    if(axis.get()=="X")shader.define(mod.prefix+"AXIS_X");
    if(axis.get()=="Y")shader.define(mod.prefix+"AXIS_Y");
    if(axis.get()=="Z")shader.define(mod.prefix+"AXIS_Z");
}

function removeModule()
{
    if(shader && mod)
    {
        shader.removeModule(mod);
        shader=null;
    }
}

render.onLinkChanged=removeModule;
render.onTriggered=function()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        mod=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.bulge_head_vert||'',
                srcBodyVert:attachments.bulge_body_vert||''
            });

        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'amount',amount);
        uniHeight=new CGL.Uniform(shader,'f',mod.prefix+'height',height);

        inTex.uniform=new CGL.Uniform(shader,'t',mod.prefix+'tex',5);
        updateAxis();
    }

    if(inTex.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE5);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inTex.get().tex);
    }
    
    trigger.trigger();
};
