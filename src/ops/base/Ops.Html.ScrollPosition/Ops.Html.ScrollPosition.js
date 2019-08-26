var stop=op.addOutPort(new CABLES.Port(op,"top"));
var sleft=op.addOutPort(new CABLES.Port(op,"left"));

function updateScroll()
{
    sleft.set( (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft );
    stop.set( (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop );
}


document.addEventListener("scroll", updateScroll);
