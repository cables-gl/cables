const url = op.require("url");
const pathToFileURL = url ? url.pathToFileURL : null;

const inFileUrl = op.inUrl("Path");
const inFormat = op.inSwitch("Format", ["System", "Windows", "Posix"], "System");
const outUrl = op.outString("FileUrl");

inFormat.onChange =
inFileUrl.onChange = () => {
    op.setUiError("error", "");
    try {
        if(url && inFileUrl.get()) {
            const options = {};
            if(inFormat.get() !== "System") options.windows = inFormat.get() === "Windows";
            outUrl.set(pathToFileURL(inFileUrl.get(), options).href);
        }else{
            outUrl.set("");
        }
    }catch(e) {
        outUrl.set("");
        op.setUiError("error", e.message);
    }
}
