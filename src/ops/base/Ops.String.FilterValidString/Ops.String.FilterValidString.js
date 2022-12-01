const
    inStr = op.inString("String", ""),
    checkNull = op.inBool("Invalid if null", true),
    checkUndefined = op.inBool("Invalid if undefined", true),
    checkEmpty = op.inBool("Invalid if empty", true),
    checkZero = op.inBool("Invalid if 0", true),
    outStr = op.outString("Last Valid String"),
    result = op.outBoolNum("Is Valid");

inStr.onChange =
checkNull.onChange =
checkUndefined.onChange =
checkEmpty.onChange =
function ()
{
    const str = inStr.get();
    let r = true;

    if (r === false)r = false;
    if (r && checkZero.get() && (str === 0 || str === "0")) r = false;
    if (r && checkNull.get() && str === null) r = false;
    if (r && checkUndefined.get() && str === undefined) r = false;
    if (r && checkEmpty.get() && str === "") r = false;

    result.set(r);
    if (r)outStr.set(str);
};
