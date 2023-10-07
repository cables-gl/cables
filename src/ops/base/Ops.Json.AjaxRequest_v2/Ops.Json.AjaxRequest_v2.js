const filename = op.inUrl("file"),
    jsonp = op.inValueBool("JsonP", false),
    headers = op.inObject("headers", {}),
    inBody = op.inStringEditor("body", ""),
    inMethod = op.inDropDown("HTTP Method", ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "CONNECT", "OPTIONS", "TRACE"], "GET"),
    inContentType = op.inString("Content-Type", "application/json"),
    inParseJson = op.inBool("parse json", true),
    inAutoRequest = op.inBool("Auto request", true),
    reloadTrigger = op.inTriggerButton("reload"),
    outData = op.outObject("data"),
    outString = op.outString("response"),
    outDuration = op.outNumber("Duration MS", 0),
    outStatus = op.outNumber("Status Code", 0),

    isLoading = op.outBoolNum("Is Loading", false),
    outTrigger = op.outTrigger("Loaded");

filename.setUiAttribs({ "title": "URL" });
reloadTrigger.setUiAttribs({ "buttonTitle": "trigger request" });

outData.ignoreValueSerialize = true;
outString.ignoreValueSerialize = true;

let jsonpCounter = null;
CABLES.jsonp = function (url, cb)
{
    jsonpCounter = jsonpCounter || 0;
    jsonpCounter++;
    const jsonPID = jsonpCounter;

    CABLES["jsonpFunc" + jsonPID] = function (data)
    {
        cb(false, data);
    };

    let paramChar = "?";
    if (url.indexOf(paramChar) > -1) paramChar = "&";

    const s = document.createElement("script");
    s.setAttribute("src", url + paramChar + "callback=CABLES.jsonpFunc" + jsonPID);

    document.body.appendChild(s);
};

inAutoRequest.onChange = filename.onChange = jsonp.onChange = headers.onChange = inMethod.onChange = inParseJson.onChange = function ()
{
    delayedReload(false);
};

reloadTrigger.onTriggered = function ()
{
    delayedReload(true);
};

let reloadTimeout = 0;

function delayedReload(force = false)
{
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(function () { reload(null, force); }, 100);
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1) reload(true);
};

function reload(addCachebuster, force = false)
{
    if (!inAutoRequest.get() && !force) return;
    if (!filename.get()) return;

    // op.patch.loading.finished(loadingId);

    const loadingId = op.patch.loading.start("jsonFile", "" + filename.get(), op);
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
        const startTime = performance.now();
        httpClient(
            url,
            (err, _data, xhr) =>
            {
                outDuration.set(Math.round(performance.now() - startTime));
                outData.set(null);
                outString.set(null);
                outStatus.set(xhr.status);

                // if (err)
                // {
                //     op.logError(err);
                //     // op.patch.loading.finished(loadingId);
                //     // isLoading.set(false);
                //     // return;
                // }
                try
                {
                    let data = _data;
                    if (typeof data === "string" && inParseJson.get())
                    {
                        data = JSON.parse(_data);
                        outData.set(data);
                    }
                    outString.set(_data);
                    op.uiAttr({ "error": null });
                    op.patch.loading.finished(loadingId);
                    outTrigger.trigger();
                    isLoading.set(false);
                }
                catch (e)
                {
                    op.logError(e);
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
