let isMobile = op.outValue("Is Mobile", false);
let isIe = op.outValue("Is IE", false);
let isIe10Plus = op.outValue("Is IE 10+", false);
let isIe11 = op.outValue("Is IE 11", false);
let isEdge = op.outValue("Is Edge", false);
let isChrome = op.outValue("Is Chrome", false);
let isFirefox = op.outValue("Is Firefox", false);
let isSafari = op.outValue("Is Safari", false);
let isWindows = op.outValue("Is Windows", false);
let isLinux = op.outValue("Is Linux", false);
let isMac = op.outValue("Is Mac", false);
let isIos = op.outValue("Is iOS", false);
let isAndroid = op.outValue("Is Android", false);

let outNav = op.outValue("Language");

outNav.set(navigator.language || navigator.userLanguage);

isFirefox.set(!!navigator.userAgent.search("Firefox"));

if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent))
{
    isSafari.set(true);
}

if (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent))
{
    isIe.set(true);
    isFirefox.set(false);
    if (/MSIE 9/i.test(navigator.userAgent))
    {
        isIe10Plus.set(false);
        isIe11.set(false);
    }
    else if (/MSIE 10/i.test(navigator.userAgent))
    {
        isIe10Plus.set(true);
        isIe11.set(false);
    }
    else if (/rv:11.0/i.test(navigator.userAgent))
    {
        isIe10Plus.set(false);
        isIe11.set(true);
    }
}

if (/Edge\/\d./i.test(navigator.userAgent))
{
    isEdge.set(true);
    isFirefox.set(false);
}

let isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

if (isIOSChrome || (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera === false && isIEedge === false))
{
    // is Google Chrome
    isChrome.set(true);
    isFirefox.set(false);
}
else
{
    // not Google Chrome
}

if (window.navigator.userAgent.indexOf("Windows") != -1)
{
    isWindows.set(true);
}

if (window.navigator.userAgent.indexOf("Linux") != -1)
{
    isWindows.set(false);
    isLinux.set(true);
}

if (window.navigator.userAgent.indexOf("Mac") != -1)
{
    isWindows.set(false);
    isMac.set(true);
}

isIos.set(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

if (window.navigator.userAgent.toLowerCase().indexOf("android") != -1)
    isAndroid.set(true);

isMobile.set(false);
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    isMobile.set(true);
