const filename = op.inUrl("file"),
    headers = op.inObject("headers", {}),
    inBody = op.inStringEditor("body", ""),
    inMethod = op.inDropDown("HTTP Method", ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "CONNECT", "OPTIONS", "TRACE"], "GET"),
    inContentType = op.inString("Content-Type", "application/json"),
    inContent = op.inSwitch("Content", ["JSON", "String", "Binary"], "JSON"),
    inAutoRequest = op.inBool("Auto request", true),
    reloadTrigger = op.inTriggerButton("reload"),
    outData = op.outObject("Response Json Object"),
    outString = op.outString("Response String"),
    outStringBin = op.outString("Response Data Url"),
    outDuration = op.outNumber("Duration MS", 0),
    outStatus = op.outNumber("Status Code", 0),

    isLoading = op.outBoolNum("Is Loading", false),
    outTrigger = op.outTrigger("Loaded");

filename.setUiAttribs({ "title": "URL" });
reloadTrigger.setUiAttribs({ "buttonTitle": "trigger request" });

outData.ignoreValueSerialize = true;
outString.ignoreValueSerialize = true;

inAutoRequest.onChange =
    filename.onChange =
    headers.onChange =
    inMethod.onChange =
    inContent.onChange = () =>
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

function reload(addCachebuster, force = false)
{
    if (!inAutoRequest.get() && !force) return;
    if (!filename.get()) return;

    const loadingId = op.patch.loading.start("jsonFile", "" + filename.get(), op);
    isLoading.set(true);

    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });
    op.setUiError("jsonerr", null);

    let httpClient = CABLES.ajax;

    let url = op.patch.getFilePath(filename.get());
    if (addCachebuster)url += "?rnd=" + CABLES.generateUUID();

    op.patch.loading.addAssetLoadingTask(() =>
    {
        const body = inBody.get();
        const startTime = performance.now();

        if (inContent.get() == "Binary")
        {
            fetch(url)
                // .then((res) => { return res.arrayBuffer(); })
                .then((res) =>
                {
                    // if (inFile.get() != fileToLoad)
                    // {
                    //     cgl.patch.loading.finished(loadingId);
                    //     loadingId = null;
                    //     return;
                    // }

                    // boundingPoints = [];
                    // maxTime = 0;
                    // gltf = parseGltf(arrayBuffer);

                    // finishLoading();
                    console.log("loaded binary", res);

                    res.blob().then((b) =>
                    {
                        console.log("blobby blob");
                        outStringBin.set(URL.createObjectURL(b));
                    });

                    op.patch.loading.finished(loadingId);
                });
        }
        else
        {
            httpClient(
                url,
                (err, _data, xhr) =>
                {
                    outDuration.set(Math.round(performance.now() - startTime));

                    outStatus.set(xhr.status);

                    try
                    {
                        let data = _data;

                        if (typeof data === "string" && inContent.get() == "JSON")
                        {
                            data = JSON.parse(_data);
                            outData.setRef(data);
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
                        outData.setRef(null);
                        outString.set("");
                    }
                },
                inMethod.get(),
                (body && body.length > 0) ? body : null,
                inContentType.get(),
                null,
                headers.get() || {}
            );
        }
    });
}
