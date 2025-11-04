const
    str1 = op.inString("String 1"),
    str2 = op.inString("String 2"),
    result = op.outBoolNum("Result");

str1.onChange =
str2.onChange = update;
update();

function update()
{
    result.set(str1.get() == str2.get());
}
