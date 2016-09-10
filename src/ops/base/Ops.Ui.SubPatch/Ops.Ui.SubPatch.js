op.name="SubPatch";

var dyn=op.addInPort(new Port(op,"create port",OP_PORT_TYPE_DYNAMIC));

var dataStr=op.addInPort(new Port(op,"dataStr",OP_PORT_TYPE_VALUE,{ display:'readonly' }));
op.patchId=op.addInPort(new Port(op,"patchId",OP_PORT_TYPE_VALUE,{ display:'readonly' }));

var portsIn=[];
var data={"ports":[]};

var dataLoaded=false;
dataStr.onChange=function()
{
    if(dataLoaded)return;
    op.log('load data....'+dataStr.get());
    
    if(!dataStr.get())return;
    try
    {
        dataLoaded=true;
        data=JSON.parse(dataStr.get());
        var ports=data.ports;
        for(var i=0;i<ports.length;i++)
        {
            op.log('add subpatch port');
            var newPort=op.addInPort(new Port(op,ports[i].name,ports[i].type));
            portsIn.push(newPort);
            
        }
    }
    catch(e)
    {
        op.log('cannot load subpatch data...');
        console.log(e);
    }
};

function saveData()
{
    dataStr.set(JSON.stringify(data));
    console.log("save",data);
}

dyn.onLinkChanged=function(port)
{
    if(dyn.isLinked())
    {
        op.log('dyn link',port);
        setTimeout(function()
        {
            var otherPort=dyn.links[0].getOtherPort(dyn);
            dyn.removeLinks();
            
            var newPort=op.addInPort(new Port(op,"hund"+portsIn.length,otherPort.type));
            portsIn.push(newPort);
            
            gui.scene().link(
                otherPort.parent,
                otherPort.getName(),
                op,
                newPort.name
                );

            data.ports.push({"name":newPort.name,"type":newPort.type});
            saveData();
            
        },100);
    }
    else
    {
        op.log('dyn unlinked...');
    }
};

