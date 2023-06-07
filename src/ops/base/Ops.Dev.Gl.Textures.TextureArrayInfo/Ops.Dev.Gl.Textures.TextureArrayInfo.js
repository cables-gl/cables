const
    inArr = op.inArray("Texture Array"),
    outArrNames = op.outArray("names"),
    outArrWidth = op.outArray("Widths"),
    outArrHeight = op.outArray("Heights");

inArr.onChange = () =>
{
    const arr = inArr.get();
    const arrWidths = [];
    const arrHeights = [];
    const arrNames = [];

    if (arr)
        for (let i = 0; i < arr.length; i++)
        {
            if (arr[i] && arr[i].tex)
            {
                arrWidths.push(arr[i].width);
                arrHeights.push(arr[i].height);
                arrNames.push(arr[i].name);
            }
        }

    outArrWidth.setRef(arrWidths);
    outArrHeight.setRef(arrHeights);
    outArrNames.setRef(arrNames);
};
