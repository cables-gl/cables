const
    inFile = op.inUrl("File", [".csv", ".tsv", ".txt"]),
    inDelimiter = op.inSwitch("Delimiter", ["Auto", "Comma", "Semicolon", "Tab", "Pipe", "Custom"], "Auto"),
    inCustomDelimiter = op.inString("Custom Delimiter", ","),
    inEncoding = op.inDropDown("Encoding", ["UTF-8", "Windows-1252", "ISO-8859-1"], "UTF-8"),
    inHeader = op.inBool("First Row Is Header", true),
    inFormat = op.inSwitch("Format", ["Objects", "Arrays"], "Objects"),
    inNumbers = op.inBool("Parse Numbers", true),
    inBooleans = op.inBool("Parse Booleans", false),
    inEmptyNull = op.inBool("Empty As Null", false),
    inTrim = op.inBool("Trim", true),
    inSkipEmpty = op.inBool("Skip Empty Lines", true),
    inComment = op.inString("Comment Char", ""),
    inReload = op.inTriggerButton("Reload"),
    outResult = op.outArray("Result"),
    outColNames = op.outArray("Column Names"),
    outNumRows = op.outNumber("Num Rows"),
    outNumCols = op.outNumber("Num Columns"),
    outDetected = op.outString("Detected Delimiter"),
    outLoading = op.outBoolNum("Is Loading", false),
    outHasError = op.outBoolNum("Has Error", false),
    outError = op.outString("Error"),
    outLoaded = op.outTrigger("Loaded");

op.setPortGroup("Format", [inDelimiter, inCustomDelimiter, inEncoding, inHeader, inFormat]);
op.setPortGroup("Values", [inNumbers, inBooleans, inEmptyNull, inTrim, inSkipEmpty, inComment]);

outResult.ignoreValueSerialize = true;

const DELIMITER_CHARS = { "Comma": ",", "Semicolon": ";", "Tab": "\t", "Pipe": "|" };
let text = null;
let loadId = 0;

inFile.onChange =
    inEncoding.onChange = load;
inReload.onTriggered = load;

inDelimiter.onChange =
    inCustomDelimiter.onChange =
    inHeader.onChange =
    inFormat.onChange =
    inNumbers.onChange =
    inBooleans.onChange =
    inEmptyNull.onChange =
    inTrim.onChange =
    inSkipEmpty.onChange =
    inComment.onChange = update;

op.onFileChanged = (fn) =>
{
    if (inFile.get() && inFile.get().indexOf(fn) > -1) load();
};

updateUi();

function updateUi()
{
    inCustomDelimiter.setUiAttribs({ "greyout": inDelimiter.get() != "Custom" });
}

function setError(e)
{
    op.setUiError("loaderr", e ? "Could not load file: " + e : null, 2);
    outError.set(e ? String(e) : "");
    outHasError.set(!!e);
}

function load()
{
    const id = ++loadId;
    text = null;
    setError(null);

    if (!inFile.get())
    {
        op.setUiError("nofile", "No file selected", 1);
        op.setUiAttrib({ "extendTitle": "" });
        update();
        return;
    }
    op.setUiError("nofile", null);
    op.setUiAttrib({ "extendTitle": CABLES.basename(inFile.get()) });

    const url = op.patch.getFilePath(inFile.get());
    const encoding = inEncoding.get();
    const loadingId = op.patch.loading.start(op.objName, inFile.get(), op);
    outLoading.set(true);

    op.patch.loading.addAssetLoadingTask(() =>
    {
        fetch(url)
            .then((res) =>
            {
                if (!res.ok) throw new Error(res.status + " " + res.statusText);
                return res.arrayBuffer();
            })
            .then((buf) =>
            {
                if (id != loadId) return;
                text = new TextDecoder(encoding.toLowerCase()).decode(buf);
                update();
            })
            .catch((e) =>
            {
                if (id != loadId) return;
                setError(e.message || e);
                update();
            })
            .finally(() =>
            {
                op.patch.loading.finished(loadingId);
                if (id != loadId) return;
                outLoading.set(false);
                outLoaded.trigger();
            });
    });
}

function update()
{
    updateUi();
    op.setUiError("unclosed", null);

    if (text === null)
    {
        outResult.setRef(null);
        outColNames.setRef(null);
        outNumRows.set(0);
        outNumCols.set(0);
        outDetected.set("");
        return;
    }

    let delimiter = DELIMITER_CHARS[inDelimiter.get()] || null;
    if (inDelimiter.get() == "Custom") delimiter = inCustomDelimiter.get() || ",";

    const r = parseCsv(text,
    {
        "delimiter": delimiter,
        "header": inHeader.get(),
        "objects": inFormat.get() == "Objects",
        "numbers": inNumbers.get(),
        "booleans": inBooleans.get(),
        "emptyNull": inEmptyNull.get(),
        "trim": inTrim.get(),
        "skipEmpty": inSkipEmpty.get(),
        "comment": inComment.get()
    });

    if (r.unclosed) op.setUiError("unclosed", "Unclosed quote, the file might be cut off", 1);

    outDetected.set(r.delimiter);
    outNumRows.set(r.result.length);
    outNumCols.set(r.width);
    outColNames.setRef(r.names);
    outResult.setRef(r.result);
}

