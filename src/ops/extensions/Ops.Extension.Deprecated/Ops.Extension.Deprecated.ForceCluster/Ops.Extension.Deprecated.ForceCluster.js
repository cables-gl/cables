let exec = op.inTrigger("Exec");
let doreset = op.inTriggerButton("reset");

let num = op.inFloat("num", 20);

let range = op.inFloat("Range Radius", 1);
let attraction = op.inFloat("attraction");
let angle = op.inFloat("Angle");
let show = op.inValueBool("Show");
let seed = op.inFloat("Random Seed");

let posX = op.inFloat("Pos X");
let posY = op.inFloat("Pos Y");
let posZ = op.inFloat("Pos Z");

let areaX = op.inFloat("Area X");
let areaY = op.inFloat("Area Y");
let areaZ = op.inFloat("Area Z");

let next = op.outTrigger("next");

let outPoints = op.outArray("Points");

let forceObj = {};

let mesh = null;
let pos = [0, 0, 0];
let cgl = op.patch.cgl;

range.onChange = reset;
attraction.onChange = reset;
angle.onChange = reset;
posX.onChange = reset;
posY.onChange = reset;
posZ.onChange = reset;
areaX.onChange = reset;
areaY.onChange = reset;
areaZ.onChange = reset;
seed.onChange = reset;

let forces = [];

num.onChange = reset;
doreset.onTriggered = reset;

function reset()
{
    let fPoints = [];
    Math.randomSeed = seed.get();

    forces.length = Math.floor(num.get());
    for (let i = 0; i < num.get(); i++)
    {
        forces[i] = forces[i] || {};

        let x = posX.get() + areaX.get() * Math.seededRandom() - areaX.get() / 2;
        let y = posY.get() + areaY.get() * Math.seededRandom() - areaY.get() / 2;
        let z = posZ.get() + areaZ.get() * Math.seededRandom() - areaZ.get() / 2;

        fPoints.push(x, y, z);

        // forces[i].pos=[0,0,0,0];
        forces[i].pos = [x, y, z];

        forces[i].range = range.get() * Math.seededRandom() - range.get() / 2;
        forces[i].attraction = attraction.get() * Math.seededRandom() - attraction.get() / 2;
        forces[i].angle = angle.get() * Math.seededRandom() - angle.get() / 2;
    }

    outPoints.set(fPoints);
    // console.log(forces);
}

let mark = new CGL.Marker(cgl);
op.onDelete = function () {};

exec.onTriggered = function ()
{
    // if(show.get())
    // {
    //     cgl.pushModelMatrix();

    //     if(!mesh)mesh=new CGL.WirePoint(cgl);
    //     mat4.translate(cgl.mMatrix,cgl.mMatrix,[posX.get(),posY.get(),posZ.get()]);
    //     mesh.render(cgl,range.get()*2);
    //     cgl.popModelMatrix();
    // }
    if (show.get())
    {
        for (var i = 0; i < num.get(); i++)
        {
            // vec3.transformMat4(forces[i].pos, forces[i].posOrig, cgl.mMatrix);
            // CABLES.forceFieldForces.push( forces[i] );

            cgl.pushModelMatrix();

            // if(!mesh)mesh=new CGL.WirePoint(cgl);
            mat4.translate(cgl.mMatrix, cgl.mMatrix, forces[i].pos);
            // mesh.render(cgl,range.get()*2);
            mark.draw(cgl);
            cgl.popModelMatrix();
        }
    }

    // updateForceObject();

    CABLES.forceFieldForces = CABLES.forceFieldForces || [];
    // CABLES.forceFieldForces.push(forceObj);

    for (var i = 0; i < num.get(); i++)
    {
        // vec3.transformMat4(forces[i].pos, forces[i].posOrig, cgl.mMatrix);
        CABLES.forceFieldForces.push(forces[i]);
    }
    // console.log(forces[0].pos);
    // console.log(CABLES.forceFieldForces.length);

    next.trigger();

    for (var i = 0; i < num.get(); i++)
        CABLES.forceFieldForces.pop();
};

reset();
