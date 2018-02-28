

var inX=op.inValue("X");
var inY=op.inValue("Y");

var outX=op.outValue("Result X");
var outY=op.outValue("Result Y");

var range=op.inValueBool("-1 to 1");

inX.onChange=update;
inY.onChange=update;
range.onChange=update;


function update()
{

    var x=inX.get()/op.patch.cgl.canvas.width;
    var y=inY.get()/op.patch.cgl.canvas.height;

    outX.set(x);
    outY.set(y);

    if(range.get())
    {
        x=x*2-1;
        y=y*2-1;
    }
    
    outX.set(x);
    outY.set(y);

}

