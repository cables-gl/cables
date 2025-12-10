op.name = "Clip2DPathArray";

let inArr = op.inArray("Array2x");

let inLeft = op.inValue("Left");
let inRight = op.inValue("Right");
let inTop = op.inValue("Top");
let inBottom = op.inValue("Bottom");

//----------------------------
// clip

let clipBottom = 2;
let clipTop = 0;
let clipLeft = 0;
let clipRight = 2;

function outCodes(P)
{
    let Code = 0;

    if (P[1] > clipBottom)Code += 1;/* code for above */
    else if (P[1] < clipTop)Code += 2;/* code for below */

    if (P[0] > clipRight)Code += 4;/* code for right */
    else if (P[0] < clipLeft)Code += 8;/* code for left */

    return Code;
}

function rejectCheck(outCode1, outCode2)
{
    if ((outCode1 & outCode2) != 0) return true;
    return false;
}

function acceptCheck(outCode1, outCode2)
{
    if ((outCode1 == 0) && (outCode2 == 0)) return true;
    return false;
}

function clip(P0, P1)
{
    // Cohen Sutherland 2D Clipper

    let outCode0 = 0, outCode1 = 0;
    while (true)
    {
        outCode0 = outCodes(P0);
        outCode1 = outCodes(P1);

        if (rejectCheck(outCode0, outCode1)) return false;
        if (acceptCheck(outCode0, outCode1)) return [P0[0], P0[1], P1[0], P1[1]];

        if (outCode0 == 0)
        {
            let tempCoord = [0, 0];
            let tempCode = 0;
            tempCoord = P0[0]; P0[0] = P1[0]; P1[0] = tempCoord;
            tempCoord = P0[1]; P0[1] = P1[1]; P1[1] = tempCoord;
            tempCode = outCode0; outCode0 = outCode1; outCode1 = tempCode;
        }
        if ((outCode0 & 1) != 0)
        {
            P0[0] += (P1[0] - P0[0]) * (clipBottom - P0[1]) / (P1[1] - P0[1]);
            P0[1] = clipBottom;
        }
        else
        if ((outCode0 & 2) != 0)
        {
            P0[0] += (P1[0] - P0[0]) * (clipTop - P0[1]) / (P1[1] - P0[1]);
            P0[1] = clipTop;
        }
        else
        if ((outCode0 & 4) != 0)
        {
            P0[1] += (P1[1] - P0[1]) * (clipRight - P0[0]) / (P1[0] - P0[0]);
            P0[0] = clipRight;
        }
        else
        if ((outCode0 & 8) != 0)
        {
            P0[1] += (P1[1] - P0[1]) * (clipLeft - P0[0]) / (P1[0] - P0[0]);
            P0[0] = clipLeft;
        }
    }
}

function doClip()
{
    let left = inLeft.get();
    let right = inRight.get();
    let top = inTop.get();
    let bottom = inBottom.get();
}

let outArr = op.inArray("Result Array2x");
