//look at http://sol.gfxile.net/interpolation/
const exec=op.inTrigger("Execute"),
    inArray = op.inArray("Array In"),
    inModeBool = op.inBool("Separate inc/dec",false),
    incFactor=op.inValue("Inc factor",4),
    decFactor=op.inValue("Dec factor",4),
    next=op.outTrigger("Next"),
    outArray = op.outArray("Array Out");

var goal=[];
var reset=false;
var lastTrigger=0;

var newArr = [];
outArray.set(newArr);

var divisorUp;
var divisorDown;

var selectedMode = false;

onFilterChange();
getDivisors();
function onFilterChange()
{
    selectedMode = inModeBool.get();

    if(selectedMode === false)
    {
        decFactor.setUiAttribs({greyout:true});
        incFactor.setUiAttribs({title:"Inc/Dec factor"});
    }
    else if (selectedMode ===true)
    {
        decFactor.setUiAttribs({greyout:false});
        incFactor.setUiAttribs({title:"Inc factor"});
    }

    getDivisors();
    update();
};

function getDivisors()
{
    if(selectedMode == false)
    {
        divisorUp=incFactor.get();
        divisorDown=incFactor.get();
    }
    else if (selectedMode === true)
    {
        divisorUp=incFactor.get();
        divisorDown=decFactor.get();
    }

    if(divisorUp<=0 || divisorUp != divisorUp )divisorUp=0.0001;
    if(divisorDown<=0 || divisorDown != divisorDown )divisorDown=0.0001;
    if(divisorUp <= 1.0) divisorUp = 1.0;
    if(divisorDown <= 1.0) divisorDown = 1.0;
};

inArray.onChange=function()
{
    var arr = inArray.get();
    if(!arr)return;

    for (var i = 0 ; i < arr.length;i++)
    {
        goal[i]=arr[i];
    }
};

var oldVal=0;

function update()
{
    var arr = inArray.get();
    if(!arr)return;

    if(newArr.length != arr.length)
    {
        newArr.length = arr.length;
        reset=true;
    }

    var tm=1;
    if(CABLES.now()-lastTrigger>500 || lastTrigger===0)reset = true;
        else tm=(CABLES.now()-lastTrigger)/17;
    lastTrigger=CABLES.now();

    if(reset)
    {
        for(var i = 0; i < arr.length; i++)
        {
            newArr[i]=arr[i];
        }
        reset=false;
    }

    for(var i = 0;i < arr.length;i++)
    {
        var val = newArr[i];


        var diff = goal[i]-val;

        if(diff  >= 0)
            val=val+(diff)/(divisorDown*tm);
        else
            val=val+(diff)/(divisorUp*tm);

        if(val>0 && val<0.000000001)val=0;


        if(newArr[i]!=val)
        {
            newArr[i] = val;
            oldVal=val;
        }
    }
    outArray.set(null);
    outArray.set(newArr);

    next.trigger();
};

exec.onTriggered = function()
{
    update();
};

incFactor.onChange = decFactor.onChange = getDivisors;
inModeBool.onChange = onFilterChange;
update();