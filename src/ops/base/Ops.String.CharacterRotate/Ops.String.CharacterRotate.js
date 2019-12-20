const
    inUpdate=op.inTriggerButton("Update"),
    inReset=op.inTriggerButton("Reset"),
    inText=op.inString("Text"),
    inSeed=op.inFloat("Random Seed",0),
    inChars=op.inString("Characters","abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890 -_+!"),
    result=op.outString("Result");

var positions=[];
var position=0;
var resultString="";

inSeed.onChange=init;
inText.onChange=init;
inReset.onTriggered=init;

function init()
{
    position++;
    var txt=inText.get();
    if(!txt)
    {
        result.set("");
        return;
    }
    var alphab=inChars.get();

    resultString="";

    Math.randomSeed=inSeed.get();

    for(var i=0;i<txt.length;i++)
    {
        if(inSeed.get()==0)
        {
            resultString+=alphab[0];
        }
        else
        {
            resultString+=alphab[Math.floor(Math.seededRandom()*alphab.length)];
        }
    }

    result.set(resultString);
}

inUpdate.onTriggered=function()
{
    var txt=inText.get();
    var alphab=inChars.get();

    if(!txt)
    {
        result.set("");
        return;
    }

    if(!resultString) init();
    var newStr="";

    for(var i=0;i<txt.length;i++)
    {
        if(txt[i]=='\n')
        {
            newStr+='\n';
        }
        else
        if(txt[i]!=resultString[i])
        {
            var newindex=alphab.indexOf(resultString[i])+1;

            if(newindex>alphab.length-1)newindex=0;
            newStr+=alphab[newindex];
        }
        else
        {
            newStr+=txt[i];
        }
    }
    resultString=newStr;

    result.set(resultString);


};