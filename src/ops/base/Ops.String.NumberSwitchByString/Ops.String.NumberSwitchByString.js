const inStr = op.inString("String", "default");
const outNum = op.outNumber("Result", 0);
const numberStrings = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

const strings = [];
const numbers = [];

inStr.onChange = update;

for (let i = 0; i < numberStrings.length; i++)
{
    const idx = i + 1;
    const istr = op.inString("String " + idx, numberStrings[i]);
    istr.onChange = update;
    const inum = op.inFloat("Number " + idx, idx);
    inum.onChange = update;

    strings.push(istr);
    numbers.push(inum);
}

function update()
{
    const s = inStr.get();
    outNum.set(0);

    for (let i = 0; i < numberStrings.length; i++)
    {
        if (strings[i].get() == s) outNum.set(numbers[i].get());
    }
}
