const
    render = op.inTrigger("Exec"),
    next = op.outTrigger("next"),
    w = op.inValueInt("Width", 1920),
    h = op.inValueInt("Height", 1080);

render.onTriggered = doit;

let oldFunc = null;
let cgl = op.patch.cgl;
let vp = [0, 0, 0, 0];

function newGetViewPort()
{
    return vp;
}

function doit()
{
    let oldWidth = cgl.getViewPort()[2];
    let oldHeight = cgl.getViewPort()[3];

    // cgl.forceViewPortSize(0,0,w.get(),h.get());

    cgl.setViewPort(0, 0, w.get(), h.get());

    next.trigger();

    cgl.setViewPort(0, 0, oldWidth, oldHeight);
}
