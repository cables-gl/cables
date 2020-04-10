let loadingId=0;
let skyboxCubemap=null;
const gl=op.patch.cgl.gl;
const cgl=op.patch.cgl;


const inFilenames=[];

const titles = [
"posx", "negx",
"posy", "negy",
"posz", "negz"
];

titles.forEach(function(title) { // create inlet ports
   const inFilename = op.inUrl(title, "image");
   inFilename.onChange = loadImages; // assign on change handlers
   inFilenames.push(inFilename);
});

const inFlipY = op.inBool("Flip Y", false);
var outTex=op.outObject("cubemap");
inFlipY.onChange = loadImages;


function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = '';
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (err) => reject(err));
        image.src = src;
    });
}

function loadImages() {
    op.setUiError("loadingerror", null);
    op.setUiError("loading", "Loading images..." , 0);

    skyboxCubemap = null;
    loadingId=cgl.patch.loading.start('cubemap texture','');

    const images = Promise.all(
        inFilenames.map(inFile => inFile.get()) // get file address
        .filter(Boolean) // remove all 0's (empty file adresses) so we only resolve
        .map(filename => loadImage(filename))) // map to resolver function

    .then((images) => { // wait for all images to be loaded and only then continue
        if (images.length === 6) {
            cgl.gl.pixelStorei(
                cgl.gl.UNPACK_FLIP_Y_WEBGL,
                inFlipY.get()
            );
            skyboxCubemap = cgl.gl.createTexture(cgl.gl.TEXTURE_CUBE_MAP);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, skyboxCubemap);

            cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_S, cgl.gl.CLAMP_TO_EDGE);
            cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_T, cgl.gl.CLAMP_TO_EDGE);
            cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.LINEAR_MIPMAP_LINEAR);
            cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.LINEAR);

            if (inFlipY.get()) {
                const temp = images[2];
                images[2] = images[3];
                images[3] = temp;
            }

            images.forEach((img, index) => {
                cgl.gl.bindTexture(
                    cgl.gl.TEXTURE_CUBE_MAP,
                    skyboxCubemap
                );

                cgl.gl.texImage2D(
                    cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X + index,
                    0,
                    cgl.gl.RGBA,
                    cgl.gl.RGBA,
                    cgl.gl.UNSIGNED_BYTE,
                    img
                );
            });

        cgl.gl.generateMipmap(cgl.gl.TEXTURE_CUBE_MAP);

        outTex.set({ "cubemap": skyboxCubemap });

        cgl.patch.loading.finished(loadingId);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, null);
        op.setUiError("loading", null);
        }
    })
    .catch(err => {
        console.error("error", err);
        op.setUiError("loadingerror", "Could not load textures!" , 2);
    });
}