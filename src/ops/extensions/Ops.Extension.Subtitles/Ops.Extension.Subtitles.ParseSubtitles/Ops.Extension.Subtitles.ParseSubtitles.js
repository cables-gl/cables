const
    inData = op.inString("Subbtitle data"),
    outJson = op.outObject("Structure", null, "subtitles"),
    outLines = op.outArray("Subtitles");

const TIME_SEPARATOR = "-->";

inData.onChange = () =>
{
    op.setUiError("invalid_data", null);
    let structure = null;
    const data = inData.get();
    if (data)
    {
        const lines = data.split("\n");
        try
        {
            if (lines[0] && lines[0].startsWith("WEBVTT"))
            {
                structure = parse(lines, "WEBVTT");
            }
            else
            {
                structure = parse(lines);
            }
        }
        catch (e)
        {
            op.setUiError("invalid_data", "Could not parse SRT/WebVTT data");
        }

        if (!structure || structure.keys?.length === 0)
        {
            op.setUiError("invalid_data", "Could not find subtitle data in input");
        }
        else
        {
            outJson.setRef(structure);
            const lines = [];
            for (let i = 0; i < structure.keys.length; i++)
            {
                lines.push(structure.keys[i].lines.join("\n"));
            }
            outLines.setRef(lines);
        }
    }
    else
    {
        op.setUiError("invalid_data", "Could not parse SRT/WebVTT data");
    }
};

function parse(lines, format = "SRT")
{
    if (!lines) return null;
    let parsed = {
        "format": format,
        "keys": []
    };
    let currentScope = "";
    let currentKey = null;
    for (let i = 0; i < lines.length; i++)
    {
        const line = lines[i];
        const prevLine = lines[i - 1];
        if (line.trim() === "")
        {
            currentScope = "";
            continue;
        }

        switch (currentScope)
        {
        case "KEY":
            currentKey.lines = currentKey.lines || [];
            currentKey.lines.push(line);
            break;

        case "STYLE":
            parsed.style = parsed.style || "";
            parsed.style += line + "\n";
            break;

        case "REGION":
            parsed.region = parsed.region || {};
            const regionFields = line.split(":");
            if (regionFields.length === 2)
            {
                parsed.region = parsed.region || {};
                parsed.region[regionFields[0]] = regionFields[1];
            }
            break;

        case "NOTE":
            parsed.notes = parsed.notes || [];
            parsed.notes.push(line);
            break;

        default:
            // code
        }

        if (line.includes(TIME_SEPARATOR))
        {
            currentScope = "KEY";
            const parts = line.split(TIME_SEPARATOR);
            const start = parts[0].trim();
            const moreParts = parts[1].trim().split(" ");
            const end = moreParts[0].trim();
            const metaValues = moreParts.slice(1);
            currentKey = {
                "start": timeToSeconds(start, format),
                "end": timeToSeconds(end, format),
                "lines": [],
                "meta": moreParts.slice(1)
            };
            if (prevLine) currentKey.title = prevLine;
            if (metaValues)
            {
                const meta = {};
                metaValues.forEach((metaValue) =>
                {
                    const metaParts = metaValue.split(":");
                    if (metaParts.length === 2) meta[metaParts[0]] = metaParts[1];
                });
                currentKey.meta = meta;
            }
            parsed.keys.push(currentKey);
        }
        else if (line.trim() === "STYLE")
        {
            currentScope = "STYLE";
        }
        else if (line.trim() === "REGION")
        {
            currentScope = "REGION";
        }
        else if (line.startsWith("NOTE "))
        {
            parsed.notes = parsed.notes || [];
            parsed.notes.push(line.replace("NOTE ", ""));
        }
        else if (line.trim() === "NOTE")
        {
            currentScope = "NOTE";
        }
    }
    return parsed;
}

function timeToSeconds(time, format = "SRT")
{
    let match = null;
    if (format === "WEBVTT")
    {
        const prefix = "";
        const regex = new RegExp(/(\d\d):(\d\d):(\d\d).(\d\d\d)/);
        match = time.match(regex);
        if (!match)
        {
            // hours can be non-zero-padded
            let newTime = "0" + time;
            match = newTime.match(regex);
            if (!match)
            {
                // hours can also be optional
                newTime = "00:" + time;
                match = newTime.match(regex);
            }
        }
    }
    else
    {
        match = time.match(/(\d\d):(\d\d):(\d\d),(\d\d\d)/);
    }
    if (!match) return null;
    const hours = +match[1],
        minutes = +match[2],
        seconds = +match[3],
        milliseconds = +match[4];

    return (((hours * 60 * 60) + (minutes * 60) + (seconds))) + (milliseconds / 1000);
}
