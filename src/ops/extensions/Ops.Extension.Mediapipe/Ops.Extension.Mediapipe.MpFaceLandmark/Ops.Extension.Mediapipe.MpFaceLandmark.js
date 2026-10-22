const faceLandmarksMap = {
    "Nose tip": 1,
    "Chin": 152,
    "Left eye inner": 133,
    "Left eye outer": 33,
    "Left eye top": 159,
    "Left eye bottom": 145,
    "Right eye inner": 362,
    "Right eye outer": 263,
    "Right eye top": 386,
    "Right eye bottom": 374,
    "Mouth left": 61,
    "Mouth right": 291,
    "Mouth top": 13,
    "Mouth bottom": 14,
    "Left eyebrow inner": 55,
    "Left eyebrow outer": 105,
    "Right eyebrow inner": 285,
    "Right eyebrow outer": 334,
    "Face silhouette top": 10,
    "Face silhouette left": 234,
    "Face silhouette right": 454
};

const marks = Object.keys(faceLandmarksMap);

const inArr = op.inArray("Landmarks"),
    inWhich = op.inDropDown("Landmark", marks, "Nose tip"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z");

let index = faceLandmarksMap["Nose tip"];

inWhich.onChange = () =>
{
    index = faceLandmarksMap[inWhich.get()];
};

inArr.onChange = () =>
{
    const arr = inArr.get();

    // The input array groups coordinates in triplets (x, y, z, x, y, z...)
    // Therefore, the index must be multiplied by 3 to reach the X coordinate of the target landmark
    const arrayIndex = index * 3;

    if (arr && arr.length > arrayIndex + 2)
    {
        // The transformation has already been handled in the source operator,
        // so we simply extract the raw values.
        outX.set(arr[arrayIndex]);
        outY.set(arr[arrayIndex + 1]);
        outZ.set(arr[arrayIndex + 2]);
    }
};
