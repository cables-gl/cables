/** @memberof CABLES */

var CABLES=CABLES || {};
CABLES.TL=CABLES.TL || {};

CABLES.TL.EASING_LINEAR=0;
CABLES.TL.EASING_ABSOLUTE=1;
CABLES.TL.EASING_SMOOTHSTEP=2;
CABLES.TL.EASING_SMOOTHERSTEP=3;
CABLES.TL.EASING_BEZIER=4;

CABLES.TL.EASING_CUBIC_IN=5;
CABLES.TL.EASING_CUBIC_OUT=6;
CABLES.TL.EASING_CUBIC_INOUT=7;

CABLES.TL.EASING_EXPO_IN=8;
CABLES.TL.EASING_EXPO_OUT=9;
CABLES.TL.EASING_EXPO_INOUT=10;

CABLES.TL.EASING_SIN_IN=11;
CABLES.TL.EASING_SIN_OUT=12;
CABLES.TL.EASING_SIN_INOUT=13;

CABLES.TL.EASING_BACK_IN=14;
CABLES.TL.EASING_BACK_OUT=15;
CABLES.TL.EASING_BACK_INOUT=16;

CABLES.TL.EASING_ELASTIC_IN=17;
CABLES.TL.EASING_ELASTIC_OUT=18;

CABLES.TL.EASING_BOUNCE_IN=19;
CABLES.TL.EASING_BOUNCE_OUT=21;

CABLES.TL.EASING_QUART_IN=22;
CABLES.TL.EASING_QUART_OUT=23;
CABLES.TL.EASING_QUART_INOUT=24;

CABLES.TL.EASING_QUINT_IN=25;
CABLES.TL.EASING_QUINT_OUT=26;
CABLES.TL.EASING_QUINT_INOUT=27;

CABLES.TL.Key=function(obj)
{
    this.time=0.0;
    this.value=0.0;
    this.ui={};
    this.onChange=null;
    this._easing=0;
    this.bezTime=0.5;
    this.bezValue=0;
    this.bezTimeIn=-0.5;
    this.bezValueIn=0;

    this.cb=null;
    this.cbTriggered=false;

    var bezierAnim=null;
    var updateBezier=false;

    this.setEasing(CABLES.TL.EASING_LINEAR);
    this.set(obj);
};

CABLES.TL.Key.linear=function(perc,key1,key2)
{
    return parseFloat(key1.value)+ parseFloat((key2.value - key1.value)) * perc;
};

CABLES.TL.Key.easeLinear=function(perc,key2)
{
    return CABLES.TL.Key.linear(perc,this,key2);
};

CABLES.TL.Key.easeAbsolute=function(perc,key2)
{
    return this.value;
};

CABLES.easeExpoIn=function(t)
{
    return t= Math.pow( 2, 10 * (t - 1) );
}

