const exec=op.inTriggerButton("Update");
const outResult=op.outObject("Result");

exec.onTriggered=function()
{
    var values=[];
    for(var i=0;i<op.patch.ops.length;i++)
    {
        if(
            op.patch.ops[i].objName.indexOf('Ops.Sidebar.Sidebar')==-1 &&
            op.patch.ops[i].objName.indexOf('AsObject')==-1 &&
            op.patch.ops[i].objName.indexOf('Group')==-1 &&
            op.patch.ops[i].objName.indexOf('Preset')==-1 &&
            op.patch.ops[i].objName.indexOf('Ops.Sidebar')===0
            )
        {
            console.log("objname",op.patch.ops[i].objName);

            let foundPort=false;

            const theOp=op.patch.ops[i];
            let p={};
            p.id=theOp.id;
            p.objName=theOp.objName;
            p.ports={};

            for(var j=0;j<op.patch.ops[i].portsOut.length;j++)
            {
                if(theOp.portsOut[j].type==CABLES.OP_PORT_TYPE_VALUE)
                {
                    p.ports[theOp.portsOut[j].name]=theOp.portsOut[j].get();

                    foundPort=true;
                }
            }

            if(foundPort)values.push(p);
        }
    }

    var r={ops:values};

    outResult.set(r);
};

