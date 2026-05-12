const
    inMeth = op.inSwitch("Filter", ["None", "EndsWith", "StartsWith", "Includes"], "None"),
    inFilterStr = op.inString("Filter Value", ""),
    inCache = op.inArray("arrcache"),
    inStrs = op.inMultiPort2("File", CABLES.OP_PORT_TYPE_STRING, { "display": "file", "hidePort": true, "hideParam": true }, 1),
    result = op.outArray("Filenames");

let to = null;

inCache.setUiAttribs({ "hidePort": true, "hideParam": true });
inStrs.setUiAttribs({ "hidePort": true, "hideParam": true });

op.init = () =>
{
    result.setRef(inCache.get());
};

op.on("fileChanged", update);

inMeth.onChange = inFilterStr.onChange = updateSoon;
updateSoon();
function updateSoon()
{
    clearTimeout(to);
    to = setTimeout(update, 100);
}

function update()
{
    if (!CABLES.UI) return;
    inFilterStr.setUiAttribs({ "greyout": inMeth.get() == "None" });

    if (CABLESUILOADER && CABLESUILOADER.talkerAPI)
        CABLESUILOADER.talkerAPI.send(
            CABLESUILOADER.TalkerAPI.CMD_GET_FILE_LIST,
            { "source": "patch" }, (err, r) =>
            {
                const arr = [];
                let count = 0;
                for (let i = 0; i < r.length; i++)
                {
                    const url = r[i].p || "";

                    let add = false;
                    if (inMeth.get() == "None")add = true;
                    else if (inMeth.get() == "EndsWith" && url.endsWith(inFilterStr.get()))add = true;
                    else if (inMeth.get() == "Includes" && url.includes(inFilterStr.get()))add = true;
                    else if (inMeth.get() == "StartsWith" && url.startsWith(inFilterStr.get()))add = true;

                    if (add)
                    {
                        if (!inStrs.ports[count]) inStrs.newPort("port " + count);

                        inStrs.ports[count].set(url);
                        arr.push(url);
                        count++;
                    }
                }
                arr.length = count;

                inCache.setRef(arr);
                result.setRef(arr);
            }
        );
}
