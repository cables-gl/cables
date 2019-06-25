const modeSelect = op.inSwitch("Mode select",['Number','1,2,3,4',"0-1"],'Number'),
    inLength=op.inValueInt("Array length",10),
    inDefaultValue=op.inValueFloat("Default Value"),
    outArr=op.outArray("Array");

var arr=[];

var selectIndex = 0;
const MODE_NUMBER = 0;
const MODE_1_TO_4 = 1;
const MODE_0_TO_1 = 2;

function onFilterChange()
{
    var selectedMode = modeSelect.get();
    if(selectedMode === 'Number') selectIndex = MODE_NUMBER;
    else if(selectedMode === '1,2,3,4') selectIndex = MODE_1_TO_4;
    else if(selectedMode === '0-1') selectIndex = MODE_0_TO_1;
    //used to grey out parameter
    if( modeSelect.get() === 'Number')
    {
        inDefaultValue.setUiAttribs({greyout:false});
    }
    else if(modeSelect.get() === '1,2,3,4')
    {
        inDefaultValue.setUiAttribs({greyout:true});
    }
    else if(modeSelect.get() === '0-1')
    {
        inDefaultValue.setUiAttribs({greyout:true});
    }
    op.setUiAttrib({"extendTitle":modeSelect.get()});
}

function reset()
{
    arr.length = 0;

    var arrLength = inLength.get();
    var valueForArray = inDefaultValue.get();
    var i;

    //mode 0 - fill all array values with one number
    if( modeSelect.get() === 'Number')
    {
        for(i=0;i<arrLength;i++)
        {
            arr[i]=valueForArray;
        }
    }
    //mode 1 Continuous number array - increments up to array length
    else if(modeSelect.get() === "1,2,3,4")
    {
        for(i = 0;i < arrLength; i++)
        {
            arr[i] = i;
        }
    }
    //mode 2 Normalized array
    else if(modeSelect.get() === "0-1")
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
modeSelect.onChange = inDefaultValue.onChange = inLength.onChange = function ()
{
    onFilterChange();
    reset();
}
onFilterChange();
reset();
