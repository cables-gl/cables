let x1 = op.inValueFloat("x1");
let y1 = op.inValueFloat("y1");
let z1 = op.inValueFloat("z1");

let x2 = op.inValueFloat("x2");
let y2 = op.inValueFloat("y2");
let z2 = op.inValueFloat("z2");

let dist = op.addOutPort(new CABLES.Port(op, "distance"));
op.setPortGroup("Point 1", [x1, y1, z1]);
op.setPortGroup("Point 2", [x2, y2, z2]);

x1.onChange = calc;
y1.onChange = calc;
z1.onChange = calc;
x2.onChange = calc;
y2.onChange = calc;
z2.onChange = calc;

function calc()
{
    let xd = x2.get() - x1.get();
    let yd = y2.get() - y1.get();
    let zd = z2.get() - z1.get();
    dist.set(Math.sqrt(xd * xd + yd * yd + zd * zd));
}
