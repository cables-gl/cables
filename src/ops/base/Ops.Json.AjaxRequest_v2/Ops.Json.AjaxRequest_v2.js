const filename = op.inUrl("file"),
    jsonp = op.inValueBool("JsonP", false),
    headers = op.inObject("headers", {}),
    reloadTrigger = op.inTrigger("reload"),
    outData = op.outObject("data"),
    isLoading = op.outValue("Is Loading", false),
    outTrigger = op.outTrigger("Loaded");

outData.ignoreValueSerialize = true;

filename.onChange = jsonp.onChange = delayedReload;

reloadTrigger.onTriggered = function ()
{
    delayedReload();
};

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
    if (jsonp.get()) f = CABLES.jsonp;

    f(
        op.patch.getFilePath(filename.get()),
        (err, _data, xhr) =>
        {
            try
            {
                var data = _data;
                if (typeof data === "string") data = JSON.parse(_data);

                if (outData.get()) outData.set(null);
                outData.set(data);
                op.uiAttr({ error: "" });
                op.patch.loading.finished(loadingId);
                outTrigger.trigger();
                isLoading.set(false);
            }
            catch (e)
            {
                console.log(e);
                op.setUiError("jsonerr", "Problem while loading json:<br/>" + e);
                op.patch.loading.finished(loadingId);
                isLoading.set(false);
            }
        },
        null,
        null,
        null,
        null,
        headers.get(),
    );
}
