
var exec=op.inFunction("Render");

var inNum=op.inValue("Num Times",3);
var inSeed=op.inValue("Seed",1);
var inOnlyOnce=op.inValueBool("Only Once");
var outIndex=op.outValue("Index");

var linked=[];
var triggers=[];

for(var i=0;i<8;i++)
{
    var newIn=op.addOutPort(new Port(op,"trigger "+i,CABLES.OP_PORT_TYPE_FUNCTION));
    triggers.push( newIn );
    newIn.onLinkChanged=updateLinkedArray;
}

exec.onTriggered=function()
{
    if(linked.length==0)return;
    
    Math.randomSeed=inSeed.get();

    var numTriggered=0;

    if(inOnlyOnce.get())
    {
        for(var i=0;i<linked.length;i++)
            linked[i].RTwasTriggered=false;
        
    }



    for(var i=0;i<inNum.get();i++)
    {
        outIndex.set(i);
        
        var r=Math.floor(Math.seededRandom()*linked.length);
        
        if(linked[r])
        {
            if(inOnlyOnce.get())
            {
                if(numTriggered==linked.length)
                {
                    return;
                }
                if(!linked[r].RTwasTriggered)
                {
                    linked[r].trigger();
                    numTriggered++;
                }
                else i--;
            }
            else
            {
                linked[r].trigger();
            }
            linked[r].RTwasTriggered=true;
        }
    }
    
    
};

function updateLinkedArray()
{
    linked.length=0;
    for(var i=0;i<triggers.length;i++)
    {
        if(triggers[i].isLinked())
            linked.push(triggers[i]);
    }
    // console.log("CGHANGE");
}