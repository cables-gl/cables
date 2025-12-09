this.name = "Laser Preview";

this.render = this.addInPort(new CABLES.Port(this, "render", CABLES.OP_PORT_TYPE_FUNCTION));
let laserArray = this.addInPort(new CABLES.Port(this, "array", CABLES.OP_PORT_TYPE_ARRAY));

const trigger = op.outTrigger("trigger");

let cgl = this.patch.cgl;

let mesh = null;
let geom = new CGL.Geometry();
let verts = [];
let indices = [];
let vertsColors = [];

let counter = 0;

function render()
{
    if (!laserArray.get()) return;
    geom.clear();

    let stride = 6;

    let n = (laserArray.get().length) / stride * 3;
    verts.length = n;
    vertsColors.length = (laserArray.get().length) / stride * 4;
    indices.length = verts.length;

    let lastR = 255;
    let lastG = 255;
    let lastB = 255;

    // counter+=100;
    // if(counter>laserArray.get().length)counter=0;

    for (let i = 0; i < laserArray.get().length; i += stride)
    {
        let ind = (i) / stride;
        verts[ind * 3 + 0] = laserArray.get()[i + 0];
        verts[ind * 3 + 1] = laserArray.get()[i + 1];
        verts[ind * 3 + 2] = laserArray.get()[i + 2];

        vertsColors[ind * 4 + 0] = (laserArray.get()[i + 3]) / 250;
        vertsColors[ind * 4 + 1] = (laserArray.get()[i + 4]) / 250;
        vertsColors[ind * 4 + 2] = (laserArray.get()[i + 5]) / 250;
        vertsColors[ind * 4 + 3] = 1;

        indices[ind] = ind;

        if (i == 10)
        {
            // console.log( laserArray.get()[i+0], laserArray.get()[i+1] );
        }

        let vec = vec3.create();
        vec3.set(vec, laserArray.get()[i + 0], laserArray.get()[i + 1], 0);
        cgl.pushModelMatrix();

        mat4.translate(cgl.mvMatrix, cgl.mvMatrix, vec);
        trigger.trigger();

        cgl.popModelMatrix();
    }

    geom.vertices = verts;
    geom.vertexColors = vertsColors;
    geom.verticesIndices = indices;

    if (!mesh) mesh = new CGL.Mesh(cgl, geom, cgl.gl.LINE_STRIP);
    mesh.setGeom(geom);

    if (mesh) mesh.render(cgl.getShader());
}

this.render.onTriggered = render;
