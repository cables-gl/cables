const x1 = op.inFloat("X 1");
const y1 = op.inFloat("Y 1");
const z1 = op.inFloat("Z 1");

const x2 = op.inFloat("X 2", 1);
const y2 = op.inFloat("Y 2", 1);
const z2 = op.inFloat("Z 2", 1);

const inSubdivs = op.inInt("Subdivs", 10);

const outArr = op.outArray("Array");

const cgl = op.patch.cgl;

x1.onChange = y1.onChange = z1.onChange = update;
x2.onChange = y2.onChange = z2.onChange = update;

let arr = [0, 0, 0, 0, 0, 0];
let subArr = [];
let arrarr = [subArr];

update();

function subd(subdivs, inPoints)
{
    let count = 0;
    const newLen = (inPoints.length - 3) * subdivs + 3;
    if (newLen != subArr.length)
    {
        op.log("resize subdivsiv subArr");
        subArr.length = newLen;
    }

    count = 0;
    for (let i = 0; i < inPoints.length - 3; i += 3)
    {
        for (let j = 0; j < subdivs; j++)
        {
            for (let k = 0; k < 3; k++)
            {
                subArr[count] =
                    inPoints[i + k] + (inPoints[i + k + 3] - inPoints[i + k]) * j / subdivs;
                count++;
            }
        }
    }
    subArr[newLen - 3] = inPoints[inPoints.length - 3];
    subArr[newLen - 2] = inPoints[inPoints.length - 2];
    subArr[newLen - 1] = inPoints[inPoints.length - 1];
}

function update()
{
    arr[0] = x1.get();
    arr[1] = y1.get();
    arr[2] = z1.get();
    arr[3] = x2.get();
    arr[4] = y2.get();
    arr[5] = z2.get();

    subd(inSubdivs.get(), arr);

    outArr.setRef(arrarr);
}
