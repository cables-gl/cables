var x=op.inValue("X");
var y=op.inValue("Y");
var z=op.inValue("Z");

var l=op.outValue("Length");

x.onChange=update;
y.onChange=update;
z.onChange=update;

var vec=vec3.create();

function update()
{
    vec3.set(vec,x.get(),y.get(),z.get());
    l.set(vec3.len(vec));
}


