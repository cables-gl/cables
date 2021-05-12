const sleft = op.addOutPort(new CABLES.Port(op, "left"));
const stop = op.addOutPort(new CABLES.Port(op, "top"));

document.addEventListener("scroll", updateScroll);
updateScroll();

function updateScroll()
{
    sleft.set((window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft);
    stop.set((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop);
}
