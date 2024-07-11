const inStr = op.inString("String", "default");
const outNum = op.outString("Result", "");
const inDefault = op.inString("Default", "");
const numberStrings = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

const strings = [];
const numbers = [];

inDefault.onChange =
inStr.onChange = update;

for (let i = 0; i < numberStrings.length; i++)
{
    const idx = i + 1;
    const istr = op.inString("String " + idx, numberStrings[i]);
    const inum = op.inString("Result String " + idx, idx);

    istr.onChange =
    inum.onChange = update;

    strings.push(istr);
    numbers.push(inum);
}

function update()
{
    const s = inStr.get();

    let found = false;
    for (let i = 0; i < numberStrings.length; i++)
    {
        if (strings[i].get() == s)
        {
            outNum.set(numbers[i].get());
            found = true;
        }
    }

    if (!found) outNum.set(inDefault.get());
}
