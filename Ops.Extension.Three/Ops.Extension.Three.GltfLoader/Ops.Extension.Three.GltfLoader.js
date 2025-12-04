const
    exec = op.inTrigger("Trigger"),
    inUrl = op.inUrl("File"),

    result = op.outNumber("Result");

inUrl.onChange = () =>
{
    const loader = new GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const gltf = loader.loadAsync(inUrl.get()).then(() =>
    {
        console.log("finish!");
    }).catch(() =>
    {
        console.log("errrrrrr");
    });
    scene.add(gltf.scene);
};
