const inUrl = op.inUrl("URL"),
    inMethod = op.inDropDown("HTTP Method", ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "CONNECT", "OPTIONS", "TRACE"], "GET"),
    inBody = op.inStringEditor("Request Body", ""),
    inContentType = op.inString("Content-Type", "application/json"),
    inSendCredentials = op.inBool("Send Credentials", false),
    inHeaders = op.inObject("headers", {}),
    inResContentType = op.inSwitch("Response Content", ["JSON", "String", "Binary Base64"], "JSON"),
    inAutoRequest = op.inBool("Auto request", true),
    inEmptyOutput = op.inBool("Empty output on change", true),

    reloadTrigger = op.inTriggerButton("Reload"),

    outData = op.outObject("Response Json Object"),
    outString = op.outString("Response String"),
    outDataUrl = op.outString("Response Data Url"),
    outStatus = op.outNumber("Status Code", 0),
    outIsLoading = op.outBoolNum("Is Loading", false),
    outHasError = op.outBoolNum("Has Error", false),
    outError = op.outString("Error"),
    outDuration = op.outNumber("Duration MS", 0),
    outTrigger = op.outTrigger("Loaded");

inResContentType.setUiAttribs({ "title": "Response Content" });
inUrl.setUiAttribs({ "title": "URL" });
reloadTrigger.setUiAttribs({ "buttonTitle": "trigger request" });

op.setPortGroup("Request", [inMethod, inUrl, inContentType, inBody, inSendCredentials, inHeaders]);
op.setPortGroup("Response", [inResContentType]);

outData.ignoreValueSerialize = true;
outString.ignoreValueSerialize = true;
outDataUrl.ignoreValueSerialize = true;

let reloadTimeout = 0;

outString.onLinkChanged =
    outDataUrl.onLinkChanged =
    outData.onLinkChanged = showEmptyUrlWarning;

inAutoRequest.onChange =
    inUrl.onChange =
    inHeaders.onChange =
    inBody.onChange =
    inMethod.onChange = () =>
    {
        updateUi();
        delayedReload(false);
    };

inResContentType.onChange = () =>
{
    delayedReload(false);
    updateUi();
};

reloadTrigger.onTriggered = () =>
{
    delayedReload(true);
};

op.onFileChanged = (fn) =>
{
    if (inUrl.get() && inUrl.get().indexOf(fn) > -1) reload(true);
};

/// ///////////////

function updateUi()
{
    inMethod.setUiAttribs({ "greyout": inResContentType.get().includes("Binary") });
    inBody.setUiAttribs({ "greyout": inMethod.get() == "GET" });
    outString.setUiAttribs({ "greyout": inResContentType.get() != "String" });
    outData.setUiAttribs({ "greyout": inResContentType.get() != "JSON" });
    outDataUrl.setUiAttribs({ "greyout": inResContentType.get() != "Binary Base64" });
}

function delayedReload(force = false)
{
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(() => { reload(null, force); }, 30);
}

function showEmptyUrlWarning()
{
    if (!inUrl.get())
        op.setUiError("nourl", "URL is empty", 1);
    else
        op.setUiError("nourl", null);
}

function finishLoadingFail(loadingId, e)
{
    op.setUiError("jsonerr", "Problem while loading data:<br/>" + e, 1);
    outIsLoading.set(false);
    outData.setRef(null);
    outHasError.set(true);
    outString.set("");
    outTrigger.trigger();
    op.patch.loading.finished(loadingId);
}

function finishLoadingSuccess(loadingId)
{
    op.patch.loading.finished(loadingId);
    outIsLoading.set(false);
}

function resetOutputs()
{
    outData.set({});
    outDataUrl.set("");
    outString.set("");
    outError.set("");
}

function reload(addCachebuster, force = false)
{
    if (!inAutoRequest.get() && !force) return;
    if (inEmptyOutput.get()) resetOutputs();

    showEmptyUrlWarning();
    if (!inUrl.get()) return resetOutputs();

    const loadingId = op.patch.loading.start(op.objName, "" + inUrl.get(), op);
    outIsLoading.set(true);
    outHasError.set(false);

    op.setUiAttrib({ "extendTitle": CABLES.basename(inUrl.get()) });
    op.setUiError("jsonerr", null);
    op.setUiError("jsonParse", null);

    let url = op.patch.getFilePath(inUrl.get());
    if (addCachebuster)url += "?rnd=" + CABLES.generateUUID();

    op.patch.loading.addAssetLoadingTask(() =>
    {
        const body = inBody.get();
        const startTime = performance.now();

        const options = { "method": inMethod.get() };
        if (inMethod.get() != "GET") options.body = inBody.get();
        if (inHeaders.isLinked()) options.headers = inHeaders.get();
        if (inSendCredentials.get()) options.credentials = "include";

        const resContentType = inResContentType.get();

        fetch(url, options).then((res) =>
        {
            outDuration.set(Math.round(performance.now() - startTime));
            outStatus.set(res.status);
            if (!res.ok) outError.set(res.statusText || "request fail");

            if (resContentType == "JSON")
            {
                res.json().then((b) =>
                {
                    resetOutputs();
                    outData.set(b);
                    finishLoadingSuccess(loadingId);
                }).catch((e) =>
                {
                    finishLoadingFail(loadingId, e);
                    outError.set("Could not parse json");
                });
            }
            else if (resContentType == "String")
            {
                res.text().then((b) =>
                {
                    resetOutputs();
                    outString.set(b);
                    finishLoadingSuccess(loadingId);
                }).catch((e) =>
                {
                    finishLoadingFail(loadingId, e);
                });
            }
            else if (resContentType.includes("Binary"))
            {
                res.blob().then((b) =>
                {
                    resetOutputs();
                    outDataUrl.set(URL.createObjectURL(b));

                    if (resContentType.includes("Base64"))
                    {
                        const reader = new FileReader();
                        reader.onloadend = function ()
                        {
                            const base64data = reader.result;
                            outDataUrl.set(base64data);
                            finishLoadingSuccess(loadingId);
                        };
                        reader.readAsDataURL(b);
                    }
                    else console.log("unknown content type " + resContentType);
                }).catch((e) =>
                {
                    finishLoadingFail(loadingId, e);
                });
            }
        }).catch((e) =>
        {
            finishLoadingFail(loadingId, e);
        });
    });
}
