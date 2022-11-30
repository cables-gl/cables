const
    fn = op.inString("Filename", ""),
    path = op.outString("Path");

fn.onChange = update;

update();

function update()
{
    let filename = fn.get();

    if (!fn.get())
    {
        path.set("");
        return;
    }

    let patchId = null;
    if (op.storage && op.storage.blueprint && op.storage.blueprint.patchId)
    {
        patchId = op.storage.blueprint.patchId;
    }
    filename = op.patch.getAssetPath(patchId) + filename;
    let url = op.patch.getFilePath(filename);
    path.set(url);
}
