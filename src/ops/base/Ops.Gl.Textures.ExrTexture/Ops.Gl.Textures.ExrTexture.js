const
    inFile = op.inUrl("EXR File", [".exr"]),
    inAlpha = op.inBool("Remove Alpha", false),
    outTex = op.outTexture("Texture"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outChannels = op.outString("Channels"),
    outLoading = op.outBool("Loading");

let
    loadingId = null,
    timedLoader = null,
    finishedLoading = false;

const cgl = op.patch.cgl;

inAlpha.onChange =
inFile.onChange = reloadSoon;

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function () { loadBin(nocache); }, 30);
}

function loadBin(addCacheBuster)
{
    // if (!inActive.get()) return;

    if (!loadingId)loadingId = op.patch.loading.start("gltf" + inFile.get(), inFile.get());

    let url = op.patch.getFilePath(String(inFile.get()));
    if (addCacheBuster)url += "?rnd=" + CABLES.generateUUID();
    finishedLoading = false;
    outLoading.set(true);
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    op.patch.loading.addAssetLoadingTask(() =>
    {
        oReq.onload = (oEvent) =>
        {
            const arrayBuffer = oReq.response;
            const l = new CABLES.EXRLoader();

            try
            {
                const p = l.parse(arrayBuffer);

                console.log(l, p);

                outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));

                if (p)
                {
                    const arr = new Float32Array(p.data.length);
                    for (let i = 0; i < p.data.length; i++)
                        arr[i] = p.data[i];

                    if (inAlpha.get())
                        for (let i = 3; i < arr.length; i += 4)arr[i] = 1;

                    let channels = "";
                    for (let i = 0; i < p.header.channels.length; i++)
                        channels += p.header.channels[i].name;

                    outChannels.set(channels);

                    const tex = new CGL.Texture(cgl, {
                        "filter": CGL.Texture.FILTER_NEAREST,
                        "wrap": CGL.Texture.WRAP_REPEAT,
                        "isFloatingPointTexture": true });

                    tex.initFromData(arr, p.width, p.height, CGL.Texture.FILTER_NEAREST, CGL.Texture.WRAP_REPEAT);
                    outTex.set(tex);
                    outWidth.set(p.width);
                    outHeight.set(p.height);
                }
                else
                {
                    outWidth.set(0);
                    outHeight.set(0);
                }
            }
            catch (e)
            {
                op.logError(e);
            }

            cgl.patch.loading.finished(loadingId);
            finishedLoading = true;
            outLoading.set(false);

            // finishLoading();
        };

        oReq.send(null);
    });
}
