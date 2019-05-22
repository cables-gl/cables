// "use strict";

var CABLES=CABLES || {};
CABLES.UTILS={};
CGL=CGL || {};

/**
 * merge two float32Arrays
 * @name float32Concat
 * @memberof CABLES.UTILS
 * @function
 * @return {Float32Array} 
 * @static
 */
CABLES.UTILS.float32Concat=function(first, second)
{
    if(!(first instanceof Float32Array))first=new Float32Array(first);
    if(!(second instanceof Float32Array))second=new Float32Array(second);

    var firstLength = first.length,
        result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}

/**
 * randomize order of an array
 * @name shuffleArray
 * @memberof CABLES
 * @function
 * @param array {Array} original
 * @return {Array} shuffled array
 * @static
 */
CABLES.shuffleArray=function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.seededRandom() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


/**
 * generate a UUID
 * @name uuid
 * @memberof CABLES
 * @function
 * @return {String} generated UUID
 * @static
 */
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

/**
 * generate a simple ID 
 * @name simpleId
 * @memberof CABLES
 * @function
 * @return {Number} new id
 * @static
 */
CABLES.simpleIdCounter=0;
CABLES.simpleId=function()
{
    CABLES.simpleIdCounter++;
    return CABLES.simpleIdCounter;
};

/**
 * smoothStep a value
 * @name smoothStep
 * @memberof CABLES
 * @function
 * @param value {Number} value to be smoothed [0-1]
 * @return {Number} smoothed value
 * @static
 */
CABLES.smoothStep=function(perc)
{
    var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    perc= x*x*(3 - 2*x); // smoothstep
    return perc;
};

/**
 * smootherstep a value
 * @name smootherStep
 * @memberof CABLES
 * @function
 * @param value {Number} value to be smoothed [0-1]
 * @return {Number} smoothed value
 * @static
 */
CABLES.smootherStep=function(perc)
{
    var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    perc= x*x*x*(x*(x*6 - 15) + 10); // smootherstep
    return perc;
};

/**
 * map a value in a range to a value in another range
 * @name map
 * @memberof CABLES
 * @function
 * @param value {Number} value to be mapped
 * @param oldMin {Number} old range minimum value
 * @param oldMax {Number} old range maximum value
 * @param newMin {Number} new range minimum value
 * @param newMax {Number} new range maximum value
 * @return {Number} mapped value
 * @static
 */
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

/**
 * set random seed for seededRandom()
 * @name Math#randomSeed
 * @type Number
 * @static
 */
Math.randomSeed=1;

/**
 * generate a seeded random number
 * @name seededRandom
 * @memberof Math
 * @function
 * @param max {Number} minimum possible random number
 * @param min {Number} maximum possible random number
 * @return {Number} random value
 * @static
 */
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

CABLES.UTILS.arrayWriteToEnd=function(arr,v)
{
    for(var i=1;i<arr.length;i++)arr[i-1]=arr[i];
    arr[arr.length-1]=v;
}

// ----------------------------------------------------------------

/**
 * returns true if parameter is a number
 * @name isNumeric
 * @memberof CABLES.UTILS
 * @function
 * @return {Boolean} 
 * @static
 */
CABLES.UTILS.isNumeric=function(n)
{
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * returns true if parameter is array
 * @name isArray
 * @memberof CABLES.UTILS
 * @function
 * @return {Boolean} 
 * @static
 */
CABLES.UTILS.isArray = function(v)
{
    return Object.prototype.toString.call(v) === '[object Array]';
};


/**
 * append a linebreak to a string
 * @name endl
 * @memberof String
 * @function
 * @return {Number} string with newline break appended ('\n')
 */
String.prototype.endl = function(){return this+'\n';};

/**
 * return true if string starts with prefix
 * @name startsWith
 * @memberof String
 * @function
 * @param {String} prefix
 * @return {Boolean}
 */
String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
};

/**
 * return true if string ends with suffix
 * @name endsWith
 * @memberof String
 * @function
 * @param {String} suffix
 * @return {Boolean}
 */
String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

// ----------------------------------------------------------------

/**
 * append a unique/random parameter to a url, so the browser is forced to reload the file, even if its cached
 * @name cacheBust
 * @static
 * @memberof CABLES
 * @function
 * @param {String} url
 * @return {String} url with cachebuster parameter
 */
CABLES.cacheBust=function(url)
{
    if(url.indexOf('?')>-1) url+='&'; else url+='?';
    return url+'cb='+CABLES.uuid();
}

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
    CABLES.request(
        {
            "url":url,
            "cb":cb,
            "method":method,
            "data":post,
            "contenttype":contenttype,
            "sync":true
        });
};

CABLES.ajax=function(url,cb,method,post,contenttype,jsonp)
{
    CABLES.request(
        {
            "url":url,
            "cb":cb,
            "method":method,
            "data:":post,
            "contenttype":contenttype,
            "sync":false,
            "jsonp":jsonp
        });
};

CABLES.request=function(options)
{
    if(!options.hasOwnProperty('asynch'))options.asynch=true;

    var xhr;
    try{ xhr = new XMLHttpRequest(); }catch(e){}

    xhr.onreadystatechange = function()
    {
        if (xhr.readyState != 4) return;

        if(options.cb)
        {
            if(xhr.status == 200 || xhr.status == 0) options.cb(false, xhr.responseText,xhr);
            else options.cb(true, xhr.responseText,xhr);
        }
    };

    xhr.addEventListener("progress", function(ev)
    {
        // console.log('progress',ev.loaded/1024+' kb');
        // if (ev.lengthComputable)
        // {
        //     var percentComplete = ev.loaded / ev.total;
        //     console.log(url,percentComplete);
        // }
    });

    xhr.open(options.method?options.method.toUpperCase():"GET", options.url, !options.sync);

    if(!options.post && !options.data)
    {
        xhr.send();
    }
    else
    {
        xhr.setRequestHeader('Content-type', options.contenttype?options.contenttype:'application/x-www-form-urlencoded');
        xhr.send(options.data||options.post);
    }
};

/** 
 * @constant {number} 
 * @description multiply to get radians from degree, e.g. `360 * CGL.DEG2RAD`
 */
CGL.DEG2RAD=Math.PI/180.0;

/** 
 * @constant {number} 
 * @description to get degrees from radians, e.g. `3.14 * CGL.RAD2DEG` 
 */
CGL.RAD2DEG=180.0/Math.PI;

CGL.onLoadingAssetsFinished=null; // deprecated / remove later

/**
 * get normalized mouse wheel delta (including browser specific adjustment)
 * @name getWheelDelta
 * @static
 * @memberof CGL
 * @function
 * @param {MouseEvent} event
 * @return {Number} normalized delta
 */
CGL.isWindows=window.navigator.userAgent.indexOf("Windows") != -1;
CGL.getWheelSpeed=CGL.getWheelDelta=function(event)
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

window.performance = (window.performance ||
{
    offset: Date.now(),
    now: function now(){ return Date.now() - this.offset; }
});
