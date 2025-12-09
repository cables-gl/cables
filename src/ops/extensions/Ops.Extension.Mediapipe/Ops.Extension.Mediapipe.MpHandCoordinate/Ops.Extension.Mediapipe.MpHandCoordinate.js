// https://google.github.io/mediapipe/solutions/hands.html

const marks = ["WRIST", "THUMB_CMC", "THUMB_MCP", "THUMB_IP", "THUMB_TIP", "INDEX_FINGER_MCP", "INDEX_FINGER_PIP", "INDEX_FINGER_DIP", "INDEX_FINGER_TIP", "MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP", "RING_FINGER_MCP", "RING_FINGER_PIP", "RING_FINGER_DIP", "RING_FINGER_TIP", "PINKY_MCP", "PINKY_PIP", "PINKY_DIP", "PINKY_TIP"];

const
    inHand = op.inArray("Hand Points"),
    inWhich = op.inDropDown("Joint", marks, "WRIST"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z");

let idx = 0;

inWhich.onChange = () =>
{
    idx = marks.indexOf(inWhich.get());
    update();
};

inHand.onChange = update;

function update()
{
    const arr = inHand.get();

    if (arr && arr.length > idx * 3)
    {
        outX.set(arr[idx * 3 + 0]);
        outY.set(arr[idx * 3 + 1]);
        outZ.set(arr[idx * 3 + 2]);
    }
}
