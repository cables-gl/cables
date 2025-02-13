const filename = op.inUrl("file"),
    headers = op.inObject("headers", {}),
    inBody = op.inStringEditor("body", ""),
    inMethod = op.inDropDown("HTTP Method", ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "CONNECT", "OPTIONS", "TRACE"], "GET"),
    inContentType = op.inString("Content-Type", "application/json"),
    inContent = op.inSwitch("Content", ["JSON", "String", "Binary", "Binary Base64"], "JSON"),
    inAutoRequest = op.inBool("Auto request", true),
    inSendCredentials = op.inBool("Send Credentials", false),
    reloadTrigger = op.inTriggerButton("reload"),
    outData = op.outObject("Response Json Object"),
    outString = op.outString("Response String"),
    outStringBin = op.outString("Response Data Url"),
    outDuration = op.outNumber("Duration MS", 0),
    outStatus = op.outNumber("Status Code", 0),

    isLoading = op.outBoolNum("Is Loading", false),
    outTrigger = op.outTrigger("Loaded");

inContent.setUiAttribs({ "title": "Response Content" });
filename.setUiAttribs({ "title": "URL" });
reloadTrigger.setUiAttribs({ "buttonTitle": "trigger request" });

outData.ignoreValueSerialize = true;
outString.ignoreValueSerialize = true;

outString.onLinkChanged =
    outStringBin.onLinkChanged =
    outData.onLinkChanged = showEmptyUrlWarning;

inContent.onChange = () =>
{
    const greyOut = (inContent.get() === "Binary");
    inMethod.setUiAttribs({ "greyout": greyOut });
    delayedReload(false);
};

inAutoRequest.onChange =
    filename.onChange =
    headers.onChange =
    inMethod.onChange = () =>
    {
        delayedReload(false);
    };

reloadTrigger.onTriggered = () =>
{
    delayedReload(true);
};

let reloadTimeout = 0;

function delayedReload(force = false)
{
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(() => { reload(null, force); }, 100);
}

op.onFileChanged = (fn) =>
{
    if (filename.get() && filename.get().indexOf(fn) > -1) reload(true);
};

function showEmptyUrlWarning()
{
    if (!filename.get())
        op.setUiError("nourl", "URL is empty", 1);
    else
        op.setUiError("nourl", null);
}

function reload(addCachebuster, force = false)
{
    if (!inAutoRequest.get() && !force) return;

    showEmptyUrlWarning();
    if (!filename.get())
    {
        return;
    }

    const loadingId = op.patch.loading.start(op.objName, "" + filename.get(), op);
    isLoading.set(true);

    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });
    op.setUiError("jsonerr", null);
    op.setUiError("jsonParse", null);

    let url = op.patch.getFilePath(filename.get());
    if (addCachebuster)url += "?rnd=" + CABLES.generateUUID();

    op.patch.loading.addAssetLoadingTask(() =>
    {
        const body = inBody.get();
        const startTime = performance.now();

        const options = {};
        if (inSendCredentials.get()) options.credentials = "include";
        if (inContent.get().includes("Binary"))
        {
            fetch(url, options).then((res) =>
            {
                outDuration.set(Math.round(performance.now() - startTime));
                outStatus.set(res.status);

                res.blob().then((b) =>
                {
                    outStringBin.set(URL.createObjectURL(b));

                    if (inContent.get().includes("Base64"))
                    {
                        const reader = new FileReader();
                        reader.onloadend = function ()
                        {
                            const base64data = reader.result;
                            outStringBin.set(base64data);
                            isLoading.set(false);
                            outTrigger.trigger();
                            op.patch.loading.finished(loadingId);
                        };
                        reader.readAsDataURL(b);
                    }
                    else
                    {
                        isLoading.set(false);
                        outTrigger.trigger();
                        op.patch.loading.finished(loadingId);
                    }
                }).catch((e) =>
                {
                    op.logError(e);
                    op.setUiError("jsonerr", "Problem while loading data:<br/>" + e, 1);
                    isLoading.set(false);
                    outData.setRef(null);
                    outString.set("");
                    outTrigger.trigger();
                    op.patch.loading.finished(loadingId);
                });
            }).catch((e) =>
            {
                op.logError(e);
                op.setUiError("jsonerr", "Problem while loading data:<br/>" + e, 1);
                isLoading.set(false);
                outData.setRef(null);
                outString.set("");
                outTrigger.trigger();
                op.patch.loading.finished(loadingId);
            });
        }
        else
        {
            CABLES.ajax(
                url,
                (err, _data, xhr) =>
                {
                    outDuration.set(Math.round(performance.now() - startTime));
                    outStatus.set(xhr.status);

                    try
                    {
                        let data = _data;

                        if (typeof data === "string" && inContent.get() === "JSON")
                        {
                            try
                            {
                                data = JSON.parse(_data);
                                outData.setRef(data);
                            }
                            catch (e)
                            {
                                op.setUiError("jsonParse", "could not parse json" + e.message, 1);
                                outData.setRef({});
                            }
                        }

                        outString.set(_data);
                        op.uiAttr({ "error": null });
                        outTrigger.trigger();
                        isLoading.set(false);
                        op.patch.loading.finished(loadingId);
                    }
                    catch (e)
                    {
                        op.logError(e);
                        op.setUiError("jsonerr", "Problem while loading data:<br/>" + e, 1);
                        isLoading.set(false);
                        outData.setRef(null);
                        outString.set("");
                        op.patch.loading.finished(loadingId);
                    }
                },
                inMethod.get(),
                (body && body.length > 0) ? body : null,
                inContentType.get(),
                null,
                headers.get() || {},
                options
            );
        }
    });
}
