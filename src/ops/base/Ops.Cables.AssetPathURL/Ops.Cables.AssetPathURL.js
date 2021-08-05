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

    filename = op.patch.getAssetPath() + filename;
    let url = op.patch.getFilePath(filename);
    path.set(url);
}
