var idx=op.inValueInt("Index");
var valuePorts=[];
var result=op.outArray("Result");

idx.onChange=update;

for(var i=0;i<10;i++)
{
    var p=op.inArray("Array "+i);
    valuePorts.push( p );
    p.onChange=update;
}

function update()
{
    if(idx.get()>=0 && valuePorts[idx.get()])
    {
        result.set( valuePorts[idx.get()].get() );
    }
}