const
    inExec=op.inTrigger("Render"),
    inStr=op.inString("Search",""),
    outPos=op.outArray("Positions"),
    outScale=op.outArray("Scale");
    // outRot=op.outArray("Rotation");

const cgl=op.patch.cgl;
var needsupdate=true;
outPos.onChange=function(){needsupdate=true;};
inExec.onTriggered=exec;

function exec()
{
    if(needsupdate)update();
}

function update()
{
    outPos.set(null);
    outScale.set(null);
    // outRot.set(null);

    if(!cgl.frameStore.currentScene)return;

    var arrPos=[];
    var arrRot=[];
    var arrScale=[];

    for(var i=0;i<cgl.frameStore.currentScene.nodes.length;i++)
    {
        if(cgl.frameStore.currentScene.nodes[i].name.indexOf(inStr.get())==0)
        {
            const n=cgl.frameStore.currentScene.nodes[i]._node;

            if(n.translation) arrPos.push(n.translation[0],n.translation[1],n.translation[2]);
            else arrPos.push(0,0,0);

            if(n.scale) arrScale.push(n.scale[0],n.scale[1],n.scale[2]);
            else arrScale.push(1,1,1);

            console.log( n );
        }
    }

    outPos.set(arrPos);
    outScale.set(arrScale);
    // outRot.set(arrRot);

    needsupdate=false;
}
