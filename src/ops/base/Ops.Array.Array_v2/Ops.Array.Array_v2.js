const modeSelect = op.inSwitch("Mode select",['Number','1,2,3,4',"0-1"],'Number'),
    inLength=op.inValueInt("Array length",10),
    inDefaultValue=op.inValueFloat("Default Value"),
    outArr=op.outArray("Array");

var arr=[];

var selectIndex = 0;
const MODE_NUMBER = 0;
const MODE_1_TO_4 = 1;
const MODE_0_TO_1 = 2;

onFilterChange();
function onFilterChange()
{
    var selectedMode = modeSelect.get();
    if(selectedMode === 'Number') selectIndex = MODE_NUMBER;
    else if(selectedMode === '1,2,3,4') selectIndex = MODE_1_TO_4;
    else if(selectedMode === '0-1') selectIndex = MODE_0_TO_1;

    if( selectIndex === MODE_NUMBER)
    {
        inDefaultValue.setUiAttribs({greyout:false});
    }
    else if(selectIndex === MODE_1_TO_4)
    {
        inDefaultValue.setUiAttribs({greyout:true});
    }
    else if(selectIndex === MODE_0_TO_1)
    {
        inDefaultValue.setUiAttribs({greyout:true});
    }
    op.setUiAttrib({"extendTitle":modeSelect.get()});

    reset();
}

function reset()
{
    arr.length = 0;

    var arrLength = inLength.get();
    var valueForArray = inDefaultValue.get();
    var i;

    //mode 0 - fill all array values with one number
    if( selectIndex === MODE_NUMBER)
    {
        for(i=0;i<arrLength;i++)
        {
            arr[i]=valueForArray;
        }
    }
    //mode 1 Continuous number array - increments up to array length
    else if(selectIndex === MODE_1_TO_4)
    {
        for(i = 0;i < arrLength; i++)
        {
            arr[i] = i;
        }
    }
    //mode 2 Normalized array
    else if(selectIndex === MODE_0_TO_1)
    {
        var length = arrLength;
        for(i = 0;i < arrLength; i++)
        {
            arr[i] = i / length;
        }
    }
    outArr.set(null);
    outArr.set(arr);
}
inDefaultValue.onChange = inLength.onChange = function ()
{
    reset();
}
modeSelect.onChange = onFilterChange;
reset();
