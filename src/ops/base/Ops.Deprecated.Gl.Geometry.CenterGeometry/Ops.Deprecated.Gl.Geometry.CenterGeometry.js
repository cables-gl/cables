
let geometry = op.addInPort(new CABLES.Port(op, "Geometry", CABLES.OP_PORT_TYPE_OBJECT));

let x = op.inBool("x");
let y = op.inBool("y");
let z = op.inBool("z");


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
