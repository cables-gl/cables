const
    chars = op.inString("chars", "cables"),
    len = op.inInt("Length", 10),
    generate = op.inTriggerButton("Generate"),
    result = op.outString("Result");

generate.onTriggered = gen;
gen();

function gen()
{
    const charArray = Array.from(chars.get());
    let str = "";
    if (charArray.length > 0)
    {
        let numChars = charArray.length - 1;
        for (let i = 0; i < Math.abs(len.get()); i++)
            str += charArray[Math.round(Math.random() * numChars)];
    }

    result.set(str);
}
