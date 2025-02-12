const
    spread = op.inArray("Spreadsheet"),
    inNumColumns = op.inInt("Num Columns", 2),
    result = op.outObject("Result");

spread.setUiAttribs({ "hidePort": true });
inNumColumns.setUiAttribs({ "hidePort": true });

spread.onChange = update;
inNumColumns.onChange = updateUi;

updateUi();

function updateUi()
{
    spread.setUiAttribs({
        "display": "spreadsheet",
        "spread_numColumns": inNumColumns.get()
    });
    update();
}

function update()
{
    if (!spread.get())
    {
        result.set(null);

        return;
    }

    const data = spread.get();
    data.cells = data.cells || [];

    const obj = {};

    for (let y = 0; y < data.cells.length; y++)
    {
        if (data.cells[y])
        {
            if (data.cols == 2)
            {
                let v = data.cells[y][1] || null;
                if (CABLES.isNumeric(v)) v = parseFloat(v);

                if (data.cells[y][0]) obj[data.cells[y][0]] = v;
            }

            if (data.cols > 2)
            {
                let row = {};

                for (let x = 1; x < data.cols; x++)
                {
                    let v = data.cells[y][x] || null;
                    if (CABLES.isNumeric(v)) v = parseFloat(v);

                    row[getColName(data, x)] = v;
                }
                if (data.cells[y] && data.cells[y][0] && row) obj[data.cells[y][0]] = row;
            }
        }
    }
    result.setRef(obj);
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