CABLES.TL.Key.easeExpoIn=function( t,  key2)
{
    t=CABLES.easeExpoIn(t);
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.easeExpoOut=function(t)
{
    t= ( -Math.pow( 2, -10 * t ) + 1 );
    return t;
}

CABLES.TL.Key.easeExpoOut=function( t,  key2)
{
    t=CABLES.easeExpoOut(t);
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.easeExpoInOut=function(t)
{
    t*=2;
    if (t < 1)
    {
      t= 0.5 * Math.pow( 2, 10 * (t - 1) );
    }
    else
    {
        t--;
        t= 0.5 * ( -Math.pow( 2, -10 * t) + 2 );
    }
    return t;
}

CABLES.TL.Key.easeExpoInOut=function( t,  key2)
{
    t=CABLES.easeExpoInOut(t);
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeSinIn=function( t,key2)
{
    t= -1 * Math.cos(t * Math.PI/2) + 1;
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeSinOut=function( t,key2)
{
    t= Math.sin(t * Math.PI/2);
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeSinInOut=function( t,key2)
{
    t= -0.5 * (Math.cos(Math.PI*t) - 1.0);
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.easeCubicIn=function(t)
{
    t=t*t*t;
    return t;
}

CABLES.TL.Key.easeCubicIn=function(t,key2)
{
    t=CABLES.easeCubicIn(t);
    return CABLES.TL.Key.linear(t,this,key2);
};

// b 0
// c 1/2 or 1
// d always 1
// easeOutCubic: function (x, t, b, c, d) {
//     return c*((t=t/d-1)*t*t + 1) + b;


CABLES.TL.Key.easeInQuint=function(t,key2)
{

    t= t*t*t*t*t;
    return CABLES.TL.Key.linear(t,this,key2);
};
CABLES.TL.Key.easeOutQuint=function(t,key2)
{
    t= ((t-=1)*t*t*t*t + 1);
    return CABLES.TL.Key.linear(t,this,key2);
};
CABLES.TL.Key.easeInOutQuint=function(t,key2)
{
    if ((t/=0.5) < 1) t= 0.5*t*t*t*t*t;
        else t= 0.5*((t-=2)*t*t*t*t + 2);
    return CABLES.TL.Key.linear(t,this,key2);
};




CABLES.TL.Key.easeInQuart=function(t,key2)
{
    t=t*t*t*t;
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeOutQuart=function(t,key2)
{
    // return -c * ((t=t/d-1)*t*t*t - 1) + b;
    t= -1 * ((t-=1)*t*t*t - 1);
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeInOutQuart=function(t,key2)
{
    if((t/=0.5) < 1) t= 0.5*t*t*t*t;
        else t= -0.5 * ((t-=2)*t*t*t - 2);
    return CABLES.TL.Key.linear(t,this,key2);
};



CABLES.TL.Key.bounce=function(t)
{
    if ((t/=1) < (1/2.75)) t= (7.5625*t*t);
    else if (t < (2/2.75)) t= (7.5625*(t-=(1.5/2.75))*t + 0.75);
    else if (t < (2.5/2.75)) t= (7.5625*(t-=(2.25/2.75))*t + 0.9375);
    else t= (7.5625*(t-=(2.625/2.75))*t + 0.984375);
    return t;
};

CABLES.TL.Key.easeInBounce=function(t,key2)
{
    return CABLES.TL.Key.linear(CABLES.TL.Key.bounce(t),this,key2);
    // return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d);
};

CABLES.TL.Key.easeOutBounce=function(t,key2)
{
    return CABLES.TL.Key.linear(CABLES.TL.Key.bounce(t),this,key2);
};

CABLES.TL.Key.easeInElastic=function(t,key2)
{
    var s=1.70158;
    var p=0;
    var a=1;

    var b=0;
    var d=1;
    var c=1;

    if (t===0) t= b;
        else if ((t/=d)==1) t= b+c;
            else
            {
                if(!p) p=d*0.3;
                if(a < Math.abs(c)) { a=c; s=p/4; }
                    else s = p/(2*Math.PI) * Math.asin (c/a);
                t= -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            }

    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeOutElastic=function(t,key2)
{
    var s=1.70158;
    var p=0;
    var a=1;

    var b=0;
    var d=1;
    var c=1;

    if (t===0) t=b;
        else if ((t/=d)==1) t=b+c;
            else
            {
                if (!p) p=d*0.3;
                if (a < Math.abs(c)) { a=c; s=p/4; }
                    else s = p/(2*Math.PI) * Math.asin (c/a);
                t= a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
            }

    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeInBack=function(t,key2)
{
    var s = 1.70158;
    t=(t)*t*((s+1)*t - s) ;

    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeOutBack=function (t,key2)
{
    var s = 1.70158;
    t= ((t=t/1-1)*t*((s+1)*t + s) + 1) ;

    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeInOutBack=function(t, key2)
{
    var s = 1.70158;
    var c=1/2;
    if ((t/=1/2) < 1) t= c*(t*t*(((s*=(1.525))+1)*t - s));
        else t= c*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);

    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.easeCubicOut=function(t)
{
    t--;
    t=(t*t*t + 1) ;
    return t;
}

CABLES.TL.Key.easeCubicOut=function(t,key2)
{
    t=CABLES.easeCubicOut(t);
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.easeCubicInOut=function(t)
{
    t*=2;
    if (t < 1) t= 0.5*t*t*t;
    else
    {
        t -= 2;
        t= 0.5*(t*t*t + 2);
    }
    return t;
}

CABLES.TL.Key.easeCubicInOut=function(t,key2)
{
    t=CABLES.easeCubicInOut(t);
    return CABLES.TL.Key.linear(t,this,key2);
};

CABLES.TL.Key.easeSmoothStep=function(perc,key2)
{
    // var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    var x = Math.max(0, Math.min(1, perc));
    perc= x*x*(3 - 2*x); // smoothstep
    return CABLES.TL.Key.linear(perc,this,key2);
};

CABLES.TL.Key.easeSmootherStep=function(perc,key2)
{
    var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    perc= x*x*x*(x*(x*6 - 15) + 10); // smootherstep
    return CABLES.TL.Key.linear(perc,this,key2);
};


CABLES.TL.Key.prototype.setEasing=function(e)
{
    // console.log('set easing uyay');
    this._easing=e;

    if(this._easing==CABLES.TL.EASING_ABSOLUTE) this.ease=CABLES.TL.Key.easeAbsolute;
    else if(this._easing==CABLES.TL.EASING_SMOOTHSTEP) this.ease=CABLES.TL.Key.easeSmoothStep;
    else if(this._easing==CABLES.TL.EASING_SMOOTHERSTEP) this.ease=CABLES.TL.Key.easeSmootherStep;

    else if(this._easing==CABLES.TL.EASING_CUBIC_IN) this.ease=CABLES.TL.Key.easeCubicIn;
    else if(this._easing==CABLES.TL.EASING_CUBIC_OUT) this.ease=CABLES.TL.Key.easeCubicOut;
    else if(this._easing==CABLES.TL.EASING_CUBIC_INOUT) this.ease=CABLES.TL.Key.easeCubicInOut;

    else if(this._easing==CABLES.TL.EASING_EXPO_IN) this.ease=CABLES.TL.Key.easeExpoIn;
    else if(this._easing==CABLES.TL.EASING_EXPO_OUT) this.ease=CABLES.TL.Key.easeExpoOut;
    else if(this._easing==CABLES.TL.EASING_EXPO_INOUT) this.ease=CABLES.TL.Key.easeExpoInOut;

    else if(this._easing==CABLES.TL.EASING_SIN_IN) this.ease=CABLES.TL.Key.easeSinIn;
    else if(this._easing==CABLES.TL.EASING_SIN_OUT) this.ease=CABLES.TL.Key.easeSinOut;
    else if(this._easing==CABLES.TL.EASING_SIN_INOUT) this.ease=CABLES.TL.Key.easeSinInOut;

    else if(this._easing==CABLES.TL.EASING_BACK_OUT) this.ease=CABLES.TL.Key.easeOutBack;
    else if(this._easing==CABLES.TL.EASING_BACK_IN) this.ease=CABLES.TL.Key.easeInBack;
    else if(this._easing==CABLES.TL.EASING_BACK_INOUT) this.ease=CABLES.TL.Key.easeInOutBack;

    else if(this._easing==CABLES.TL.EASING_ELASTIC_IN) this.ease=CABLES.TL.Key.easeInElastic;
    else if(this._easing==CABLES.TL.EASING_ELASTIC_OUT) this.ease=CABLES.TL.Key.easeOutElastic;

    else if(this._easing==CABLES.TL.EASING_BOUNCE_IN) this.ease=CABLES.TL.Key.easeInBounce;
    else if(this._easing==CABLES.TL.EASING_BOUNCE_OUT) this.ease=CABLES.TL.Key.easeOutBounce;

    else if(this._easing==CABLES.TL.EASING_QUART_OUT) this.ease=CABLES.TL.Key.easeOutQuart;
    else if(this._easing==CABLES.TL.EASING_QUART_IN) this.ease=CABLES.TL.Key.easeInQuart;
    else if(this._easing==CABLES.TL.EASING_QUART_INOUT) this.ease=CABLES.TL.Key.easeInOutQuart;

    else if(this._easing==CABLES.TL.EASING_QUINT_OUT) this.ease=CABLES.TL.Key.easeOutQuint;
    else if(this._easing==CABLES.TL.EASING_QUINT_IN) this.ease=CABLES.TL.Key.easeInQuint;
    else if(this._easing==CABLES.TL.EASING_QUINT_INOUT) this.ease=CABLES.TL.Key.easeInOutQuint;

    else if(this._easing==CABLES.TL.EASING_BEZIER)
    {
        updateBezier=true;
        this.ease=CABLES.TL.Key.easeBezier;
    }
    else
    {
        this._easing=CABLES.TL.EASING_LINEAR;
        this.ease=CABLES.TL.Key.easeLinear;
    }
};


CABLES.TL.Key.prototype.trigger=function()
{
    this.cb();
    this.cbTriggered=true;
};

CABLES.TL.Key.prototype.setValue=function(v)
{
    this.value=v;
    updateBezier=true;
    if(this.onChange!==null)this.onChange();
};

CABLES.TL.Key.prototype.set=function(obj)
{
    if(obj)
    {
        if(obj.e) this.setEasing(obj.e);
        if(obj.cb)
        {
            this.cb=obj.cb;
            this.cbTriggered=false;
        }

        if(obj.b)
        {
            this.bezTime=obj.b[0];
            this.bezValue=obj.b[1];
            this.bezTimeIn=obj.b[2];
            this.bezValueIn=obj.b[3];
            updateBezier=true;
        }

        if(obj.hasOwnProperty('t'))this.time=obj.t;
        if(obj.hasOwnProperty('time')) this.time=obj.time;

        if(obj.hasOwnProperty('v')) this.value=obj.v;
            else if(obj.hasOwnProperty('value')) this.value=obj.value;
    }
    if(this.onChange!==null)this.onChange();

};

CABLES.TL.Key.prototype.getSerialized=function()
{
    var obj={};
    obj.t=this.time;
    obj.v=this.value;
    obj.e=this._easing;
    if(this._easing==CABLES.TL.EASING_BEZIER)
        obj.b=[this.bezTime,this.bezValue,this.bezTimeIn,this.bezValueIn];

    return obj;
};


CABLES.TL.Key.prototype.getEasing=function()
{
    return this._easing;
};


// ------------------------------------------------------------------------------------------------------














/**
 * Keyframed interpolated animation. 
 * @name Anim
 * @constructor
 * @class
 */
CABLES.Anim=function(cfg)
{
    this.keys=[];
    this.onChange=null;
    this.stayInTimeline=false;
    this.loop=false;
    this.defaultEasing=CABLES.TL.EASING_LINEAR;
    this.onLooped=null;

    this._timesLooped=0;
    this._needsSort=false;
};
CABLES.TL.Anim=CABLES.Anim;

CABLES.Anim.prototype.forceChangeCallback=function()
{
    if(this.onChange!==null)this.onChange();
};

/**
 * returns true if animation has ended at @time
 * checks if last key time is < time
 * @param {Number} time
 * @returns {Boolean} 
 * @name Anim#hasEnded
 * @function
 */
CABLES.Anim.prototype.hasEnded=function(time)
{
    if(this.keys.length===0)return true;
    if(this.keys[this.keys.length-1].time<=time)return true;
    return false;
};

CABLES.Anim.prototype.isRising=function(time)
{
    if(this.hasEnded(time))return false;
    var ki=this.getKeyIndex(time);
    if(this.keys[ki].value<this.keys[ki+1].value)return true;
    return false;
};

/**
 * remove all keys from animation
 * @param {Number} [time=0] set a new key at time
 * @name Anim#clear
 * @function
 */
CABLES.Anim.prototype.clear=function(time)
{
    var v=0;
    if(time) v=this.getValue(time);
    this.keys.length=0;

    if(time) this.setValue(time,v);
    if(this.onChange!==null)this.onChange();
};

CABLES.Anim.prototype.sortKeys=function()
{
    this.keys.sort(function(a, b)
    {
        return parseFloat(a.time) - parseFloat(b.time);
    });
    this._needsSort=false;
};

CABLES.Anim.prototype.getLength=function()
{
    if(this.keys.length===0)return 0;
    return this.keys[this.keys.length-1].time;
};

CABLES.Anim.prototype.getKeyIndex=function(time)
{
    var index=0;
    for(var i=0;i<this.keys.length;i++)
    {
        if(time >= this.keys[i].time) index=i;
        if( this.keys[i].time > time ) return index;
    }
    return index;
};

/**
 * set value at time
 * @name Anim#setValue
 * @param {Number} [time] time
 * @param {Number} [value] value
 * @param {Function} [callback] callback
 * @function
 */
CABLES.Anim.prototype.setValue=function(time,value,cb)
{
    var found=false;
    for(var i in this.keys)
    {
        if(this.keys[i].time==time)
        {
            found=this.keys[i];
            this.keys[i].setValue(value);
            this.keys[i].cb=cb;
            break;
        }
    }

    if(!found)
    {
        this.keys.push(new CABLES.TL.Key({time:time,value:value,e:this.defaultEasing,cb:cb})) ;
    }

    if(this.onChange)this.onChange();
    this._needsSort=true;
};


CABLES.Anim.prototype.getSerialized=function()
{
    var obj={};
    obj.keys=[];
    obj.loop=this.loop;

    for(var i in this.keys)
    {
        obj.keys.push( this.keys[i].getSerialized() );
    }

    return obj;
};

CABLES.Anim.prototype.getKey=function(time)
{
    var index=this.getKeyIndex(time);
    return this.keys[index];
};

CABLES.Anim.prototype.getNextKey=function(time)
{
    var index=this.getKeyIndex(time)+1;
    if(index>=this.keys.length)index=this.keys.length-1;

    return this.keys[index];
};

CABLES.Anim.prototype.isFinished=function(time)
{
    if(this.keys.length<=0)return true;
    return time>this.keys[this.keys.length-1].time;
};

CABLES.Anim.prototype.isStarted=function(time)
{
    if(this.keys.length<=0)return false;
    return time>=this.keys[0].time;
};

/**
 * get value at time
 * @name Anim#getValue
 * @param {Number} [time] time
 * @returns {Number} interpolated value at time
 * @function
 */
CABLES.Anim.prototype.getValue=function(time)
{
    if(this.keys.length===0)return 0;
    if(this._needsSort)this.sortKeys();

    if(time<this.keys[0].time)return this.keys[0].value;

    var lastKeyIndex=this.keys.length-1;
    if(this.loop && time>this.keys[lastKeyIndex].time)
    {
        var currentLoop=time/this.keys[lastKeyIndex].time;
        if(currentLoop>this._timesLooped)
        {
            this._timesLooped++;
            if(this.onLooped)this.onLooped();
        }
        time=(time-this.keys[0].time)%(this.keys[lastKeyIndex].time-this.keys[0].time);
        time+=this.keys[0].time;
    }

    var index=this.getKeyIndex(time);
    if(index>=lastKeyIndex)
    {
        if(this.keys[lastKeyIndex].cb && !this.keys[lastKeyIndex].cbTriggered)
            this.keys[lastKeyIndex].trigger();

        return this.keys[lastKeyIndex].value;
    }
    var index2=parseInt(index,10)+1;
    var key1=this.keys[index];
    var key2=this.keys[index2];

    if(key1.cb && !key1.cbTriggered)key1.trigger();

    if(!key2)return -1;

    var perc=(time-key1.time)/(key2.time-key1.time);
    return key1.ease(perc,key2);
};

CABLES.Anim.prototype.addKey=function(k)
{
    if(k.time===undefined)
    {
        console.log('key time undefined, ignoring!');
    }
    else
    {
        this.keys.push(k);
        if(this.onChange!==null)this.onChange();
    }
};


CABLES.Anim.prototype.easingFromString=function(str)
{
    if(str=='linear') return CABLES.TL.EASING_LINEAR;
    if(str=='absolute') return CABLES.TL.EASING_ABSOLUTE;
    if(str=='smoothstep') return CABLES.TL.EASING_SMOOTHSTEP;
    if(str=='smootherstep') return CABLES.TL.EASING_SMOOTHERSTEP;

    if(str=='Cubic In') return CABLES.TL.EASING_CUBIC_IN;
    if(str=='Cubic Out') return CABLES.TL.EASING_CUBIC_OUT;
    if(str=='Cubic In Out') return CABLES.TL.EASING_CUBIC_INOUT;

    if(str=='Expo In') return CABLES.TL.EASING_EXPO_IN;
    if(str=='Expo Out') return CABLES.TL.EASING_EXPO_OUT;
    if(str=='Expo In Out') return CABLES.TL.EASING_EXPO_INOUT;

    if(str=='Sin In') return CABLES.TL.EASING_SIN_IN;
    if(str=='Sin Out') return CABLES.TL.EASING_SIN_OUT;
    if(str=='Sin In Out') return CABLES.TL.EASING_SIN_INOUT;

    if(str=='Back In') return CABLES.TL.EASING_BACK_IN;
    if(str=='Back Out') return CABLES.TL.EASING_BACK_OUT;
    if(str=='Back In Out') return CABLES.TL.EASING_BACK_INOUT;

    if(str=='Elastic In') return CABLES.TL.EASING_ELASTIC_IN;
    if(str=='Elastic Out') return CABLES.TL.EASING_ELASTIC_OUT;

    if(str=='Bounce In') return CABLES.TL.EASING_BOUNCE_IN;
    if(str=='Bounce Out') return CABLES.TL.EASING_BOUNCE_OUT;

    if(str=='Quart Out') return CABLES.TL.EASING_QUART_OUT;
    if(str=='Quart In') return CABLES.TL.EASING_QUART_IN;
    if(str=='Quart In Out') return CABLES.TL.EASING_QUART_INOUT;

    if(str=='Quint Out') return CABLES.TL.EASING_QUINT_OUT;
    if(str=='Quint In') return CABLES.TL.EASING_QUINT_IN;
    if(str=='Quint In Out') return CABLES.TL.EASING_QUINT_INOUT;



};

CABLES.Anim.prototype.createPort=function(op,title,cb)
{
    var port=op.addInPort(new Port(op,title,OP_PORT_TYPE_VALUE,{display:'dropdown',values:[
        "linear",
        "absolute",
        "smoothstep",
        "smootherstep",
        "Cubic In",
        "Cubic Out",
        "Cubic In Out",
        "Expo In",
        "Expo Out",
        "Expo In Out",
        "Sin In",
        "Sin Out",
        "Sin In Out",
        "Quart In",
        "Quart Out",
        "Quart In Out",
        "Quint In",
        "Quint Out",
        "Quint In Out",
        "Back In",
        "Back Out",
        "Back In Out",
        "Elastic In",
        "Elastic Out",
        "Elastic In Out",
        "Bounce In",
        "Bounce Out",
        ]} ));

    port.set('linear');
    port.defaultValue='linear';

    port.onChange=function()
    {
        this.defaultEasing=this.easingFromString(port.get());
        if(cb)cb();
    }.bind(this);

    return port;
};





// ------------------------------

CABLES.Anim.slerpQuaternion=function(time,q,animx,animy,animz,animw)
{

    if(!CABLES.Anim.slerpQuaternion.q1)
    {
        CABLES.Anim.slerpQuaternion.q1=quat.create();
        CABLES.Anim.slerpQuaternion.q2=quat.create();
    }

    var i1=animx.getKeyIndex(time);
    var i2=i1+1;
    if(i2>=animx.keys.length)i2=animx.keys.length-1;

    if(i1==i2)
    {
        quat.set(q,
            animx.keys[i1].value,
            animy.keys[i1].value,
            animz.keys[i1].value,
            animw.keys[i1].value
        );
    }
    else
    {
        var key1Time=animx.keys[i1].time;
        var key2Time=animx.keys[i2].time;
        var perc=(time-key1Time)/(key2Time-key1Time);

        quat.set(CABLES.Anim.slerpQuaternion.q1,
            animx.keys[i1].value,
            animy.keys[i1].value,
            animz.keys[i1].value,
            animw.keys[i1].value
        );

        quat.set(CABLES.Anim.slerpQuaternion.q2,
            animx.keys[i2].value,
            animy.keys[i2].value,
            animz.keys[i2].value,
            animw.keys[i2].value
        );

        quat.slerp(q, CABLES.Anim.slerpQuaternion.q1, CABLES.Anim.slerpQuaternion.q2, perc);
    }
    return q;
};
