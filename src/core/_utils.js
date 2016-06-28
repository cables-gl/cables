function generateUUID()
{
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
    {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

// ----------------------------------------------------------------

Math.randomSeed=1;
Math.seededRandom = function(max, min)
{
    if(Math.randomSeed===0)Math.randomSeed=Math.random()*999;
    max = max || 1;
    min = min || 0;

    Math.randomSeed = (Math.randomSeed * 9301 + 49297) % 233280;
    var rnd = Math.randomSeed / 233280.0;

    return min + rnd * (max - min);
};

// ----------------------------------------------------------------

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};
// ----------------------------------------------------------------

function ajaxRequest(url, callback)
{
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = function(e)
    {
        callback(e.target.response);
    };
    request.send();
}

// ----------------------------------------------------------------

CABLES=CABLES || {};

CABLES.DateNow=performance.now || Date.now; // todo: still used??

CABLES.ajaxSync=function(url,cb,method,post,contenttype)
{
    CABLES.ajaxIntern(url,cb,method,post,contenttype,false);
};
CABLES.ajax=function(url,cb,method,post,contenttype)
{
    CABLES.ajaxIntern(url,cb,method,post,contenttype,true);
};

CABLES.ajaxIntern=function(url,cb,method,post,contenttype,asynch)
{

    var requestTimeout,xhr;
    try{ xhr = new XMLHttpRequest(); }catch(e){}


    // requestTimeout = setTimeout(function() {xhr.abort(); cb(new Error("tinyxhr: aborted by a timeout"), "",xhr); }, 30000);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState != 4) return;
        clearTimeout(requestTimeout);

        // cb( (xhr.status != 200 || xhr.status !==0 ) ?new Error(url+"server response status is "+xhr.status):false, xhr.responseText,xhr);
        cb(false, xhr.responseText,xhr);

    };

    xhr.addEventListener("progress", function(ev)
    {
        console.log('progress',ev.loaded/1024);
        if (ev.lengthComputable)
        {
            var percentComplete = ev.loaded / ev.total;
            console.log(url,percentComplete);
        }
    });


    xhr.open(method?method.toUpperCase():"GET", url, asynch);

    if(!post) xhr.send();
    else
    {
        xhr.setRequestHeader('Content-type', contenttype?contenttype:'application/x-www-form-urlencoded');
        xhr.send(post);
    }
};

// ----------------------------------------------------------------


String.prototype.endl = function(){return this+'\n';};

// ----------------------------------------------------------------

var arrayContains = function(arr,obj)
{
    var i = arr.length;
    while (i--)
    {
        if (arr[i] === obj)
        {
            return true;
        }
    }
    return false;
};

// ----------------------------------------------------------------

CGL=CGL || {};
CGL.DEG2RAD=3.14159/180.0;

CGL.onLoadingAssetsFinished=null; // deprecated / remove later


CGL.getWheelSpeed=function(event)
{
    var normalized;
    if (event.wheelDelta)
    {
        normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
    }
    else
    {
        var rawAmmount = event.deltaY ? event.deltaY : event.detail;
        normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
    }

    normalized*=-4.0;
    if(normalized>400)normalized=400;
    if(normalized<-400)normalized=-400;
    // console.log('normalized',normalized);


    return normalized;
};
