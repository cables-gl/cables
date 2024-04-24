const
    spread = op.inArray("Spreadsheet"),
    inNumColumns = op.inInt("Num Columns", 3),
    outp = op.inSwitch("Format", ["Flat", "Objects", "Arrays"], "Flat"),
    result = op.outArray("Array"),
    outColNames = op.outArray("Column Names");

// spread.hidePort();
spread.setUiAttribs({ "hidePort": true });
inNumColumns.setUiAttribs({ "hidePort": true });
outp.setUiAttribs({ "hidePort": true });
// inNumColumns.hidePort();

outp.onChange =
spread.onChange = update;

inNumColumns.onChange = updateUi;
updateUi();

function updateUi()
{
    result.setUiAttribs({ "stride": inNumColumns.get() });
    spread.setUiAttribs({
        "display": "spreadsheet",
        "spread_numColumns": inNumColumns.get()
    });
}

function update()
{
    result.set(null);

    if (!spread.get()) return;

    outColNames.set(spread.get().colNames);

    if (outp.get() == "Flat")
    {
        result.set(asFlat());
    }
    else if (outp.get() == "Objects" || outp.get() == "Arrays")
    {
        result.set(asObjectArray(outp.get() == "Objects"));
    }
}

function asFlat()
{
    const data = spread.get();
    data.cells = data.cells || [];

    if (!data.cols) return;

    const arr = [];
    arr.length = data.cells.length * data.cols || 1;
    let lastRow = 0;
    for (let y = 0; y < data.cells.length; y++)
    {
        if (data.cells[y])
            for (let x = 0; x < data.cells[0].length; x++)
            {
                let v = data.cells[y][x] || null;
                if (CABLES.UTILS.isNumeric(v)) v = parseFloat(v);
                if (v !== "" && v !== null) lastRow = y;

                arr[x + (y * data.cols)] = v;
            }
    }

    let arrSize = (lastRow + 1) * data.cols;

    arr.length = arrSize;

    return arr;
}

function asObjectArray(objects)
{
    const data = spread.get() || {};
    data.cells = data.cells || [];

    const arr = [];
    arr.length = data.cells.length;
    let lastRow = 0;
    for (let y = 0; y < data.cells.length; y++)
    {
        let o = [];
        if (objects) o = {};
        arr[y] = o;

        if (data.cells[y])
            for (let x = 0; x < data.cols; x++)
            {
                let v = data.cells[y][x] || null;
                if (CABLES.UTILS.isNumeric(v)) v = parseFloat(v);
                if (v !== "" && v !== null) lastRow = y;

                if (objects) o[getColName(data, x)] = v;
                else o[x] = v;
            }
    }
    arr.length = lastRow + 1;

    return arr;
}

function getColName(data, c)
{
    if (data && data.colNames && data.colNames.length > c && data.colNames[c])
    {
        return data.colNames[c];
    }

    let str = "";

    while (c >= 0)
    {
        str = "abcdefghijklmnopqrstuvwxyz"[c % 26] + str;
        c = Math.floor(c / 26) - 1;
    }

    return str;
}
