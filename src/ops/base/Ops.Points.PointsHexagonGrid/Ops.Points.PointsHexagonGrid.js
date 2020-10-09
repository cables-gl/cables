const numxIn = op.inInt("Rows", 5),
    numyIn = op.inInt("Colums", 5),
    pointyOrTopped = op.inSwitch("Hex facing", ["Pointy", "Topped"], "Topped"),
    flipCorners = op.inBool("Flip corners", false),
    tileXOffsetIn = op.inFloat("Tile X offset", 1),
    tileYOffsetIn = op.inFloat("Tile Y offset", 1),
    multiplierIn = op.inFloat("Multiplier", 1),
    arrayOut = op.outArray("Array out");

tileXOffsetIn.onChange = tileYOffsetIn.onChange = numxIn.onChange = numyIn.onChange = multiplierIn.onChange = flipCorners.onChange = pointyOrTopped.onChange = update;

op.setPortGroup("Dimensions", [numxIn, numyIn]);
op.setPortGroup("Orientation", [flipCorners, pointyOrTopped]);
op.setPortGroup("Spacing", [tileXOffsetIn, tileYOffsetIn, multiplierIn]);

update();

function update()
{
    const arr = [];

    let offsetX = 0;
    let offsetY = 0;

    let w = 0;
    let h = 0;

    const multiplier = multiplierIn.get();

    if (pointyOrTopped.get() === "Pointy")
    {
        w = numyIn.get();
        h = numxIn.get();

        offsetX = tileXOffsetIn.get() * 1.7;
        offsetY = tileYOffsetIn.get() * 1.432;

        for (let x = 0; x < w; x++)
        {
            for (let y = 0; y < h; y++)
            {
                let yFlipped = y;
                if (flipCorners.get()) yFlipped = y + 1;

                if (yFlipped % 2 == 0)
                {
                    arr.push((x - w / 2) * offsetX * multiplier);
                    arr.push((y - h / 2) * offsetY * multiplier);
                    arr.push(0);
                }
                else
                {
                    arr.push(
                        ((x - w / 2) * offsetX + offsetX / 2) * multiplier
                    );
                    arr.push((y - h / 2) * offsetY * multiplier);
                    arr.push(0);
                }
            }
        }
    }
    else
    {
        w = numxIn.get();
        h = numyIn.get();

        offsetX = tileYOffsetIn.get() * 1.7;
        offsetY = tileXOffsetIn.get() * 1.432;

        for (let x = 0; x < w; x++)
        {
            for (let y = 0; y < h; y++)
            {
                let yFlipped = y;
                if (flipCorners.get()) yFlipped = y + 1;

                if (yFlipped % 2 == 0)
                {
                    arr.push((y - h / 2) * offsetY * multiplier);
                    arr.push((x - w / 2) * offsetX * multiplier);
                    arr.push(0);
                }
                else
                {
                    arr.push((y - h / 2) * offsetY * multiplier);
                    arr.push(
                        ((x - w / 2) * offsetX + offsetX / 2) * multiplier
                    );
                    arr.push(0);
                }
            }
        }
    }
    arrayOut.set(arr);
}
