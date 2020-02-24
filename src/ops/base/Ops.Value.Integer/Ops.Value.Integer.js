const
    input = op.inInt("Integer",0),
    output = op.outNumber("Number out");

input.onChange=function()
{
    output.set(Math.floor(input.get()));
}