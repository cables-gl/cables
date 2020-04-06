var idx=op.inValueInt("Index");
var valuePorts=[];
var result=op.outValue("Result");

idx.onChange=update;

for(var i=0;i<10;i++)
{
    var p=op.inFile("File "+i);
    valuePorts.push( p );
    p.onChange=update;
}

function update()
{
    const index=idx.get();
    if(index>=0 && valuePorts[index])
    {
        result.set( valuePorts[index].get() );
    }
}