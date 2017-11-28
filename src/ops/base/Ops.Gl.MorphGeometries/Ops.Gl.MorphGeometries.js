
var render=op.inFunction("Render");
var next=op.outFunction("Next");

var inGeomA=op.inObject("Geometry 1");
var inGeomB=op.inObject("Geometry 2");

var inFade=op.inValueSlider("Fade");

var cgl=op.patch.cgl;
var shader=null;
var mesh=null;
var module=null;
var needsRebuild=true;

inGeomA.onChange=rebuildLater;
inGeomB.onChange=rebuildLater;

var srcHeadVert=''
    .endl()+'IN vec3 MOD_morphTarget;'
    .endl()+'UNI float MOD_fade;'
    .endl();

var srcBodyVert=attachments.morph_geometries_vert;


function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
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

        module=shader.addModule(
            {
                priority:-11,
                title:op.objName,

                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        console.log('morph module inited');
    
        uniFade=new CGL.Uniform(shader,'f',module.prefix+'fade',inFade);

        needsRebuild=true;
    }

    if(needsRebuild)rebuild();
    if(!mesh)return;

    mesh.render(cgl.getShader());
    
    next.trigger();

};

function doRender()
{
    next.trigger();    
}

function rebuildLater()
{
    needsRebuild=true;
}

function rebuild()
{
    if(inGeomB.get() && inGeomA.get() && module)
    {
        var geom=inGeomA.get();

        mesh=new CGL.Mesh(cgl,geom);
        mesh.addVertexNumbers=true;
        mesh.addAttribute(module.prefix+'morphTarget',inGeomB.get().vertices,3);

        needsRebuild=false;
    }
    else
    {
        console.log('no rebuild');
        mesh=null;
    }
}
