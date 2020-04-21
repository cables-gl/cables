const
    speed=op.inValue("Speed",1),
    preventScroll=op.inValueBool("prevent scroll",true),
    flip=op.inValueBool("Flip Direction"),
    area=op.inSwitch("Area",['Canvas','Document'],'Canvas'),
    active=op.inValueBool("active",true),

    delta=op.outValue("delta",0),
    deltaX=op.outValue("delta X",0),
    deltaOrig=op.outValue("browser event delta",0);

const cgl=op.patch.cgl;
var value=0;

var startTime=CABLES.now()/1000.0;
var v=0;


var dir=1;

var listenerElement=null;

area.onChange=updateArea;
var vOut=0;

addListener();


var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

const isWindows= window.navigator.userAgent.indexOf("Windows") != -1;
const isLinux= window.navigator.userAgent.indexOf("Linux") != -1;
const isMac= window.navigator.userAgent.indexOf("Mac") != -1;

const isChrome= (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera === false && isIEedge === false);
const isFirefox=navigator.userAgent.search("Firefox")>1;



flip.onChange=function()
{
    if(flip.get())dir=-1;
        else dir=1;
};


function normalizeWheel(event)
{
    var sY = 0;

    if ('detail' in event) { sY = event.detail; }

    if ('deltaY' in event) {
        sY=event.deltaY;
        if(event.deltaY>20)sY = 20;
        else if(event.deltaY<-20)sY = -20;
    }
    return sY;
}

function normalizeWheelX(event)
{
    var sX = 0;

    if ('deltaX' in event) {
        sX=event.deltaX;
        if(event.deltaX>20)sX = 20;
        else if(event.deltaX<-20)sX = -20;
    }
    return sX;
}

var lastEvent=0;

function onMouseWheel(e)
{
    if(Date.now()-lastEvent<10)return;
    lastEvent=Date.now();

    deltaOrig.set(e.wheelDelta || e.deltaY);

    if(e.deltaY)
    {
        var d=normalizeWheel(e);
        d*=0.01*speed.get();

        delta.set(0);
        delta.set(d);
    }

    if(e.deltaX)
    {
        var dX=normalizeWheelX(e);
        dX*=0.01*speed.get();

        deltaX.set(0);
        deltaX.set(dX);
    }

    if(preventScroll.get()) e.preventDefault();
}

function updateArea()
{
    removeListener();

    if(area.get()=='Document') listenerElement = document;
    else listenerElement = cgl.canvas;

    if(active.get())addListener();
}

function addListener()
{
    if(!listenerElement)updateArea();
    listenerElement.addEventListener('wheel', onMouseWheel);
}

function removeListener()
{
    if(listenerElement) listenerElement.removeEventListener('wheel', onMouseWheel);
}

active.onChange=function()
{
    updateArea();
}

