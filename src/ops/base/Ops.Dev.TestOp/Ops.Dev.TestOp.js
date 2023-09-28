// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html

// sss

const a = op.inFloat("name", 0);
const aa = op.inFloat("aaaa", 0);
const trig = op.inTrigger("Render");
const lala = op.outObject("Test");

const cgl = op.patch.cgl;
const meshRect = new CGL.WireframeRect(cgl);

trig.onTriggered = () =>
{
    meshRect.render();
    console.log(op.storage);
    console.log(this.storage);
};

// op.setStorage({ "subPatchVer": 221 });

// console.log(op.storage);

// console.log(a.get());
// console.log(this.storage);

// console.log(JSON.stringify(this.uiAttribs));
