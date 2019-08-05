const exec=op.inTrigger("Update");
const inMode = op.inBool("Separate inc/dec",false);
const inVal=op.inValue("Value");
const next=op.outTrigger("Next");
const inDivisorUp=op.inValue("Inc factor",4);
const inDivisorDown=op.inValue("Dec factor",4);
const result=op.outValue("Result",0);

var val=0;
var goal=0;
var oldVal=0;
var lastTrigger=0;
op.toWorkPortsNeedToBeLinked(exec);

var divisorUp;
var divisorDown;
var divisor = 4;

var selectIndex = 0;
const MODE_SINGLE = 0;
const MODE_UP_DOWN = 1;

onFilterChange();
getDivisors();

inMode.setUiAttribs({hidePort:true});

function onFilterChange()
{
    var selectedMode = inMode.get();
    if(selectedMode === false) selectIndex = MODE_SINGLE;
    else if(selectedMode === true) selectIndex = MODE_UP_DOWN;


    if(selectIndex == MODE_SINGLE)
    {
        inDivisorDown.setUiAttribs({greyout:true});
        inDivisorUp.setUiAttribs({title:"Inc/Dec factor"});

    }
    else if (selectIndex == MODE_UP_DOWN)
    {
        inDivisorDown.setUiAttribs({greyout:false});
        inDivisorUp.setUiAttribs({title:"Inc factor"});
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

inVal.onChange=function()
{
    goal=inVal.get();
};

inDivisorUp.onChange=function()
{
    divisor=inDivisorUp.get();
    if(divisor<=0)divisor=5;
};

function update()
{
    var tm=1;
    if(CABLES.now()-lastTrigger>500 || lastTrigger===0)val=inVal.get();
    else tm=(CABLES.now()-lastTrigger)/16;
    lastTrigger=CABLES.now();

    if(divisorUp<=0 || divisorUp != divisorUp )divisorUp=0.0001;
    if(divisorDown<=0 || divisorDown != divisorDown )divisorDown=0.0001;

    if(divisor<=0)divisor=0.0001;

    var diff = goal-val;

    if(diff  >= 0)
        val=val+(diff)/(divisorDown*tm);
    else
        val=val+(diff)/(divisorUp*tm);
    //val=val+(goal-val)/(divisor*tm);

    if(val>0 && val<0.000000001)val=0;
    if(divisor!=divisor)val=0;
    if(val!=val|| val== -Infinity || val==Infinity)val=inVal.get();

    if(oldVal!=val)
    {
        result.set(val);
        oldVal=val;
    }

    next.trigger();
};

exec.onTriggered = function()
{
    update();
};

inDivisorUp.onChange = inDivisorDown.onChange = getDivisors;
inMode.onChange = onFilterChange;
update();