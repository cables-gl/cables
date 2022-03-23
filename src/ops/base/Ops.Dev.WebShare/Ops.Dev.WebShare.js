const
    inText = op.inString("Text", "check out undev"),
    inUrl = op.inString("URL", "https://undev.studio"),
    inBase64 = op.inString("Base64 File"),
    inFileType = op.inString("Filetype", "image/png"),
    exec = op.inTriggerButton("Share"),
    outStatus = op.outString("Status", "none"),
    outSupport = op.outBoolNum("Supported", !!navigator.share);

op.setPortGroup("File", [inFileType, inBase64]);

function dataURLtoFile(dataurl, filename)
{
    let arr = dataurl.split(","),
        mimeType = arr[0].match(/:(.*?);/)[1],
        decodedData = atob(arr[1]),
        lengthOfDecodedData = decodedData.length,
        u8array = new Uint8Array(lengthOfDecodedData);

        console.log("mimeType",mimeType);

    while (lengthOfDecodedData--)
    {
        u8array[lengthOfDecodedData] = decodedData.charCodeAt(lengthOfDecodedData);
    }
    return new File([u8array], filename, { "type": mimeType });
}

exec.onTriggered = () =>
{
    const obj = {};
    obj.text = inText.get();
    obj.url = inUrl.get();

    if (inBase64.get())
    {
        // const byteCharacters = atob(inBase64.get());
        // let blob = base64toBlob(inBase64.get(), inFileType.get());
        // const byteArray = new Uint8Array(byteCharacters);
        // const blob = new Blob([byteArray], { "type": inFileType.get() });
        // const file = new File([blob], "picture.png", { "type": inFileType.get() });
        // let file = dataURLtoFile("data:" + inFileType.get() + ";base64," + inBase64.get(),"bilt.png");
        let file = dataURLtoFile(inBase64.get(),"bilt.png");
        obj.files = [file];

        console.log("canshare...",navigator.canShare({files: [file]}));
    }



    if (navigator.share)
    {
        navigator.share(obj)
            .then(() =>
            {
                outStatus.set("success");
            })
            .catch((error) =>
            {
                outStatus.set("error");
                console.log("Error sharing", error);
            });
    }
};
