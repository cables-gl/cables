// Define input and output ports
const
    inColors    = op.inArray("Colors"), // Input array of color values
    inSort      = op.inSwitch("Sort", ["No", "Luminance", "Hue", "Saturation", "Lightness", "Alpha"], "Luminance"), // Sorting options including "Alpha"
    inInpStride = op.inSwitch("Input Format", ["RGBA", "RGB"], "RGBA"), // Input format: RGBA or RGB
    inReverse   = op.inBool("Reverse Sort", false), // Checkbox to reverse the sorted array
    outColors   = op.outArray("New Colors"); // Output array of sorted color values

// Link input and output ports
op.toWorkPortsNeedToBeLinked(inColors, outColors);

// Event listeners for changes in input array, sort option, input format, or reverse flag
inReverse.onChange =
inInpStride.onChange =
inSort.onChange =
inColors.onChange = () => {
    const arr = inColors.get(); // Get the input color array

    // If no array is provided, output an empty array and exit
    if (!arr) {
        outColors.setRef([]);
        // Clear any existing hints or warnings
        op.setUiError("Warn1", null);
        op.setUiError("Hint1", null);
        return;
    }

    // Determine stride based on input format
    let stride = 4; // Default stride for RGBA
    if (inInpStride.get() === "RGB") {
        stride = 3;
    }

    // 1) Display warnings if array length is invalid for the selected format.
    //    Warn1 is used here for a short, non-technical message:
    if (inInpStride.get() === "RGB" && arr.length % 3 !== 0) {
        op.setUiError("Warn1", "Invalid array length! Must be a multiple of 3 (RGB).", 1);
    }
    else if (inInpStride.get() === "RGBA" && arr.length % 4 !== 0) {
        op.setUiError("Warn1", "Invalid array length! Must be a multiple of 4 (RGBA).", 1);
    }
    else {
        // Clear the warning if the length matches the expected stride
        op.setUiError("Warn1", null);
    }

    // 2) Parse the input array into RGBA quads
    const rgbaArr = [];
    const defaultAlpha = 1.0; // Default Alpha value for RGB

    for (let i = 0; i < arr.length; i += stride) {
        const rgba = [
            arr[i + 0], // Red
            arr[i + 1], // Green
            arr[i + 2], // Blue
            stride === 4 ? arr[i + 3] : defaultAlpha // Alpha (from input or default)
        ];
        rgbaArr.push(rgba);
    }

    // 3) Apply sorting based on the selected criterion using if/else statements
    if (inSort.get() === "Luminance") {
        // Sort based on luminance (brightness)
        rgbaArr.sort((a, b) => {
            const lumA = chroma(a[0] * 255, a[1] * 255, a[2] * 255, "rgb").luminance();
            const lumB = chroma(b[0] * 255, b[1] * 255, b[2] * 255, "rgb").luminance();
            return lumA - lumB;
        });
    }
    else if (inSort.get() === "Hue") {
        // Sort based on hue
        rgbaArr.sort((a, b) => {
            const hslA = chroma(a[0] * 255, a[1] * 255, a[2] * 255, "rgb").hsl();
            const hslB = chroma(b[0] * 255, b[1] * 255, b[2] * 255, "rgb").hsl();
            return hslA[0] - hslB[0];
        });
    }
    else if (inSort.get() === "Saturation") {
        // Sort based on saturation
        rgbaArr.sort((a, b) => {
            const hslA = chroma(a[0] * 255, a[1] * 255, a[2] * 255, "rgb").hsl();
            const hslB = chroma(b[0] * 255, b[1] * 255, b[2] * 255, "rgb").hsl();
            return hslA[1] - hslB[1];
        });
    }
    else if (inSort.get() === "Lightness") {
        // Sort based on lightness
        rgbaArr.sort((a, b) => {
            const hslA = chroma(a[0] * 255, a[1] * 255, a[2] * 255, "rgb").hsl();
            const hslB = chroma(b[0] * 255, b[1] * 255, b[2] * 255, "rgb").hsl();
            return hslA[2] - hslB[2];
        });
    }
    else if (inSort.get() === "Alpha") {
        // Sort based on the alpha channel
        rgbaArr.sort((a, b) => a[3] - b[3]);

        // 4) After sorting by Alpha, set hint if format is RGB
        if (stride === 3) {
            op.setUiError("Hint1", "Alpha sorting only works with RGBA.", 0); // severity 0 = hint
        } else {
            // Clear the hint if stride is 4 (RGBA)
            op.setUiError("Hint1", null);
        }
    }
    // If "No" is selected, do not sort; retain original order

    // 5) If user selected something other than "Alpha", ensure the hint is cleared
    if (inSort.get() !== "Alpha") {
        op.setUiError("Hint1", null);
    }

    // 6) Optionally reverse the array if the user enabled "Reverse Sort"
    if (inReverse.get()) {
        rgbaArr.reverse();
    }

    // 7) Determine output stride based on input format
    const outputStride = (inInpStride.get() === "RGB") ? 3 : 4;
    let resultArr = new Array(rgbaArr.length * outputStride); // Initialize the output array

    // 8) Map the sorted (and possibly reversed) RGBA quads back into the output array
    for (let i = 0; i < rgbaArr.length; i++) {
        const baseIndex = i * outputStride; // Calculate the starting index for each color

        resultArr[baseIndex + 0] = rgbaArr[i][0]; // Red
        resultArr[baseIndex + 1] = rgbaArr[i][1]; // Green
        resultArr[baseIndex + 2] = rgbaArr[i][2]; // Blue

        if (outputStride === 4) {
            resultArr[baseIndex + 3] = rgbaArr[i][3]; // Alpha (if applicable)
        }
    }

    // 9) Output the resulting array
    outColors.setRef(resultArr);
};
