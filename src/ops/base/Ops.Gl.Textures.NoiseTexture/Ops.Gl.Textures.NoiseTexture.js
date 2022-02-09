const
    inWidth = op.inValueInt("Width", 256),
    inHeight = op.inValueInt("Height", 256),
    inColor = op.inValueBool("Color", false),
    outTex = op.outTexture("Texture");

const cgl = op.patch.cgl;

inWidth.onChange =
    inHeight.onChange =
    inColor.onChange = update;

update();

function update()
{
    let width = Math.ceil(inWidth.get());
    let height = Math.ceil(inHeight.get());

    if (width < 1)width = 1;
    if (height < 1)height = 1;

    const num = width * 4 * height;
    const pixels = new Uint8Array(num);

    if (inColor.get())
    {
        for (let i = 0; i < num; i += 4)
        {
            pixels[i + 0] = Math.random() * 255;
            pixels[i + 1] = Math.random() * 255;
            pixels[i + 2] = Math.random() * 255;
            pixels[i + 3] = 255;
        }
    }
    else
    {
        for (let i = 0; i < num; i += 4)
        {
            let c = Math.random() * 255;
            pixels[i + 0] = c;
            pixels[i + 1] = c;
            pixels[i + 2] = c;
            pixels[i + 3] = 255;
        }
    }

    let tex = new CGL.Texture(cgl, { "wrap": CGL.Texture.WRAP_REPEAT });

    tex.initFromData(pixels, width, height);

    outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
    outTex.set(tex);
}
