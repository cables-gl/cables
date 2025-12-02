const
    inUrl = op.inUrl("File"),
    next = op.outTrigger("Next"),
    result = op.outObject("Texture", null, "three texture");

const loader = new THREE.TextureLoader();
let loadingId = null;

inUrl.onChange = () =>
{
    let url = op.patch.getFilePath(String(inUrl.get()));
    if (loadingId)loadingId = op.patch.loading.finished(loadingId);
    loadingId = op.patch.loading.start(op.objName, inUrl.get(), op);

    op.setUiAttrib({ "extendTitle": CABLES.basename(url) });

    loader.loadAsync(url).then((tex) =>
    {
        result.setRef(tex);
        loadingId = op.patch.loading.finished(loadingId);
    }).catch((a, b) =>
    {
        console.log("NEEEEEEEE", a, b);
        loadingId = op.patch.loading.finished(loadingId);
        op.setUiError("urlerror", "could not load texture: ", 2);
    });
};
