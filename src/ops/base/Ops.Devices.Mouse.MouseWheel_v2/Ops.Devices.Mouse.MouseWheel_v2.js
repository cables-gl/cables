const speed=op.inValue("Speed",1);
const preventScroll=op.inValueBool("prevent scroll",true);
const flip=op.inValueBool("Flip Direction");
const area=op.inSwitch("Area",['Canvas','Document'],'Canvas');
const active=op.inValueBool("active",true);

const delta=op.outValue("delta",0);
const deltaOrig=op.outValue("browser event delta",0);

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

function normalizeWheel(/*object*/ event) /*object*/ {
  var sX = 0, sY = 0;       // spinX, spinY
    //   pX = 0, pY = 0;       // pixelX, pixelY

  // Legacy
  if ('detail'      in event) { sY = event.detail; }

  if ('deltaY' in event) {

      sY=event.deltaY;
      if(event.deltaY>20)sY = 20;
      else if(event.deltaY<-20)sY = -20;

  }

//   if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
//   if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
//   if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

  // side scrolling on FF with DOMMouseScroll
//   if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
//     sX = sY;
//     sY = 0;
//   }

//   pX = sX * PIXEL_STEP;
//   pY = sY * PIXEL_STEP;

//   if ('deltaY' in event) { pY = event.deltaY; }
//   if ('deltaX' in event) { pX = event.deltaX; }

//   if ((pX || pY) && event.deltaMode) {
//     if (event.deltaMode == 1) {          // delta in LINE units
//       pX *= LINE_HEIGHT;
//     //   pY *= LINE_HEIGHT;
//     } else {                             // delta in PAGE units
//       pX *= PAGE_HEIGHT;
//     //   pY *= PAGE_HEIGHT;
//     }
//   }

  // Fall-back if spin cannot be determined
//   if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
//   if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

    // console.log(sY);
    return sY;
//   { spinX  : sX,
//           spinY  : sY,
//           pixelX : pX,
//           pixelY : pY };
}

var lastEvent=0;

function onMouseWheel(e)
{

    if(Date.now()-lastEvent<10)return;
    lastEvent=Date.now();

    // var d= CGL.getWheelSpeed(e)*(dir)*speed.get();

    // var d = ;

    deltaOrig.set(e.wheelDelta || e.deltaY);


    // d*=0.2;

    // if(isWindows && isChrome) d*=0.5;
    // if(isLinux && isFirefox) d*=0.5;
    // if(isWindows  && isFirefox) d*=0.5;
    // if(isMac && isFirefox) d*=0.5;

    var d=normalizeWheel(e);

    // console.log('n',d);

    d*=0.01*speed.get();

    delta.set(0);
    delta.set(d);

    // if(d>3)d=3;
    // if(d<-3)d=-3;


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

