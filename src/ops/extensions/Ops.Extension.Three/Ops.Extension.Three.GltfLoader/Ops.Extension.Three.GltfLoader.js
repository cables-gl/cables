const
    exec = op.inTrigger("Trigger"),
    inUrl = op.inUrl("File", [".glb"]),
    inRescale = op.inFloat("Rescale Size", 1),
    next = op.outTrigger("Next"),
    result = op.outNumber("Result");

let gltf = null;
const threeOp = new CABLES.ThreeOp(op);
const container = new THREE.Object3D();

inRescale.onChange = rescale;

inUrl.onChange = () =>
{
    const loader = new THREE.ADDONS.GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    loader.loadAsync(inUrl.get()).then((_gltf, a, b, c) =>
    {
        if (gltf)container.remove(gltf.scene);
        gltf = _gltf;
        console.log("finish!", gltf);
        container.add(gltf.scene);
        threeOp.setSceneObject(container);
        rescale();
    }).catch(() =>
    {
        console.log("errrrrrr");
    });
};

function rescale()
{
    if (!gltf) return;

    container.remove(gltf.scene);

    const root = gltf.scene;
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxAxis = Math.max(size.x, size.y, size.z);
    const scale = inRescale.get() / maxAxis;
    container.add(gltf.scene);

    container.scale.x = container.scale.y = container.scale.z = scale;
}

exec.onTriggered = () =>
{
    threeOp.push();
    next.trigger();
    threeOp.pop();
};
