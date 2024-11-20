const
    inColors = op.inArray("Colors"),
    inSort = op.inSwitch("Sort", ["No", "Luminance", "Hue", "Saturation", "Lightness"], "Luminance"),
    inInpStride = op.inSwitch("Input Format", ["RGBA", "RGB"]),
    outColors = op.outArray("New Colors");

op.toWorkPortsNeedToBeLinked(inColors, outColors);

inInpStride.onChange =
inSort.onChange =
inColors.onChange = () =>
{
    const arr = inColors.get();
    if (!arr)
    {
        outColors.setRef([]);
        return;
    }

    const rgbaArr = [];

    let stride = 4;
    if (inInpStride.get() == "RGB")stride = 3;
    let a = 0.0;
    if (stride == 3)a = 1;

    for (let i = 0; i < arr.length; i += stride)
    {
        const rgba = [arr[i + 0], arr[i + 1], arr[i + 2], a || arr[i + 3]];
        rgbaArr.push(rgba);
    }

    if (inSort.get() == "Luminance")
        rgbaArr.sort((a, b) =>
        {
            const lumA = chroma(a[0] * 255, a[1] * 255, a[2] * 255, "rgb").luminance();
            const lumB = chroma(b[0] * 255, b[1] * 255, b[2] * 255, "rgb").luminance();
            return lumA - lumB;
        });
    else if (inSort.get() == "Hue")
        rgbaArr.sort((a, b) =>
        {
            const hslA = chroma(a[0] * 255, a[1] * 255, a[2] * 255, "rgb").hsl();
            const hslB = chroma(b[0] * 255, b[1] * 255, b[2] * 255, "rgb").hsl();
            return hslA[0] - hslB[0];
        });
    else if (inSort.get() == "Saturation")
        rgbaArr.sort((a, b) =>
        {
            const hslA = chroma(a[0] * 255, a[1] * 255, a[2] * 255, "rgb").hsl();
            const hslB = chroma(b[0] * 255, b[1] * 255, b[2] * 255, "rgb").hsl();
            return hslA[1] - hslB[1];
        });
    else if (inSort.get() == "Lightness")
        rgbaArr.sort((a, b) =>
        {
            const hslA = chroma(a[0] * 255, a[1] * 255, a[2] * 255, "rgb").hsl();
            const hslB = chroma(b[0] * 255, b[1] * 255, b[2] * 255, "rgb").hsl();
            return hslA[2] - hslB[2];
        });

    let resultArr = [];
    resultArr.length = arr.length;
    for (let i = 0; i < arr.length; i += 4)
    {
        resultArr[i + 0] = rgbaArr[i / 4][0];
        resultArr[i + 1] = rgbaArr[i / 4][1];
        resultArr[i + 2] = rgbaArr[i / 4][2];
        resultArr[i + 3] = rgbaArr[i / 4][3];
    }

    outColors.setRef(resultArr);
};
