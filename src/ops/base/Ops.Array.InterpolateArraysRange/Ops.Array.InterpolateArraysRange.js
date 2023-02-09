const exe = op.inTrigger("Exe");
const inArr1 = op.inArray("Array 1");
const inArr2 = op.inArray("Array 2");

const inPos = op.inValueSlider("Pos");
const inWidth = op.inValueSlider("Width");

const easing = op.inValueSelect("Easing", [
    "Linear",
    "Expo in", "Expo out", "Expo in out",
    "Cubic in", "Cubic out", "Cubic in out"],
"Linear");

const reverse = op.inValueBool("Reverse");

const next = op.outTrigger("Next");
const outArr = op.outArray("Result");

const resultArr = [];
let easingFunction = null;

easing.onChange = function ()
{
    if (easing.get() == "Expo in") easingFunction = CABLES.easeExpoIn;
    else if (easing.get() == "Expo out") easingFunction = CABLES.easeExpoOut;
    else if (easing.get() == "Expo in out") easingFunction = CABLES.easeExpoInOut;
    else if (easing.get() == "Cubic in") easingFunction = CABLES.easeCubicIn;
    else if (easing.get() == "Cubic out") easingFunction = CABLES.easeCubicOut;
    else if (easing.get() == "Cubic in out") easingFunction = CABLES.easeCubicInOut;
    else easingFunction = null;
};

let needsUpdate = true;

inArr1.onChange =
inArr2.onChange =
inPos.onChange =
inWidth.onChange = () =>
{
    needsUpdate = true;
};

exe.onTriggered = function ()
{
    const arr1 = inArr1.get();
    const arr2 = inArr2.get();

    if (needsUpdate)
        if (!arr1 || !arr2 || arr2.length < arr1.length)
        {
            op.setUiError("arraylength", "array length is not the same!");
            outArr.set(null);
        }
        else
        {
            op.setUiError("arraylength", null);
            if (resultArr.length != arr1.length) resultArr.length = arr1.length;
            const distNum = inWidth.get() * (resultArr.length * 4);
            const pos = inPos.get() * (arr1.length + distNum);

            for (let i = 0; i < arr1.length; i++)
            {
                const val1 = arr1[i];
                const val2 = arr2[i];

                let ppos = pos - i;
                if (reverse.get())ppos = pos - (arr1.length - i);
                let dist = ppos / distNum;

                if (dist > 1) resultArr[i] = val2;
                else if (dist <= 0) resultArr[i] = val1;
                else
                {
                    if (easingFunction) dist = easingFunction(dist);
                    const m = ((val2 - val1) * dist + val1);
                    resultArr[i] = m;
                }
            }

            outArr.setRef(resultArr);
        }

    next.trigger();
    needsUpdate = false;
};
