const
    render=op.inTrigger("Render"),
    next=op.outTrigger("Next"),
    inGeomA=op.inObject("Geometry 1"),
    inGeomB=op.inObject("Geometry 2"),
    inFade=op.inValueSlider("Fade"),
    inNormals=op.inValueBool("Normals");

var cgl=op.patch.cgl;
var shader=null;
var mesh=null;
var module=null;
var needsRebuild=true;
var needsRebuildShader=true;

op.onDelete=render.onLinkChanged=removeModule;
inGeomA.onChange=inGeomB.onChange=rebuildLater;
inNormals.onChange=rebuildShaderLater;

var srcBodyVert=attachments.morph_geometries_vert;
var srcHeadVert=''
    .endl()+'IN vec3 MOD_targetPosition;'
    .endl()+'IN vec3 MOD_targetNormal;'
    .endl()+'UNI float MOD_fade;'
    .endl();


function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader=null;
    }
}

render.onTriggered=function()
{
    if(cgl.getShader()!=shader || needsRebuildShader) rebuildShader();
    if(needsRebuild)rebuild();
    if(!mesh)return;

    mesh.render(cgl.getShader());
    next.trigger();
};

function rebuildShader()
{
    if(shader) removeModule();
    shader=cgl.getShader();
    module=shader.addModule(
        {
            priority:-11,
            title:op.objName,
            name:'MODULE_VERTEX_POSITION',
            srcHeadVert:srcHeadVert,
            srcBodyVert:srcBodyVert
        });

    new CGL.Uniform(shader,'f',module.prefix+'fade',inFade);

    shader.toggleDefine("MORPH_NORMALS",inNormals.get());

    needsRebuild=true;
    needsRebuildShader=false;
}

function rebuildLater()
{
    needsRebuild=true;
}

function rebuildShaderLater()
{
    needsRebuildShader=true;
    needsRebuild=true;
}

function rebuild()
{
    if(inGeomB.get() && inGeomA.get() && module)
    {
        var geom=inGeomA.get();
        if(mesh)mesh.dispose();
        mesh=new CGL.Mesh(cgl,geom);
        mesh.addVertexNumbers=true;
        mesh.addAttribute(module.prefix+'targetPosition',inGeomB.get().vertices,3);

        if(inNormals.get())
            mesh.addAttribute(module.prefix+'targetNormal',inGeomB.get().vertexNormals,3);

        needsRebuild=false;
    }
    else
    {
        if(mesh)mesh.dispose();
        mesh=null;
        needsRebuild=true;
    }
}
