
const
    fn=op.inString("Filename",""),
    path=op.outString("Path");


fn.onChange=update;

function update()
{
    var filename=fn.get()||'';

    if(CABLES.UI)
    {
        filename='/assets/'+gui.project()._id+'/'+filename;
    }
    else
    {
        filename="assets/"+filename;
    }

    var url=op.patch.getFilePath(filename);
    path.set(url);

}

update();