const DELIMITERS = [",", ";", "\t", "|"];
const NUM_REGEX = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

function detectDelimiter(str)
{
    const lines = [];
    let inQuote = false;
    let counts = {};
    for (let i = 0; i < str.length && lines.length < 10; i++)
    {
        const c = str[i];
        if (c == "\"") inQuote = !inQuote;
        else if (!inQuote && (c == "\n" || c == "\r"))
        {
            if (c == "\r" && str[i + 1] == "\n") i++;
            lines.push(counts);
            counts = {};
        }
        else if (!inQuote && DELIMITERS.includes(c)) counts[c] = (counts[c] || 0) + 1;
    }
    if (Object.keys(counts).length) lines.push(counts);

    let best = ",";
    let bestScore = 0;
    let bestCount = 0;
    for (const d of DELIMITERS)
    {
        const freq = {};
        for (const l of lines)
            if (l[d]) freq[l[d]] = (freq[l[d]] || 0) + 1;
        for (const n in freq)
        {
            const count = Number(n);
            if (freq[n] > bestScore || (freq[n] == bestScore && count > bestCount))
            {
                best = d;
                bestScore = freq[n];
                bestCount = count;
            }
        }
    }
    return best;
}

function parseRows(str, delim, opts)
{
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    let inQuote = false;
    let lineStart = true;
    const dl = delim.length;
    const n = str.length;

    const endCell = () =>
    {
        row.push({ "v": (opts.trim && !quoted) ? cell.trim() : cell, "q": quoted });
        cell = "";
        quoted = false;
    };
    const endRow = () =>
    {
        endCell();
        if (!(opts.skipEmpty && row.length == 1 && row[0].v === "" && !row[0].q)) rows.push(row);
        row = [];
        lineStart = true;
    };

    for (let i = 0; i < n; i++)
    {
        const c = str[i];

        if (inQuote)
        {
            if (c == "\"")
            {
                if (str[i + 1] == "\"")
                {
                    cell += "\"";
                    i++;
                }
                else inQuote = false;
            }
            else cell += c;
            continue;
        }

        if (lineStart && opts.comment && str.startsWith(opts.comment, i))
        {
            while (i < n && str[i] != "\n" && str[i] != "\r") i++;
            if (str[i] == "\r" && str[i + 1] == "\n") i++;
            continue;
        }
        lineStart = false;

        if (c == "\"" && cell.trim() === "" && !quoted)
        {
            cell = "";
            quoted = true;
            inQuote = true;
        }
        else if (str.startsWith(delim, i))
        {
            endCell();
            i += dl - 1;
        }
        else if (c == "\n" || c == "\r")
        {
            if (c == "\r" && str[i + 1] == "\n") i++;
            endRow();
        }
        else if (quoted && opts.trim && (c == " " || c == "\t")) continue;
        else cell += c;
    }

    const unclosed = inQuote;
    if (!lineStart || cell !== "" || quoted || row.length) endRow();

    return { rows, unclosed };
}

function convert(cell, opts)
{
    const v = cell.v;
    if (v === "") return opts.emptyNull ? null : "";
    // leading zeros are kept as strings: zip codes, ids
    if (opts.numbers && NUM_REGEX.test(v) && !/^[-+]?0\d/.test(v)) return Number(v);
    if (opts.booleans)
    {
        const l = v.toLowerCase();
        if (l == "true") return true;
        if (l == "false") return false;
    }
    return v;
}

function uniqueNames(cells, width)
{
    const names = [];
    const used = {};
    for (let i = 0; i < width; i++)
    {
        let name = cells[i] ? String(cells[i].v) : "";
        if (name === "") name = "column_" + i;
        if (used[name])
        {
            let k = 2;
            while (used[name + "_" + k]) k++;
            name = name + "_" + k;
        }
        used[name] = true;
        names.push(name);
    }
    return names;
}

function parseCsv(str, opts)
{
    if (str.charCodeAt(0) == 0xFEFF) str = str.slice(1);
    const delim = opts.delimiter || detectDelimiter(str);
    const { rows, unclosed } = parseRows(str, delim, opts);

    let width = 0;
    for (const r of rows) width = Math.max(width, r.length);

    let names = [];
    let start = 0;
    if (opts.header && rows.length)
    {
        names = uniqueNames(rows[0], width);
        start = 1;
    }
    else
        for (let i = 0; i < width; i++) names.push(String(i));

    const empty = opts.emptyNull ? null : "";
    const result = [];
    for (let y = start; y < rows.length; y++)
    {
        const r = rows[y];
        const vals = [];
        for (let x = 0; x < width; x++) vals.push(x < r.length ? convert(r[x], opts) : empty);

        if (opts.objects)
        {
            const o = {};
            for (let x = 0; x < width; x++) o[names[x]] = vals[x];
            result.push(o);
        }
        else result.push(vals);
    }

    return { result, names, "delimiter": delim, unclosed, width };
}
