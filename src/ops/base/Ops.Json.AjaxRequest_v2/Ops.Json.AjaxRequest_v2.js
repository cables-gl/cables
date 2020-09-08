const filename = op.inUrl("file"),
    jsonp = op.inValueBool("JsonP", false),
    headers = op.inObject("headers", {}),
    inBody = op.inStringEditor("body", ""),
    inMethod = op.inDropDown("HTTP Method", ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "CONNECT", "OPTIONS", "TRACE"], "GET"),
    inContentType = op.inString("Content-Type", "application/json"),
    inParseJson = op.inBool("parse json", true),
    reloadTrigger = op.inTriggerButton("reload"),
    outData = op.outObject("data"),
    outString = op.outString("response"),
    isLoading = op.outValue("Is Loading", false),
    outTrigger = op.outTrigger("Loaded");

filename.setUiAttribs({ "title": "URL" });

outData.ignoreValueSerialize = true;

filename.onChange = jsonp.onChange = headers.onChange = inMethod.onChange = inParseJson.onChange = delayedReload;

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

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1) reload(true);
};

function reload(addCachebuster)
{
    if (!filename.get()) return;

    op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start("jsonFile", "" + filename.get());
    isLoading.set(true);

    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });
    op.setUiError("jsonerr", null);

    let httpClient = CABLES.ajax;
    if (jsonp.get()) httpClient = CABLES.jsonp;

    let url = op.patch.getFilePath(filename.get());
    if (addCachebuster)url += "?rnd=" + CABLES.generateUUID();

    op.patch.loading.addAssetLoadingTask(() =>
    {
        const body = inBody.get();
        httpClient(
            url,
            (err, _data, xhr) =>
            {
                if (err)
                {
                    op.error(err);
                    return;
                }
                try
                {
                    let data = _data;
                    outData.set(null);
                    if (typeof data === "string" && inParseJson.get())
                    {
                        data = JSON.parse(_data);
                        outData.set(data);
                    }
                    outString.set(null);
                    outString.set(_data);
                    op.uiAttr({ "error": null });
                    op.patch.loading.finished(loadingId);
                    outTrigger.trigger();
                    isLoading.set(false);
                }
                catch (e)
                {
                    op.error(e);
                    op.setUiError("jsonerr", "Problem while loading json:<br/>" + e);
                    op.patch.loading.finished(loadingId);
                    isLoading.set(false);
                }
            },
            inMethod.get(),
            (body && body.length > 0) ? body : null,
            inContentType.get(),
            null,
            headers.get() || {}
        );
    });
}
