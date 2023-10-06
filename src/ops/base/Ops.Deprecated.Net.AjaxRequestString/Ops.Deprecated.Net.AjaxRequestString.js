const filename = op.addInPort(new CABLES.Port(op, "file", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string" }));
const reloadBtn = op.inTriggerButton("reload");
const jsonp = op.inValueBool("JsonP", false);
const outData = op.outValue("Result");
const isLoading = op.outValue("Is Loading", false);

filename.onChange = delayedReload;
reloadBtn.setUiAttribs({ "hidePort": true });

reloadBtn.onTriggered = reload;
jsonp.onChange = delayedReload;

let loadingId = 0;
let reloadTimeout = 0;

function delayedReload()
{
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(reload, 100);
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        reload();
    }
};

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
    // s.onload=function()
    // {
    // };
    document.body.appendChild(s);
};

function reload()
{
    if (!filename.get()) return;

    op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start("jsonFile", "" + filename.get());
    isLoading.set(true);

    let f = CABLES.ajax;
    if (jsonp.get())f = CABLES.jsonp;

    f(
        op.patch.getFilePath(filename.get()) + "?nc=" + CABLES.uuid(),
        function (err, data, xhr)
        {
            try
            {
                outData.set(data);
                op.uiAttr({ "error": "" });
                op.patch.loading.finished(loadingId);
                isLoading.set(false);
            }
            catch (e)
            {
                console.log("exc... ", filename.get(), jsonp.get());
                op.uiAttr({ "error": "error loading json" });
                op.patch.loading.finished(loadingId);
                isLoading.set(false);
            }
        });
}
