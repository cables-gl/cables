const
    idx=op.inValueInt("Index"),
    result=op.outString("Result");

const valuePorts=[];

idx.onChange=update;

for(var i=0;i<10;i++)
{
    var p=op.inString("String "+i);
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