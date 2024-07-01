let inUrls = op.addInPort(new CABLES.Port(op, "URLs", CABLES.OP_PORT_TYPE_ARRAY));
let outTextures = op.addOutPort(new CABLES.Port(op, "Textures", CABLES.OP_PORT_TYPE_ARRAY));

let texArr = [];

function loadTexture(url)
{
    if (!url) return;
    let loadingId = op.patch.loading.start("array texture loader", "" + url);

    let tex = CGL.Texture.load(op.patch.cgl, url,
        function (err)
        {
            op.patch.loading.finished(loadingId);

            if (err)
            {
                console.log("could not load texture ", url);
            }
        },
        {
            "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            "filter": CGL.Texture.FILTER_MIPMAP,
            "flip": false
        });
    return tex;
}

inUrls.onChange = function ()
{
    if (!inUrls.get()) return;

    let urls = inUrls.get();

    console.log("arraytextureloader", urls.length);
    texArr.length = 0;
    for (let i in urls)
    {
        // console.log('load ',urls[i]);
        texArr.push(loadTexture(urls[i]));
    }
    outTextures.set(texArr);
};
