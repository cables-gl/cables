const url = op.require("url");
const fileURLToPath = url ? url.fileURLToPath : null;

const inFileUrl = op.inUrl("FileUrl");
const inFormat = op.inSwitch("Format", ["System", "Windows", "Posix"], "System");
const outPath = op.outString("Path");

inFileUrl.onChange = () => {
    op.setUiError("error", "");
    try {
        if(url && inFileUrl.get()) {
            const options = {};
            if(inFormat.get() !== "System") options.windows = inFormat.get() === "Windows";
            outPath.set(fileURLToPath(inFileUrl.get(), options));
        }else{
            outPath.set("");
        }
    }catch(e) {
        outPath.set("");
        op.setUiError("error", e.message);
    }
}
