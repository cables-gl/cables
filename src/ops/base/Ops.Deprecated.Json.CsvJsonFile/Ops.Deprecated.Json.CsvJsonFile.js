const filename = op.addInPort(new CABLES.Port(op, "file", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string", "filter": "json" }));
const result = op.outArray("Result");
const isLoading = op.outValue("Is Loading", false);
const jsonp = op.inValueBool("JsonP", false);

result.ignoreValueSerialize = true;

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

    op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start("jsonFile", "" + filename.get());
    isLoading.set(true);

    let f = CABLES.ajax;
    if (jsonp.get())f = CABLES.jsonp;

    f(
        op.patch.getFilePath(filename.get()),
        function (err, _data, xhr)
        {
            try
            {
                let data = _data;
                if (typeof data === "string") data = JSON.parse(_data);

                if (result.get())result.set(null);
                result.set(data);
                op.uiAttr({ "error": "" });
                op.patch.loading.finished(loadingId);
                isLoading.set(false);
            }
            catch (e)
            {
                op.uiAttr({ "error": "error loading json" });
                op.patch.loading.finished(loadingId);
                isLoading.set(false);
            }
        });
}
