op.name="ScreenOrientation";

var angle=op.outValue("Angle");
var str=op.outValue("Description");

onOrientationChange();

window.addEventListener("resize", onOrientationChange, false);
window.addEventListener("orientationchange", onOrientationChange);

function onOrientationChange()
{
    angle.set(screen.orientation.angle);
    str.set(screen.orientation.type);
}

op.onDelete=function()
{
    window.removeEventListener("resize", onOrientationChange, false);
    window.removeEventListener("orientationchange", onOrientationChange);
};



