const
    exec = op.inTrigger("Trigger"),
    inUrl = op.inUrl("File"),
    next = op.outTrigger("Next"),
    result = op.outNumber("Result");

const threeOp = new CABLES.ThreeOp(op);

inUrl.onChange = () =>
{
    const loader = new THREE.ADDONS.GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    loader.loadAsync(inUrl.get()).then((gltf, a, b, c) =>
    {
        console.log("finish!", gltf);
        threeOp.setSceneObject(gltf.scene);
    }).catch(() =>
    {
        console.log("errrrrrr");
    });

};


exec.onTriggered=() => {

    threeOp.push();
    next.trigger();
    threeOp.pop();
};