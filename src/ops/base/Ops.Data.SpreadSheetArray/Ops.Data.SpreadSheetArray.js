const
    spread = op.inArray("Spreadsheet"),
    outp = op.inSwitch("Format", ["Flat", "Objects", "Arrays"], "Flat"),
    inDefault = op.inSwitch("Default Output Value", ["0", "Empty String", "null"], "0"),
    result = op.outArray("Array"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outColNames = op.outArray("Column Names");

spread.setUiAttribs({ "hidePort": true });
outp.setUiAttribs({ "hidePort": true });

outp.onChange =
inDefault.onChange =
spread.onChange = update;

updateUi();

function updateUi()
{
    spread.setUiAttribs({
        "display": "spreadsheet"
    });
}

function update()
{
    const o = spread.get();
    console.log("spread", o);

    outWidth.set(o.width);
    outHeight.set(o.height);

    let r = structuredClone(o.data);

    if (inDefault.get() == "0") for (let i = 0; i < r.length; i++) if (!r[i])r[i] = 0;
    if (inDefault.get() == "Empty String") for (let i = 0; i < r.length; i++) if (!r[i])r[i] = "";
    if (inDefault.get() == "null") for (let i = 0; i < r.length; i++) if (!r[i])r[i] = null;

    if (outp.get() == "Objects")
    {
        r = toJson(r, o.width, o.height, o.colTitles);
        result.setUiAttribs({ "stride": 1 });
    }
    else
    if (outp.get() == "Objects") r = toJson(r, o.width, o.height, o.colTitles);
    else
    if (outp.get() == "Arrays") r = toArrays(r, o.width, o.height, o.colTitles);

    if (outp.get() == "Flat") result.setUiAttribs({ "stride": o.width });
    else result.setUiAttribs({ "stride": 1 });

    result.setRef(r);
}

function toJson(data, w, h, titles)
{
    const arr = [];

    for (let y = 0; y < h; y++)
    {
        const json = {};
        for (let x = 0; x < w; x++)
        {
            const title = titles[x] || String(x);
            json[title] = data[x + y * w];
        }
        arr.push(json);
    }
    return arr;
}

function toArrays(data, w, h, titles)
{
    const arr = [];
    for (let x = 0; x < w; x++) arr[x] = [];

    for (let x = 0; x < w; x++)
        for (let y = 0; y < h; y++)
            arr[x][y] = data[x + y * w];

    return arr;
}
