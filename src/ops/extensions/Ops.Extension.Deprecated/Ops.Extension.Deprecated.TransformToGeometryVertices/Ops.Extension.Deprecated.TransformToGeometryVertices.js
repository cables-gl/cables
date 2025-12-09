op.name = "TransformToGeometryVertices";
let render = op.inTrigger("render");
let geometry = op.addInPort(new CABLES.Port(op, "geometry", CABLES.OP_PORT_TYPE_OBJECT));

let modulo = op.inValue("modulo", 1);

let trigger = op.outTrigger("trigger");
let x = op.addOutPort(new CABLES.Port(op, "x", CABLES.OP_PORT_TYPE_VALUE));
let y = op.addOutPort(new CABLES.Port(op, "y", CABLES.OP_PORT_TYPE_VALUE));
let z = op.addOutPort(new CABLES.Port(op, "z", CABLES.OP_PORT_TYPE_VALUE));
let index = op.addOutPort(new CABLES.Port(op, "index", CABLES.OP_PORT_TYPE_VALUE));

geometry.ignoreValueSerialize = true;

let cgl = op.patch.cgl;
let vec = vec3.create();

render.onTriggered = function ()
{
    let geom = geometry.get();
    if (geom)
    {
        let leng = geom.vertices.length;
        for (let i = 0; i < leng; i += 3)
        {
            if (i / 3 % modulo.get() == 0)
            {
                vec3.set(vec, geom.vertices[i + 0], geom.vertices[i + 1], geom.vertices[i + 2]);
                x.set(geom.vertices[i + 0]);
                y.set(geom.vertices[i + 1]);
                z.set(geom.vertices[i + 2]);
                index.set(i);
                cgl.pushModelMatrix();
                mat4.translate(cgl.mvMatrix, cgl.mvMatrix, vec);
                trigger.trigger();
                cgl.popModelMatrix();
            }
        }
    }
};
