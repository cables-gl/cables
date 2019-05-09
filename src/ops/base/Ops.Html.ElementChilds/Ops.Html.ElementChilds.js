const
    parentPort = op.inObject('Parent');

var inPorts=[];
for(var i=0;i<10;i++)
{
    var p=op.inObject("Child "+(i+1));
    inPorts.push(p);
    p.onChange=rebuild;
}


function rebuild()
{
    var parent=parentPort.get();
    if(!parent)return;

    var child = parent.lastElementChild;
    while (child) {
        parent.removeChild(child);
        child = parent.lastElementChild;
    }

    for(var i=0;i<inPorts.length;i++)
    {
        var p=inPorts[i].get();
        if(p)
        {
            parent.appendChild(p);
        }
    }


}