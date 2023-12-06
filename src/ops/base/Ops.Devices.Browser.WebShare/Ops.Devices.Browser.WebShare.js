const
    inText = op.inString("Text", "check out undev"),
    inUrl = op.inString("URL", "https://undev.studio"),
    inBase64 = op.inString("Base64 File"),
    inDataUrl = op.inString("Data URL"),
    inFileType = op.inString("Filetype", "image/png"),
    inFileName = op.inString("Filename", "screenshot.png"),
    exec = op.inTriggerButton("Share"),
    outStatus = op.outString("Status", "none"),
    outSupport = op.outBoolNum("Supported", !!navigator.share);

op.setPortGroup("File", [inBase64, inDataUrl, inFileType, inFileName]);

if (!navigator.share)
{
    op.setUiError("noShare", "webshare api not supported on this device", 1);
}

exec.onTriggered = () =>
{
    op.setUiError("noShare", null);
    if (!navigator.share)
    {
        op.setUiError("noShare", "webshare api not supported on this device", 1);
        outSupport.set(false);
        return;
    }
    outSupport.set(true);

    const shareData = {};
    shareData.text = inText.get();
    shareData.url = inUrl.get();

    let url = inDataUrl.get();
    if (inBase64.get())
    {
        url = "data:" + inFileType.get() + ";base64," + inBase64.get();
    }

    if (url)
    {
        fetch(url)
            .then((res) => { return res.blob(); })
            .then((blob) =>
            {
                shareData.files = [
                    new File(
                        [blob],
                        inFileName.get(),
                        {
                            "type": inFileType.get(),
                            "lastModified": new Date().getTime()
                        }
                    )
                ];
                if (!navigator.canShare(shareData))
                {
                    op.setUiError("noShare", "browser can't share files", 1);
                    op.log("browser cant share files", shareData);
                    delete shareData.files;
                }
                if (!navigator.canShare(shareData))
                {
                    op.setUiError("noShare", "browser can't share data", 1);
                    op.log("browser cant share data", shareData);
                    outStatus.set("error");
                }
                else
                {
                    doShare(shareData);
                }
            });
    }
    else
    {
        doShare(shareData);
    }
};

function doShare(shareData)
{
    navigator.share(shareData)
        .then(() =>
        {
            outStatus.set("success");
        })
        .catch((error) =>
        {
            outStatus.set("error");
            op.setUiError("noShare", "Error sharing", error);
            op.log("Error sharing", error);
        });
}
