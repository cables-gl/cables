op.name = "jsonFile";

let filename = op.addInPort(new CABLES.Port(op, "file", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string", "filter": "json" }));
let result = op.addOutPort(new CABLES.Port(op, "result", CABLES.OP_PORT_TYPE_OBJECT));

result.ignoreValueSerialize = true;
let patch = op.patch;

let loadingId = 0;
let reload = function ()
{
    if (!filename.get()) return;

    patch.loading.finished(loadingId);

    loadingId = patch.loading.start("jsonFile", "" + filename.get());

    CABLES.ajax(
        patch.getFilePath(filename.get()),
        function (err, _data, xhr)
        {
            try
            {
                let data = JSON.parse(_data);
                if (result.get())result.set(null);
                result.set(data);
                op.uiAttr({ "error": "" });
                patch.loading.finished(loadingId);
            }
            catch (e)
            {
                op.uiAttr({ "error": "error loading json" });
                patch.loading.finished(loadingId);
            }
        });
};

filename.onChange = reload;
