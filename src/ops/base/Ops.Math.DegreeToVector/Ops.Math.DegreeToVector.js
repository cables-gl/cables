const
    deg=op.inValueFloat("degree",0),
    x=op.outValue("x"),
    y=op.outValue("y");

deg.onChange=update;

function update()
{
    var rad=deg.get()*CGL.DEG2RAD;
    x.set(-1*Math.sin(rad));
    y.set(Math.cos(rad));
}

