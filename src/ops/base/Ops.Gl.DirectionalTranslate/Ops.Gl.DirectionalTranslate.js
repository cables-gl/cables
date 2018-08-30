const exec=op.inFunction("Exec");
const inMatrix=op.inArray("Center Model Matrix");
const inAmount=op.inValue("Amount");
const next=op.outFunction("Next");

const cgl=op.patch.cgl;

var va=vec3.create();
var vb=vec3.create();
var diff=vec3.create();
var mm=mat3.create();

exec.onTriggered=function()
{
    var matbefore=inMatrix.get();
    if(!matbefore)return;

    mat4.getTranslation(va,matbefore);
    mat4.getTranslation(vb,cgl.modelMatrix());

    mat3.fromMat4(mm,cgl.modelMatrix());
    mat3.invert(mm,mm);

    vec3.sub(diff,vb,va);
    vec3.normalize(diff,diff);
    vec3.transformMat3(diff,diff,mm );    
    vec3.normalize(diff,diff);

    diff[0]*=inAmount.get();
    diff[1]*=inAmount.get();
    diff[2]*=inAmount.get();

    cgl.pushModelMatrix();
    mat4.translate(cgl.mMatrix,cgl.mMatrix, diff);
    next.trigger();
    cgl.popModelMatrix();
};
