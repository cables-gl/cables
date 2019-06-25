//look at http://sol.gfxile.net/interpolation/
const exec=op.inTrigger("Execute"),
    inArray = op.inArray("Array In"),
    inMode = op.inSwitch("Mode",["Single", "Up down"],"Single"),
    inDivisorUp=op.inValue("Divisor Up",4),
    inDivisorDown=op.inValue("Divisor down",4),
    next=op.outTrigger("Next"),
    outArray = op.outArray("Array Out");

var goal=[];
var reset=false;
var lastTrigger=0;

var newArr = [];
outArray.set(newArr);

var divisorUp;
var divisorDown;

var selectIndex = 0;
const MODE_SINGLE = 0;
const MODE_UP_DOWN = 1;

onFilterChange();
getDivisors();
function onFilterChange()
{
    var selectedMode = inMode.get();
    if(selectedMode === 'Single') selectIndex = MODE_SINGLE;
    else if(selectedMode === 'Up down') selectIndex = MODE_UP_DOWN;


    if(selectIndex == MODE_SINGLE)
    {
        inDivisorDown.setUiAttribs({greyout:true});
    }
    else if (selectIndex == MODE_UP_DOWN)
    {
        inDivisorDown.setUiAttribs({greyout:false});
    }

    getDivisors();
    update();
};

function getDivisors()
{
    if(selectIndex == MODE_SINGLE)
    {
        divisorUp=inDivisorUp.get();
        divisorDown=inDivisorUp.get();
    }
    else if (selectIndex == MODE_UP_DOWN)
    {
        divisorUp=inDivisorUp.get();
        divisorDown=inDivisorDown.get();
    }

    if(divisorUp<=0 || divisorUp != divisorUp )divisorUp=0.0001;
    if(divisorDown<=0 || divisorDown != divisorDown )divisorDown=0.0001;
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

inDivisorUp.onChange = inDivisorDown.onChange = getDivisors;
inMode.onChange = onFilterChange;
update();