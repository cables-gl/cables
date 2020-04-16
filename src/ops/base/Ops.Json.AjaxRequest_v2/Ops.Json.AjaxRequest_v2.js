const filename = op.inUrl("file"),
    jsonp = op.inValueBool("JsonP", false),
    headers = op.inObject("headers", {}),
    reloadTrigger = op.inTriggerButton("reload"),
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

op.onFileChanged=function(fn)
{
    if(filename.get() && filename.get().indexOf(fn)>-1) reload(true);
};

function reload(addCachebuster)
{
    if (!filename.get()) return;

    op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start("jsonFile", "" + filename.get());
    isLoading.set(true);

    op.setUiAttrib({"extendTitle":CABLES.basename(filename.get())});

    op.setUiError("jsonerr", null);

    let f = CABLES.ajax;
    if (jsonp.get()) f = CABLES.jsonp;

    var url=op.patch.getFilePath(filename.get());
    if(addCachebuster)url+='?rnd='+CABLES.generateUUID();

    f(
        url,
        (err, _data, xhr) =>
        {

            if(err)
            {
                console.error(err);
                return;
            }
            try
            {
                var data = _data;
                if (typeof data === "string") data = JSON.parse(_data);

                // if (outData.get())
                outData.set(null);
                outData.set(data);
                op.uiAttr({ error: null });
                op.patch.loading.finished(loadingId);
                outTrigger.trigger();
                isLoading.set(false);
            }
            catch (e)
            {
                console.error(e);
                op.setUiError("jsonerr", "Problem while loading json:<br/>" + e);
                op.patch.loading.finished(loadingId);
                isLoading.set(false);
            }
        },
        null,
        null,
        null,
        headers.get()
    );
}
