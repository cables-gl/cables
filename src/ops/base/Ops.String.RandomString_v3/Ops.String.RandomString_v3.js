const
    chars = op.inString("chars", "cables"),
    len = op.inInt("Length", 10),
    inSeed = op.inFloat("Seed", 0),
    result = op.outString("Result");

len.onChange =
    chars.onChange =
    inSeed.onChange = gen;
gen();

function gen()
{
    Math.setRandomSeed(Math.abs(inSeed.get()));

    const charArray = Array.from(chars.get());
    let str = "";
    if (charArray.length > 0)
    {
        let numChars = charArray.length - 1;
        for (let i = 0; i < Math.abs(len.get()); i++)
            str += charArray[Math.round(Math.seededRandom() * numChars)];
    }

    result.set(str);
}
