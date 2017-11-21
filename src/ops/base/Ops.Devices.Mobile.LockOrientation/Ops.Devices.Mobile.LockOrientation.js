op.name="LockOrientation";

var inPortrait=op.inValueBool("Portrait");
var inLandscape=op.inValueBool("Landscape");

screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;


var support=op.outValue("Supported",screen.lockOrientationUniversal!==undefined);
var locked=op.outValue("Locked");
inPortrait.onChange=setup;
inLandscape.onChange=setup;

function setup()
{
    if(screen.lockOrientationUniversal)
    {
        var orientations=[];
        if(inPortrait.get())orientations.push("portrait");
        if(inLandscape.get())orientations.push("landscape");

        if(screen.lockOrientationUniversal(orientations)) locked.set(true);
            else locked.set(false);
    }
    locked.set(false);
}


