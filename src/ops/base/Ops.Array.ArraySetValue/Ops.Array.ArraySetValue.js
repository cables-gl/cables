
this.name='ArraySetValue';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var array=this.addInPort(new Port(this, "array",OP_PORT_TYPE_ARRAY));
var index=this.addInPort(new Port(this, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value=this.addInPort(new Port(this, "value",OP_PORT_TYPE_VALUE));
var values=this.addOutPort(new Port(this, "values",OP_PORT_TYPE_ARRAY));


function updateIndex()
{
    if(exe.isLinked())return;    
    update();
}
function update()
{
    array.get()[index.get()]=value.get();
    values.set(array.get());
    // console.log('index:'+index.get()+' v:'+value.get() )
}

index.onValueChanged=updateIndex;
array.onValueChanged=updateIndex;
exe.onTriggered=update;
