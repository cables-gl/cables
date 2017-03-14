op.name="DrawForces";

var exec=op.inFunction("exec");
var next=op.outFunction("next");

var outIndex=op.outValue("Index");

var outAttraction=op.outValue("Attraction");
var outRange=op.outValue("Range");


var cgl=op.patch.cgl;
var vec=vec3.create();

exec.onTriggered=function()
{
    for(var j=0;j<CABLES.forceFieldForces.length;j++)
    {
        cgl.pushMvMatrix();
        vec3.set(vec, CABLES.forceFieldForces[j].pos[0],CABLES.forceFieldForces[j].pos[1],CABLES.forceFieldForces[j].pos[2]);
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        
        outIndex.set(j);
        outRange.set(CABLES.forceFieldForces[j].range);
        outAttraction.set(CABLES.forceFieldForces[j].attraction);

        next.trigger();
        cgl.popMvMatrix();
    }

};


