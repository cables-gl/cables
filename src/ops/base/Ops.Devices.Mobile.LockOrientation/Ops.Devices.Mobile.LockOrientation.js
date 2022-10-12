const inPortrait = op.inValueBool("Portrait");
const inLandscape = op.inValueBool("Landscape");

screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;

const support = op.outBoolNum("Supported", screen.lockOrientationUniversal !== undefined);
const locked = op.outBoolNum("Locked");

inPortrait.onChange = setup;
inLandscape.onChange = setup;

function setup()
{
    if (screen.lockOrientationUniversal)
    {
        let orientations = [];
        if (inPortrait.get())orientations.push("portrait");
        if (inLandscape.get())orientations.push("landscape");

        if (screen.lockOrientationUniversal(orientations)) locked.set(true);
        else locked.set(false);
    }
    locked.set(false);
}
