
const
    fn=op.inString("Filename",""),
    path=op.outString("Path");

fn.onChange=update;

update();

function update()
{
    var filename=fn.get();

    if(filename==null || filename==undefined)
    {
        path.set("");
        return;
    }

    filename=op.patch.getAssetPath()+filename;
    var url=op.patch.getFilePath(filename);
    path.set(url);
}

