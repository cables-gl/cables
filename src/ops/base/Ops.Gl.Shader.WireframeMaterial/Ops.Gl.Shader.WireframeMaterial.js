var cgl=op.patch.cgl;

var render=op.inTrigger("render");
var trigger=op.outTrigger('trigger');

var enableDepth=op.inValueBool("enable depth testing",true);

var fill=op.inValueBool("fill",true);

function setDefines()
{
    if(shader)
        if(fill.get()) shader.define('WIREFRAME_FILL');
            else shader.removeDefine('WIREFRAME_FILL');
}
fill.onChange=function()
{
    setDefines();
};

var w=op.inValueSlider("width",0.25);
w.onChange=function(){ uniformWidth.setValue(w.get()); };

var opacity=op.inValueSlider("opacity",1);
opacity.onChange=function(){ uniformOpacity.setValue(opacity.get()); };

if(cgl.glVersion==1 && !cgl.gl.getExtension('OES_standard_derivatives') )
{
    op.uiAttr( { 'error': 'no oes standart derivatives!' } );
}
else
{
    op.uiAttr( { 'error': null } );
}

var doRender=function()
{
    // if(true!==enableDepth.get()) cgl.gl.disable(cgl.gl.DEPTH_TEST);
        // else cgl.gl.enable(cgl.gl.DEPTH_TEST);
    cgl.pushDepthTest(enableDepth.get());

    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();

    // if(true!==enableDepth.get()) cgl.gl.enable(cgl.gl.DEPTH_TEST);
    cgl.popDepthTest();

};

var shader=new CGL.Shader(cgl,'Wireframe Material');

if(cgl.glVersion>1)shader.glslVersion=300;
var uniformWidth=new CGL.Uniform(shader,'f','width',w.get());
var uniformOpacity=new CGL.Uniform(shader,'f','opacity',opacity.get());

if(cgl.glVersion==1)shader.enableExtension('OES_standard_derivatives');

shader.setSource(attachments.wireframe_vert||'',attachments.wireframe_frag||'');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.wireframe=true;
setDefines();

{
    // diffuse color

    var r=op.inValueSlider("diffuse r",Math.random());
    r.setUiAttribs({ colorPick: true });
    r.onChange=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=op.inValueSlider("diffuse g",Math.random());
    g.onChange=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=op.inValueSlider("diffuse b",Math.random());
    b.onChange=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

}

{
    // diffuse color

    var fr=op.inValueSlider("Fill R",Math.random());
    fr.setUiAttribs({colorPick : true});
    fr.uniform=new CGL.Uniform(shader,'f','fr',fr);

    var fg=op.inValueSlider("Fill G",Math.random());
    fg.uniform=new CGL.Uniform(shader,'f','fg',fg);

    var fb=op.inValueSlider("Fill B",Math.random());
    fb.uniform=new CGL.Uniform(shader,'f','fb',fb);
}

render.onTriggered=doRender;

doRender();
