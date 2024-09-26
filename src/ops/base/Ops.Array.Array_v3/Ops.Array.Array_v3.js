const
    inLength = op.inValueInt("Array length", 10),
    modeSelect = op.inSwitch("Mode select", ["Number", "1,2,3,4", "0-1"], "Number"),
    inDefaultValue = op.inValueFloat("Default Value"),
    inReverse = op.inBool("Reverse", false),
    outArr = op.outArray("Array"),
    outArrayLength = op.outNumber("Array length out");

let arr = [];
let selectIndex = 0;
const MODE_NUMBER = 0;
const MODE_1_TO_4 = 1;
const MODE_0_TO_1 = 2;

modeSelect.onChange = onFilterChange;

inReverse.onChange =
    inDefaultValue.onChange =
    inLength.onChange = reset;

onFilterChange();
reset();

function onFilterChange()
{
    let selectedMode = modeSelect.get();
    if (selectedMode === "Number") selectIndex = MODE_NUMBER;
    else if (selectedMode === "1,2,3,4") selectIndex = MODE_1_TO_4;
    else if (selectedMode === "0-1") selectIndex = MODE_0_TO_1;

    inDefaultValue.setUiAttribs({ "greyout": selectIndex !== MODE_NUMBER });

    op.setUiAttrib({ "extendTitle": modeSelect.get() });

    reset();
}

function reset()
{
    arr.length = 0;

    let arrLength = inLength.get();
    let valueForArray = inDefaultValue.get();
    let i;

    // mode 0 - fill all array values with one number
    if (selectIndex === MODE_NUMBER)
    {
        for (i = 0; i < arrLength; i++)
        {
            arr[i] = valueForArray;
        }
    }
    // mode 1 Continuous number array - increments up to array length
    else if (selectIndex === MODE_1_TO_4)
    {
        for (i = 0; i < arrLength; i++)
        {
            arr[i] = i;
        }
    }
    // mode 2 Normalized array
    else if (selectIndex === MODE_0_TO_1)
    {
        if (arrLength > 1) { 
            for (i = 0; i < arrLength; i++)
                {
                    arr[i] = i / (arrLength - 1);
                }
        } else 
        {
            //When array length is only 1 
            arr = [0];
        }
    }

    if (inReverse.get())arr = arr.reverse();

    outArr.setRef(arr);
    outArrayLength.set(arr.length);
}
