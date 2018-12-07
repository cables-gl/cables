const
    render=op.inTrigger('render'),
    segments=op.inValueInt("segments",40),
    radius=op.inValueFloat("radius",1),
    percent=op.inValueSlider("percent",1),
    inRotate=op.inValueBool("Rotate"),
    trigger=op.outTrigger('trigger'),
    index=op.outValue("index");

var cgl=op.patch.cgl;

segments.set(40);
radius.set(1);
percent.set(1);

var pos=[];
segments.onChange=calcLater;
radius.onChange=calcLater;
percent.onChange=calcLater;
var needsCalc=true;

render.onTriggered=doRender;

function doRender()
{
    if(needsCalc)calc();
    var doRot=inRotate.get();
    for(var i=0;i<pos.length;i++)
    {
        cgl.pushModelMatrix();

        mat4.translate(cgl.mMatrix,cgl.mMatrix, pos[i] );
        if(doRot)mat4.rotateZ(cgl.mMatrix,cgl.mMatrix, (i/pos.length*percent.get())*CGL.DEG2RAD*-360);

        index.set(i);
        trigger.trigger();

        cgl.popModelMatrix();
    }
}

function calcLater()
{
    needsCalc=true;
}

function calc()
{
    pos.length=0;

    var i=0,degInRad=0;
    var segs=segments.get();
    if(segs<1)segs=1;

    for (i=0; i < Math.round(segs*percent.get()); i++)
    {
        degInRad = (360/Math.round(segs))*i*CGL.DEG2RAD;
        pos.push(
            [
            Math.sin(degInRad)*radius.get(),
            Math.cos(degInRad)*radius.get(),
            0
            ]
            );
    }

    needsCalc=false;
}

