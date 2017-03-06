
op.name='CircleTransform';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var segments=op.addInPort(new Port(op,"segments"));
var radius=op.addInPort(new Port(op,"radius"));
var percent=op.addInPort(new Port(op,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var index=op.addOutPort(new Port(op,"index"));

var cgl=op.patch.cgl;

segments.set(40);
radius.set(1);
percent.set(1);

var pos=[];
segments.onChange=calcLater;
radius.onChange=calcLater;
percent.onChange=calcLater;

needsCalc=true;
// calc();

render.onTriggered=doRender;

function doRender()
{

    if(needsCalc)calc();
    for(var i=0;i<pos.length;i++)
    {
        cgl.pushMvMatrix();

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, pos[i] );
        trigger.trigger();

        index.set(i);

        cgl.popMvMatrix();
    }

}

function calcLater()
{
    needsCalc=true;
}

function calc()
{
    needsCalc=false;
    pos.length=0;

    var i=0,degInRad=0;
    var segs=segments.get();
    if(segs<1)segs=1;

    for (i=0; i < Math.round(segs)*percent.get(); i++)
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
}

