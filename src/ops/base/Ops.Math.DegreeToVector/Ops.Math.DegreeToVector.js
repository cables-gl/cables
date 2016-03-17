this.name="Degree To Vector";

var deg=this.addInPort(new Port(this,"degree"));
var x=this.addOutPort(new Port(this,"x"));
var y=this.addOutPort(new Port(this,"y"));

deg.onValueChange(function()
{
    var rad=deg.get()*CGL.DEG2RAD;
    x.set(-1*Math.sin(rad));
    y.set(Math.cos(rad));
});
