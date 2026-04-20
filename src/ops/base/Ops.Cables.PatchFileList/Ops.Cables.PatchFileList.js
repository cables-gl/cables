const
    inCache = op.inArray("arrcache"),
    inStrs = op.inMultiPort2("File", CABLES.OP_PORT_TYPE_STRING, { "display": "file", "hidePort": true, "hideParam": true }, 1),
    result = op.outArray("Filenames");

inCache.setUiAttribs({ "hidePort": true, "hideParam": true });
inStrs.setUiAttribs({ "hidePort": true, "hideParam": true });

op.init = () =>
{
    result.setRef(inCache.get());
};

op.on("fileChanged", update);

update();

function update()
{
    if (!CABLES.UI) return;

    if (CABLESUILOADER && CABLESUILOADER.talkerAPI)
        CABLESUILOADER.talkerAPI.send(CABLESUILOADER.TalkerAPI.CMD_GET_FILE_LIST,
            { "source": "patch" }, (err, r) =>
            {
                const arr = [];
                for (let i = 0; i < r.length; i++)
                {
                    if (!inStrs.ports[i]) inStrs.newPort("port " + i);

                    inStrs.ports[i].set(r[i].p);
                    arr.push(r[i].p);
                }

                inCache.setRef(arr);
                result.setRef(arr);
            });
}
