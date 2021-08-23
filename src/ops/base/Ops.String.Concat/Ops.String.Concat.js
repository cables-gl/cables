let string1 = op.inValueString("string1", "ABC");
let string2 = op.inValueString("string2", "XYZ");
let newLine = op.inBool("New Line", false);

let result = op.outValueString("result");

function exec()
{
    let nl = "";
    if (newLine.get())nl = "\n";
    result.set(String(string1.get()) + nl + String(string2.get()));
}

newLine.onChange = string2.onChange = string1.onChange = exec;
