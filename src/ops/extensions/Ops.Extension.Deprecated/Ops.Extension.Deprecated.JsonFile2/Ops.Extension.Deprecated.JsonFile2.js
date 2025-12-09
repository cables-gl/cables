op.name = "JsonFile2";

let filename = op.addInPort(new CABLES.Port(op, "file", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string", "filter": "json" }));
let outData = op.addOutPort(new CABLES.Port(op, "data", CABLES.OP_PORT_TYPE_OBJECT));
let isLoading = op.outValue("Is Loading", false);

let jsonp = op.inValueBool("JsonP", false);

outData.ignoreValueSerialize = true;
let patch = op.patch;

filename.onChange = delayedReload;
jsonp.onChange = delayedReload;
let loadingId = 0;

let reloadTimeout = 0;

function delayedReload()
{
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(reload, 100);
}

function reload()
{
    if (!filename.get()) return;

    patch.loading.finished(loadingId);

    loadingId = patch.loading.start("jsonFile", "" + filename.get());
    isLoading.set(true);

    let f = CABLES.ajax;
    if (jsonp.get())f = CABLES.jsonp;

    f(
        patch.getFilePath(filename.get()),
        function (err, _data, xhr)
        {
            try
            {
                let data = _data;
                if (typeof data === "string") data = JSON.parse(_data);

                if (outData.get())outData.set(null);
                outData.set(data);
                op.uiAttr({ "error": "" });
                patch.loading.finished(loadingId);
                isLoading.set(false);
            }
            catch (e)
            {
                op.uiAttr({ "error": "error loading json" });
                patch.loading.finished(loadingId);
                isLoading.set(false);
            }
        });
}
