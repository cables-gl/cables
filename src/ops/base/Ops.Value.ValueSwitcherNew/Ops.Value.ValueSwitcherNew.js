op.name="ValueSwitcher";

var idx=op.inValueInt("Index");

var valuePorts=[];

var result=op.outValue("Result");

for(var i=0;i<10;i++)
{
    var p=op.inValue("Value "+i);
    valuePorts.push( p );
    p.onChange=update;
    
}


idx.onChange=update;

function update()
{
    if(idx.get()>=0 && idx.get()<valuePorts.length)
    {
        result.set( valuePorts[idx.get()].get() );
    }
    
}