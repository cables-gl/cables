
var render=op.inTrigger("Exec");
var next=op.outTrigger("next");
var w=op.inValueInt("Width",1920);
var h=op.inValueInt("Height",1080);

render.onTriggered=doit;

var oldFunc=null;
var cgl=op.patch.cgl;
var vp=[0,0,0,0];

function newGetViewPort()
{
    return vp;
}

function doit()
{
    var oldWidth=cgl.getViewPort()[2];
    var oldHeight=cgl.getViewPort()[3];

    // cgl.forceViewPortSize(0,0,w.get(),h.get());

    cgl.setViewPort(0,0,w.get(),h.get());

    next.trigger();
    
    cgl.setViewPort(0,0,oldWidth,oldHeight);
}