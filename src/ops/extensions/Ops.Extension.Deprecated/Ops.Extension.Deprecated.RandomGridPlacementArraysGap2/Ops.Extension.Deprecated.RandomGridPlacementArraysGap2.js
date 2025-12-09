const
    exe = op.inTrigger("Exe"),
    maxDepth = op.inValue("max Depth", 3),
    deeper = op.inValueSlider("Possibility", 0.5),
    seed = op.inValue("Seed", 1),
    inScale = op.inValueSlider("Scale", 1),
    gapSize = op.inValue("Gap Size", 0.05),
    width = op.inValue("Width", 4),
    height = op.inValue("Height", 3),
    outPosArr = op.outArray("Positions"),
    outScaleArr = op.outArray("Scalings"),
    outArrayLength = op.outNumber("Array Length"),
    outArrayPoints = op.outNumber("Total Points");

// Reference to cables.gl
const cgl = op.patch.cgl;

// Flags and variables for state management
let needsChange = true;
let globalScale = 1;
let gap_size = gapSize.get();
let vPos = vec3.create();
let vScale = vec3.create();
let hhalf = 0;
let whalf = 0;
let index = 0;
let arrPos = [];
let arrScale = [];
let count = 0;

// Set needsChange to true when any of the inputs change
maxDepth.onChange =
    deeper.onChange =
    seed.onChange =
    inScale.onChange =
    width.onChange =
    height.onChange =
    gapSize.onChange =
    function ()
    {
        needsChange = true;
    };

// Recursive function to draw squares
function drawSquare(x, y, depth, scale)
{
    // Determine whether to go deeper based on random chance and possibility slider
    let godeeper = Math.seededRandom() > deeper.get() * 0.9;

    // Stop recursion if max depth is reached
    if (depth >= maxDepth.get())
    {
        godeeper = false;
    }

    if (godeeper)
    {
        // Calculate new scale for child squares, accounting for gap size
        let new_scale = (scale - gap_size) / 2;

        // Stop recursion if the new scale is too small
        if (new_scale <= 0)
        {
            godeeper = false;
        }
        else
        {
            // Loop to create four child squares
            for (let _x = 0; _x < 2; _x++)
            {
                for (let _y = 0; _y < 2; _y++)
                {
                    // Calculate offsets for child squares, including gap size
                    let x_offset = _x * (new_scale + gap_size);
                    let y_offset = _y * (new_scale + gap_size);

                    // Calculate new positions for child squares
                    let x_new = x - (scale / 2) + (new_scale / 2) + x_offset;
                    let y_new = y - (scale / 2) + (new_scale / 2) + y_offset;

                    // Recursively draw child squares
                    drawSquare(
                        x_new,
                        y_new,
                        depth + 1,
                        new_scale
                    );
                }
            }
        }
    }

    if (!godeeper)
    {
        // Set scale vector for the square
        vec3.set(vScale, scale, scale, scale);

        // Set position vector for the square
        vec3.set(vPos, x, y, 0);

        // Increment index and store position and scale in arrays
        index++;

        arrPos[count * 3 + 0] = vPos[0];
        arrPos[count * 3 + 1] = vPos[1];
        arrPos[count * 3 + 2] = vPos[2];

        arrScale[count * 3 + 0] = vScale[0];
        arrScale[count * 3 + 1] = vScale[1];
        arrScale[count * 3 + 2] = vScale[2];

        count++;
    }
}

// Main execution function triggered by 'Exe' input
exe.onTriggered = function ()
{
    // Only proceed if inputs have changed
    if (!needsChange) return;

    // Reset flags and variables
    needsChange = false;
    index = 0;
    Math.randomSeed = seed.get();

    globalScale = inScale.get();
    gap_size = gapSize.get();

    // Calculate half dimensions of the grid, including gaps, for centering
    whalf = (width.get() * (globalScale + gap_size)) / 2;
    hhalf = (height.get() * (globalScale + gap_size)) / 2;

    // Clear position and scale arrays
    arrPos.length = 0;
    arrScale.length = 0;
    count = 0;

    // Loop over grid dimensions to create initial squares
    for (let x = 0; x < width.get(); x++)
    {
        for (let y = 0; y < height.get(); y++)
        {
            // Calculate initial positions for squares, including gaps
            let x_pos = x * (globalScale + gap_size) - whalf + (globalScale + gap_size) / 2;
            let y_pos = y * (globalScale + gap_size) - hhalf + (globalScale + gap_size) / 2;

            // Start drawing squares recursively from initial positions
            drawSquare(x_pos, y_pos, 0, globalScale);
        }
    }

    // Output the length and total points of the arrays
    outArrayLength.set(arrPos.length);
    outArrayPoints.set(arrPos.length / 3);

    // Set the position and scale arrays as outputs
    outPosArr.setRef(arrPos);
    outScaleArr.setRef(arrScale);
};
