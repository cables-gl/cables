const
    inExec = op.inTrigger("Render"),
    outTex = op.outTexture("Texture");


let tex = null;
const cgl = op.patch.cgl;

inExec.onTriggered = function ()
{
    if (tex) return;

    if (!cgl.frameStore.currentScene || !cgl.frameStore.currentScene.json) return;

    console.log(cgl.frameStore.currentScene);

    const texInfo = cgl.frameStore.currentScene.json.textures[0];

    const img = cgl.frameStore.currentScene.json.images[texInfo.source];


    console.log("img", img);


    const buffView = cgl.frameStore.currentScene.json.bufferViews[img.bufferView];
    console.log(buffView);


    console.log("gltf.chunks", cgl.frameStore.currentScene.chunks);

    const dv = cgl.frameStore.currentScene.chunks[1].dataView;// new DataView(cgl.frameStore.currentScene.chunks[1], buffer.byteOffset, buffer.byteLength);

    const data = new Uint8Array(buffView.byteLength);

    for (let i = 0; i < buffView.byteLength; i++)
    {
        if(i<100)console.log(dv.getUint8(buffView.byteOffset + i));
        data[i] = dv.getUint8(buffView.byteOffset + i);
    }

    console.log(data);
    console.log("img.mimeType",img.mimeType);

    const blob = new Blob([data.buffer], { "type": img.mimeType });
    const sourceURI = URL.createObjectURL(blob);

    tex = CGL.Texture.load(cgl, sourceURI,
        function (err)
        {
            // if(err)
            // {
            //     setTempTexture();
            //     console.log(err);
            //     op.setUiError('urlerror','could not load texture:<br/>"'+filename.get()+'"',2);
            //     cgl.patch.loading.finished(loadingId);
            //     return;
            // }
            // else op.setUiError('urlerror',null);
            outTex.set(tex);
            // width.set(tex.width);
            // height.set(tex.height);
            // ratio.set(tex.width/tex.height);

            // if(!tex.isPowerOfTwo())  op.setUiError('npot','Texture dimensions not power of two! - Texture filtering will not work in WebGL 1.',0);
            // else op.setUiError('npot',null);

            outTex.set(null);
            outTex.set(tex);

            // loaded.set(true);
            // cgl.patch.loading.finished(loadingId);
        }, {
            // anisotropic:cgl_aniso,
            // wrap:cgl_wrap,
            // flip:flip.get(),
            // unpackAlpha:unpackAlpha.get(),
            // filter:cgl_filter
        });

    outTex.set(null);
    outTex.set(tex);

    console.log(sourceURI);
};
