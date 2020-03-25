
const
    fn=op.inString("Filename",""),
    path=op.outString("Path");


fn.onChange=update;

function update()
{
    var filename=fn.get()||'';

    if(!filename || filename=="")
    {
        path.set("");
        return;
    }

    if(CABLES.UI)
    {
        filename='/assets/'+gui.project()._id+'/'+filename;
    }
    else if( document.location.href.indexOf("cables.gl")>0)
    {
        const parts=document.location.href.split("/");
        filename='/assets/'+parts[parts.length-1]+'/'+filename;

    }
    else
    {
        filename="assets/"+filename;
    }

    var url=op.patch.getFilePath(filename);
    path.set(url);

}

update();