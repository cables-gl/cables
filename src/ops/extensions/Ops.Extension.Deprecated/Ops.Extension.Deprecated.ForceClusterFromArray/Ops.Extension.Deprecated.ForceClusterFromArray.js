let exec = op.inTrigger("Exec");
let doreset = op.inTriggerButton("reset");

// var num=op.inValue("num",20);
let inPoints = op.inArray("Positions");

let range = op.inValue("Range Radius", 1);
let attraction = op.inValue("attraction");
let angle = op.inValue("Angle");
let show = op.inValueBool("Show");

let next = op.outTrigger("next");

let outNumPoints = op.outValue("Num Points");

let forceObj = {};

let mesh = null;
let pos = [0, 0, 0];
let cgl = op.patch.cgl;

range.onChange = reset;
attraction.onChange = reset;
angle.onChange = reset;

let forces = [];

// num.onChange=reset;
doreset.onTriggered = reset;

inPoints.onChange = reset;

function reset()
{
    let points = inPoints.get();
    if (!points) return;

    if (forces.length != points.length / 3)
        forces.length = points.length / 3;

    // forces.length=Math.floor(num.get());
    for (let i = 0; i < points.length / 3; i++)
    {
        forces[i] = forces[i] || {};

        forces[i].pos = forces[i].pos || [0, 0, 0];
        forces[i].pos[0] = points[i * 3 + 0];
        forces[i].pos[1] = points[i * 3 + 1];
        forces[i].pos[2] = points[i * 3 + 2];

        forces[i].range = range.get() * 0.8;
        forces[i].attraction = attraction.get() * 4;
        forces[i].angle = angle.get();

        // forces[(i*2+1)]=forces[i*2+1]||{};
        // forces[(i*2+1)].pos=[
        //     points[(i)*3+0],
        //     points[(i)*3+1],
        //     points[(i)*3+2],
        //     ];

        // forces[(i*2+1)].range=range.get();
        // forces[(i*2+1)].attraction=-attraction.get();
        // forces[(i*2+1)].angle=angle.get();
    }
}

let mark = new CGL.Marker(cgl);
op.onDelete = function () {};

exec.onTriggered = function ()
{
    if (!inPoints.get())
    {
        next.trigger();
        return;
    }

    let num = inPoints.get().length / 3 * 2;

    if (show.get())
    {
        for (var i = 0; i < num; i++)
        {
            if (forces[i])
            {
                cgl.pushModelMatrix();

                // if(!mesh)mesh=new CGL.WirePoint(cgl);
                mat4.translate(cgl.mvMatrix, cgl.mvMatrix, forces[i].pos);
                // mesh.render(cgl,range.get()*2);
                mark.draw(cgl);
                cgl.popModelMatrix();
            }
        }
    }

    outNumPoints.set(inPoints.get().length / 3);

    // updateForceObject();

    CABLES.forceFieldForces = CABLES.forceFieldForces || [];
    // CABLES.forceFieldForces.push(forceObj);

    for (var i = 0; i < num; i++)
    {
        // vec3.transformMat4(forces[i].pos, forces[i].posOrig, cgl.mvMatrix);
        if (forces[i])
            CABLES.forceFieldForces.push(forces[i]);
    }
    // console.log(forces[0].pos);
    // console.log(CABLES.forceFieldForces.length);

    next.trigger();

    for (var i = 0; i < num; i++)
        if (forces[i])
            CABLES.forceFieldForces.pop();
};

reset();
