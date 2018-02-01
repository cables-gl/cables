

var CABLES=CABLES || {};

CABLES.generateUUID=CABLES.uuid=function()
{
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
    {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

// generateUUID=CABLES.generateUUID;

// ----------------------------------------------------------------

CABLES.smoothStep=function(perc)
{
    var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    perc= x*x*(3 - 2*x); // smoothstep
    return perc;
};

CABLES.smootherStep=function(perc)
{
    var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    perc= x*x*x*(x*(x*6 - 15) + 10); // smootherstep
    return perc;
};

// ----------------------------------------------------------------

CABLES.map=function(x,_oldMin,_oldMax,_newMin,_newMax,_easing)
{
    if(x>=_oldMax) return _newMax;
    if(x<=_oldMin) return _newMin;

    var reverseInput = false;
    var oldMin = Math.min( _oldMin, _oldMax );
    var oldMax = Math.max( _oldMin, _oldMax );
    if(oldMin!= _oldMin) reverseInput = true;

    var reverseOutput = false;
    var newMin = Math.min( _newMin, _newMax );
    var newMax = Math.max( _newMin, _newMax );
    if(newMin != _newMin) reverseOutput = true;

    var portion=0;
    var r=0;

    if(reverseInput) portion = (oldMax-x)*(newMax-newMin)/(oldMax-oldMin);
        else portion = (x-oldMin)*(newMax-newMin)/(oldMax-oldMin);

    if(reverseOutput) r=newMax - portion;
        else r=portion + newMin;

    if(!_easing) return r;
    else
    if(_easing==1) // smoothstep
    {
        x = Math.max(0, Math.min(1, (r-_newMin)/(_newMax-_newMin)));
        return ( _newMin+x*x*(3 - 2*x)* (_newMax-_newMin) );
    }
    else
    if(_easing==2) // smootherstep
    {
        x = Math.max(0, Math.min(1, (r-_newMin)/(_newMax-_newMin)));
        return ( _newMin+x*x*x*(x*(x*6 - 15) + 10) * (_newMax-_newMin) ) ;
    }

    return r;
};

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

function arrayWriteToEnd(arr,v)
{
    for(var i=1;i<arr.length;i++)arr[i-1]=arr[i];
    arr[arr.length-1]=v;
}

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




CABLES.jsonp=function(url,cb)
{

    CABLES.jsonpCounter=CABLES.jsonpCounter||0;
    CABLES.jsonpCounter++;
    var jsonPID=CABLES.jsonpCounter;

    console.log('making jsonp request...');


    CABLES["jsonpFunc"+jsonPID]=function(data)
    {

        console.log(data);
        cb(false, data);
    };


    var paramChar='?';
    if(url.indexOf(paramChar)>-1)paramChar='&';

    var s = document.createElement( 'script' );
    s.setAttribute( 'src', url+paramChar+'callback=CABLES.jsonpFunc'+jsonPID );
    // s.onload=function()
    // {
    // };
    document.body.appendChild( s );

};

CABLES.ajaxSync=function(url,cb,method,post,contenttype)
{
    CABLES.ajaxIntern(url,cb,method,post,contenttype,false);
};

CABLES.ajax=function(url,cb,method,post,contenttype,jsonp)
{
    CABLES.ajaxIntern(url,cb,method,post,contenttype,true,jsonp);
};

CABLES.ajaxIntern=function(url,cb,method,post,contenttype,asynch)
{

    var xhr;
    try{ xhr = new XMLHttpRequest(); }catch(e){}

    xhr.onreadystatechange = function()
    {
        if (xhr.readyState != 4) return;

        // cb( (xhr.status != 200 || xhr.status !==0 ) ?new Error(url+"server response status is "+xhr.status):false, xhr.responseText,xhr);
        cb(false, xhr.responseText,xhr);
    };

    xhr.addEventListener("progress", function(ev)
    {
        // console.log('progress',ev.loaded/1024);
        // if (ev.lengthComputable)
        // {
        //     var percentComplete = ev.loaded / ev.total;
        //     console.log(url,percentComplete);
        // }
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
CGL.DEG2RAD=Math.PI/180.0;
CGL.RAD2DEG=180.0/Math.PI;


CGL.onLoadingAssetsFinished=null; // deprecated / remove later

CGL.isWindows=window.navigator.userAgent.indexOf("Windows") != -1;


CGL.getWheelSpeed=function(event)
{
    var normalized;
    if (event.wheelDelta)
    {
        //chrome
        normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 30;
        normalized*=-1.5;
        if(CGL.isWindows)normalized*=2;
    }
    else
    {
        //firefox
        var rawAmmount = event.deltaY ? event.deltaY : event.detail;
        normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
        normalized*=-3;
    }

    if(normalized>20)normalized=20;
    if(normalized<-20)normalized=-20;

    return normalized;
};

// ----------------------------------------------------------------

function float32Concat(first, second)
{
    if(!(first instanceof Float32Array))first=new Float32Array(first);
    if(!(second instanceof Float32Array))second=new Float32Array(second);

    var firstLength = first.length,
        result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}
