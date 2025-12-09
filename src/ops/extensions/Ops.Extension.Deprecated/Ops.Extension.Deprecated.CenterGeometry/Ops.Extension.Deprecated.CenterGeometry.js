let geometry = op.addInPort(new CABLES.Port(op, "Geometry", CABLES.OP_PORT_TYPE_OBJECT));

let x = op.inValueBool("x");
let y = op.inValueBool("y");
let z = op.inValueBool("z");

let outGeom = op.outObject("Result");

x.onChange = update;
y.onChange = update;
z.onChange = update;
geometry.onChange = update;

function update()
{
    let oldGeom = geometry.get();

    if (oldGeom)
    {
        let geom = oldGeom.copy();
        geom.center(x.get(), y.get(), z.get());

        outGeom.set(geom);
    }
}
