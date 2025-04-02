// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html

const a = op.inFloat("name", 0);
const aa = op.inFloat("aaabbbbb", 0);
const ba = op.inFloat("aaaa", 0);
const trig = op.inTrigger("Render");
const lala = op.outObject("Test");

const cgl = op.patch.cgl;
const meshRect = new CGL.WireframeRect(cgl);

trig.onTriggered = () =>
{
    meshRect.render();
};

lala.set(new Float32Array(100));
