op.name="BrowserCheck";

var isIe=op.outValue("Is IE",false);
var isEdge=op.outValue("Is Edge",false);
var isChrome=op.outValue("Is Chrome",false);
var isFirefox=op.outValue("Is Firefox",false);
var isIos=op.outValue("Is iOS",false);
var outNav=op.outValue("Language");


outNav.set(navigator.language || navigator.userLanguage);

isFirefox.set(!!navigator.userAgent.search("Firefox"));


if( /MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent))
{
    isIe.set(true);
    isFirefox.set(false);
}

if(/Edge\/\d./i.test(navigator.userAgent))
{
   isEdge.set(true);
   isFirefox.set(false);
}

var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

if(isIOSChrome || (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera === false && isIEedge === false))
{
   // is Google Chrome
   isChrome.set(true);
   isFirefox.set(false);
}
else
{
   // not Google Chrome
}

isIos.set( /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
