const modeSelect = op.inValueSelect("Mode select",['Number','1,2,3,4'],'Number'),
    inLength=op.inValueInt("Array length",10),
    inDefaultValue=op.inValueFloat("Default Value"),
    outArr=op.outArray("Array");

var arr=[];

modeSelect.onChange = function()
{
    //used to grey out parameter
    if( modeSelect.get() === 'Number')
    {
        inDefaultValue.setUiAttribs({greyout:false});
    }
    else if(modeSelect.get() === '1,2,3,4')
    {
        inDefaultValue.setUiAttribs({greyout:true});
    }
    reset();
}

inDefaultValue.onChange = inLength.onChange = function ()
{
    reset();
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
    else
    {
        for(i = 0;i < arrLength; i++)
        {
            arr[i] = i;
        }
    }
    outArr.set(null);
    outArr.set(arr);
}
reset();
