// import { quat } from "gl-matrix";
import { Port } from "./core_port";
import { Log } from "./log";

import { CONSTANTS } from "./constants";

const ANIM = {};

ANIM.Key = function (obj)
{
    this.time = 0.0;
    this.value = 0.0;
    this.ui = {};
    this.onChange = null;
    this._easing = 0;
    this.bezTime = 0.5;
    this.bezValue = 0;
    this.bezTimeIn = -0.5;
    this.bezValueIn = 0;

    this.cb = null;
    this.cbTriggered = false;

    const bezierAnim = null;
    this._updateBezier = false;

    this.setEasing(CONSTANTS.ANIM.EASING_LINEAR);
    this.set(obj);
};

ANIM.Key.linear = function (perc, key1, key2)
{
    return parseFloat(key1.value) + parseFloat(key2.value - key1.value) * perc;
};

ANIM.Key.easeLinear = function (perc, key2)
{
    return ANIM.Key.linear(perc, this, key2);
};

ANIM.Key.easeAbsolute = function (perc, key2)
{
    return this.value;
};

export const easeExpoIn = function (t)
{
    return (t = Math.pow(2, 10 * (t - 1)));
};

ANIM.Key.easeExpoIn = function (t, key2)
{
    t = easeExpoIn(t);
    return ANIM.Key.linear(t, this, key2);
};

export const easeExpoOut = function (t)
{
    t = -Math.pow(2, -10 * t) + 1;
    return t;
};

ANIM.Key.easeExpoOut = function (t, key2)
{
    t = easeExpoOut(t);
    return ANIM.Key.linear(t, this, key2);
};

export const easeExpoInOut = function (t)
{
    t *= 2;
    if (t < 1)
    {
        t = 0.5 * Math.pow(2, 10 * (t - 1));
    }
    else
    {
        t--;
        t = 0.5 * (-Math.pow(2, -10 * t) + 2);
    }
    return t;
};

ANIM.Key.easeExpoInOut = function (t, key2)
{
    t = easeExpoInOut(t);
    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeSinIn = function (t, key2)
{
    t = -1 * Math.cos((t * Math.PI) / 2) + 1;
    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeSinOut = function (t, key2)
{
    t = Math.sin((t * Math.PI) / 2);
    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeSinInOut = function (t, key2)
{
    t = -0.5 * (Math.cos(Math.PI * t) - 1.0);
    return ANIM.Key.linear(t, this, key2);
};

export const easeCubicIn = function (t)
{
    t = t * t * t;
    return t;
};

ANIM.Key.easeCubicIn = function (t, key2)
{
    t = easeCubicIn(t);
    return ANIM.Key.linear(t, this, key2);
};

// b 0
// c 1/2 or 1
// d always 1
// easeOutCubic: function (x, t, b, c, d) {
//     return c*((t=t/d-1)*t*t + 1) + b;

ANIM.Key.easeInQuint = function (t, key2)
{
    t = t * t * t * t * t;
    return ANIM.Key.linear(t, this, key2);
};
ANIM.Key.easeOutQuint = function (t, key2)
{
    t = (t -= 1) * t * t * t * t + 1;
    return ANIM.Key.linear(t, this, key2);
};
ANIM.Key.easeInOutQuint = function (t, key2)
{
    if ((t /= 0.5) < 1) t = 0.5 * t * t * t * t * t;
    else t = 0.5 * ((t -= 2) * t * t * t * t + 2);
    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeInQuart = function (t, key2)
{
    t = t * t * t * t;
    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeOutQuart = function (t, key2)
{
    // return -c * ((t=t/d-1)*t*t*t - 1) + b;
    t = -1 * ((t -= 1) * t * t * t - 1);
    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeInOutQuart = function (t, key2)
{
    if ((t /= 0.5) < 1) t = 0.5 * t * t * t * t;
    else t = -0.5 * ((t -= 2) * t * t * t - 2);
    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.bounce = function (t)
{
    if ((t /= 1) < 1 / 2.75) t = 7.5625 * t * t;
    else if (t < 2 / 2.75) t = 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    else if (t < 2.5 / 2.75) t = 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    else t = 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    return t;
};

ANIM.Key.easeInBounce = function (t, key2)
{
    return ANIM.Key.linear(ANIM.Key.bounce(t), this, key2);
    // return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d);
};

ANIM.Key.easeOutBounce = function (t, key2)
{
    return ANIM.Key.linear(ANIM.Key.bounce(t), this, key2);
};

ANIM.Key.easeInElastic = function (t, key2)
{
    let s = 1.70158;
    let p = 0;
    let a = 1;

    const b = 0;
    const d = 1;
    const c = 1;

    if (t === 0) t = b;
    else if ((t /= d) == 1) t = b + c;
    else
    {
        if (!p) p = d * 0.3;
        if (a < Math.abs(c))
        {
            a = c;
            s = p / 4;
        }
        else s = (p / (2 * Math.PI)) * Math.asin(c / a);
        t = -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b;
    }

    return ANIM.Key.linear(t, this, key2);
};


ANIM.Key.easeOutElastic = function (t, key2)
{
    let s = 1.70158;
    let p = 0;
    let a = 1;

    const b = 0;
    const d = 1;
    const c = 1;

    if (t === 0) t = b;
    else if ((t /= d) == 1) t = b + c;
    else
    {
        if (!p) p = d * 0.3;
        if (a < Math.abs(c))
        {
            a = c;
            s = p / 4;
        }
        else s = (p / (2 * Math.PI)) * Math.asin(c / a);
        t = a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) + c + b;
    }

    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeInBack = function (t, key2)
{
    const s = 1.70158;
    t = t * t * ((s + 1) * t - s);

    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeOutBack = function (t, key2)
{
    const s = 1.70158;
    t = (t = t / 1 - 1) * t * ((s + 1) * t + s) + 1;

    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeInOutBack = function (t, key2)
{
    let s = 1.70158;
    const c = 1 / 2;
    if ((t /= 1 / 2) < 1) t = c * (t * t * (((s *= 1.525) + 1) * t - s));
    else t = c * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);

    return ANIM.Key.linear(t, this, key2);
};

export const easeCubicOut = function (t)
{
    t--;
    t = t * t * t + 1;
    return t;
};

ANIM.Key.easeCubicOut = function (t, key2)
{
    t = easeCubicOut(t);
    return ANIM.Key.linear(t, this, key2);
};

export const easeCubicInOut = function (t)
{
    t *= 2;
    if (t < 1) t = 0.5 * t * t * t;
    else
    {
        t -= 2;
        t = 0.5 * (t * t * t + 2);
    }
    return t;
};

ANIM.Key.easeCubicInOut = function (t, key2)
{
    t = easeCubicInOut(t);
    return ANIM.Key.linear(t, this, key2);
};

ANIM.Key.easeSmoothStep = function (perc, key2)
{
    // var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    const x = Math.max(0, Math.min(1, perc));
    perc = x * x * (3 - 2 * x); // smoothstep
    return ANIM.Key.linear(perc, this, key2);
};

ANIM.Key.easeSmootherStep = function (perc, key2)
{
    const x = Math.max(0, Math.min(1, (perc - 0) / (1 - 0)));
    perc = x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
    return ANIM.Key.linear(perc, this, key2);
};

ANIM.Key.prototype.setEasing = function (e)
{
    this._easing = e;

    if (this._easing == CONSTANTS.ANIM.EASING_ABSOLUTE) this.ease = ANIM.Key.easeAbsolute;
    else if (this._easing == CONSTANTS.ANIM.EASING_SMOOTHSTEP) this.ease = ANIM.Key.easeSmoothStep;
    else if (this._easing == CONSTANTS.ANIM.EASING_SMOOTHERSTEP) this.ease = ANIM.Key.easeSmootherStep;
    else if (this._easing == CONSTANTS.ANIM.EASING_CUBIC_IN) this.ease = ANIM.Key.easeCubicIn;
    else if (this._easing == CONSTANTS.ANIM.EASING_CUBIC_OUT) this.ease = ANIM.Key.easeCubicOut;
    else if (this._easing == CONSTANTS.ANIM.EASING_CUBIC_INOUT) this.ease = ANIM.Key.easeCubicInOut;
    else if (this._easing == CONSTANTS.ANIM.EASING_EXPO_IN) this.ease = ANIM.Key.easeExpoIn;
    else if (this._easing == CONSTANTS.ANIM.EASING_EXPO_OUT) this.ease = ANIM.Key.easeExpoOut;
    else if (this._easing == CONSTANTS.ANIM.EASING_EXPO_INOUT) this.ease = ANIM.Key.easeExpoInOut;
    else if (this._easing == CONSTANTS.ANIM.EASING_SIN_IN) this.ease = ANIM.Key.easeSinIn;
    else if (this._easing == CONSTANTS.ANIM.EASING_SIN_OUT) this.ease = ANIM.Key.easeSinOut;
    else if (this._easing == CONSTANTS.ANIM.EASING_SIN_INOUT) this.ease = ANIM.Key.easeSinInOut;
    else if (this._easing == CONSTANTS.ANIM.EASING_BACK_OUT) this.ease = ANIM.Key.easeOutBack;
    else if (this._easing == CONSTANTS.ANIM.EASING_BACK_IN) this.ease = ANIM.Key.easeInBack;
    else if (this._easing == CONSTANTS.ANIM.EASING_BACK_INOUT) this.ease = ANIM.Key.easeInOutBack;
    else if (this._easing == CONSTANTS.ANIM.EASING_ELASTIC_IN) this.ease = ANIM.Key.easeInElastic;
    else if (this._easing == CONSTANTS.ANIM.EASING_ELASTIC_OUT) this.ease = ANIM.Key.easeOutElastic;
    else if (this._easing == CONSTANTS.ANIM.EASING_ELASTIC_INOUT) this.ease = ANIM.Key.easeElasticInOut;
    else if (this._easing == CONSTANTS.ANIM.EASING_BOUNCE_IN) this.ease = ANIM.Key.easeInBounce;
    else if (this._easing == CONSTANTS.ANIM.EASING_BOUNCE_OUT) this.ease = ANIM.Key.easeOutBounce;
    else if (this._easing == CONSTANTS.ANIM.EASING_QUART_OUT) this.ease = ANIM.Key.easeOutQuart;
    else if (this._easing == CONSTANTS.ANIM.EASING_QUART_IN) this.ease = ANIM.Key.easeInQuart;
    else if (this._easing == CONSTANTS.ANIM.EASING_QUART_INOUT) this.ease = ANIM.Key.easeInOutQuart;
    else if (this._easing == CONSTANTS.ANIM.EASING_QUINT_OUT) this.ease = ANIM.Key.easeOutQuint;
    else if (this._easing == CONSTANTS.ANIM.EASING_QUINT_IN) this.ease = ANIM.Key.easeInQuint;
    else if (this._easing == CONSTANTS.ANIM.EASING_QUINT_INOUT) this.ease = ANIM.Key.easeInOutQuint;
    else if (this._easing == CONSTANTS.ANIM.EASING_BEZIER)
    {
        this._updateBezier = true;
        this.ease = ANIM.Key.easeBezier;
    }
    else
    {
        this._easing = CONSTANTS.ANIM.EASING_LINEAR;
        this.ease = ANIM.Key.easeLinear;
    }
};

ANIM.Key.prototype.trigger = function ()
{
    this.cb();
    this.cbTriggered = true;
};

ANIM.Key.prototype.setValue = function (v)
{
    this.value = v;
    this._updateBezier = true;
    if (this.onChange !== null) this.onChange();
};

ANIM.Key.prototype.set = function (obj)
{
    if (obj)
    {
        if (obj.e) this.setEasing(obj.e);
        if (obj.cb)
        {
            this.cb = obj.cb;
            this.cbTriggered = false;
        }

        if (obj.b)
        {
            this.bezTime = obj.b[0];
            this.bezValue = obj.b[1];
            this.bezTimeIn = obj.b[2];
            this.bezValueIn = obj.b[3];
            this._updateBezier = true;
        }

        if (obj.hasOwnProperty("t")) this.time = obj.t;
        if (obj.hasOwnProperty("time")) this.time = obj.time;
        if (obj.hasOwnProperty("v")) this.value = obj.v;
        else if (obj.hasOwnProperty("value")) this.value = obj.value;
    }
    if (this.onChange !== null) this.onChange();
};

ANIM.Key.prototype.getSerialized = function ()
{
    const obj = {};
    obj.t = this.time;
    obj.v = this.value;
    obj.e = this._easing;
    if (this._easing == CONSTANTS.ANIM.EASING_BEZIER) obj.b = [this.bezTime, this.bezValue, this.bezTimeIn, this.bezValueIn];

    return obj;
};

ANIM.Key.prototype.getEasing = function ()
{
    return this._easing;
};

export { ANIM };

// ------------------------------------------------------------------------------------------------------

/**
 * Keyframed interpolated animation.
 *
 * Available Easings:
 * <pre>
 * CONSTANTS.ANIM.EASING_LINEAR
 * CONSTANTS.ANIM.EASING_ABSOLUTE
 * CONSTANTS.ANIM.EASING_SMOOTHSTEP
 * CONSTANTS.ANIM.EASING_SMOOTHERSTEP
 * CONSTANTS.ANIM.EASING_BEZIER

 * CONSTANTS.ANIM.EASING_CUBIC_IN
 * CONSTANTS.ANIM.EASING_CUBIC_OUT
 * CONSTANTS.ANIM.EASING_CUBIC_INOUT

 * CONSTANTS.ANIM.EASING_EXPO_IN
 * CONSTANTS.ANIM.EASING_EXPO_OUT
 * CONSTANTS.ANIM.EASING_EXPO_INOUT

 * CONSTANTS.ANIM.EASING_SIN_IN
 * CONSTANTS.ANIM.EASING_SIN_OUT
 * CONSTANTS.ANIM.EASING_SIN_INOUT

 * CONSTANTS.ANIM.EASING_BACK_IN
 * CONSTANTS.ANIM.EASING_BACK_OUT
 * CONSTANTS.ANIM.EASING_BACK_INOUT

 * CONSTANTS.ANIM.EASING_ELASTIC_IN
 * CONSTANTS.ANIM.EASING_ELASTIC_OUT

 * CONSTANTS.ANIM.EASING_BOUNCE_IN
 * CONSTANTS.ANIM.EASING_BOUNCE_OUT

 * CONSTANTS.ANIM.EASING_QUART_IN
 * CONSTANTS.ANIM.EASING_QUART_OUT
 * CONSTANTS.ANIM.EASING_QUART_INOUT

 * CONSTANTS.ANIM.EASING_QUINT_IN
 * CONSTANTS.ANIM.EASING_QUINT_OUT
 * CONSTANTS.ANIM.EASING_QUINT_INOUT
 * </pre>
 * @hideconstructor
 * @external CABLES
 * @namespace Anim
 * @class
 * @example
 * var anim=new CABLES.Anim();
 * anim.setValue(0,0);  // set value 0 at 0 seconds
 * anim.setValue(10,1); // set value 1 at 10 seconds
 * anim.getValue(5);    // get value at 5 seconds - this returns 0.5

 */
const Anim = function (cfg)
{
    this.keys = [];
    this.onChange = null;
    this.stayInTimeline = false;
    this.loop = false;

    /**
     * @member defaultEasing
     * @memberof Anim
     * @instance
     * @type {Number}
     */
    this.defaultEasing = CONSTANTS.ANIM.EASING_LINEAR;
    this.onLooped = null;

    this._timesLooped = 0;
    this._needsSort = false;
};

Anim.prototype.forceChangeCallback = function ()
{
    if (this.onChange !== null) this.onChange();
};

/**
 * returns true if animation has ended at @time
 * checks if last key time is < time
 * @param {Number} time
 * @returns {Boolean}
 * @memberof Anim
 * @instance
 * @function
 */
Anim.prototype.hasEnded = function (time)
{
    if (this.keys.length === 0) return true;
    if (this.keys[this.keys.length - 1].time <= time) return true;
    return false;
};

Anim.prototype.isRising = function (time)
{
    if (this.hasEnded(time)) return false;
    const ki = this.getKeyIndex(time);
    if (this.keys[ki].value < this.keys[ki + 1].value) return true;
    return false;
};

/**
 * remove all keys from animation
 * @param {Number} [time=0] set a new key at time with the old value at time
 * @memberof Anim
 * @instance
 * @function
 */
Anim.prototype.clear = function (time)
{
    let v = 0;
    if (time) v = this.getValue(time);
    this.keys.length = 0;

    if (time) this.setValue(time, v);
    if (this.onChange !== null) this.onChange();
};

Anim.prototype.sortKeys = function ()
{
    this.keys.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
    this._needsSort = false;
};

Anim.prototype.getLength = function ()
{
    if (this.keys.length === 0) return 0;
    return this.keys[this.keys.length - 1].time;
};

Anim.prototype.getKeyIndex = function (time)
{
    let index = 0;
    for (let i = 0; i < this.keys.length; i++)
    {
        if (time >= this.keys[i].time) index = i;
        if (this.keys[i].time > time) return index;
    }
    return index;
};

/**
 * set value at time
 * @function setValue
 * @memberof Anim
 * @instance
 * @param {Number} time
 * @param {Number} value
 * @param {Function} [callback] callback
 */
Anim.prototype.setValue = function (time, value, cb)
{
    let found = false;
    for (const i in this.keys)
    {
        if (this.keys[i].time == time)
        {
            found = this.keys[i];
            this.keys[i].setValue(value);
            this.keys[i].cb = cb;
            break;
        }
    }

    if (!found)
    {
        this.keys.push(
            new ANIM.Key({
                time,
                value,
                "e": this.defaultEasing,
                cb,
            }),
        );
    }

    if (this.onChange) this.onChange();
    this._needsSort = true;
};

Anim.prototype.getSerialized = function ()
{
    const obj = {};
    obj.keys = [];
    obj.loop = this.loop;

    for (const i in this.keys)
    {
        obj.keys.push(this.keys[i].getSerialized());
    }

    return obj;
};

Anim.prototype.getKey = function (time)
{
    const index = this.getKeyIndex(time);
    return this.keys[index];
};

Anim.prototype.getNextKey = function (time)
{
    let index = this.getKeyIndex(time) + 1;
    if (index >= this.keys.length) index = this.keys.length - 1;

    return this.keys[index];
};

Anim.prototype.isFinished = function (time)
{
    if (this.keys.length <= 0) return true;
    return time > this.keys[this.keys.length - 1].time;
};

Anim.prototype.isStarted = function (time)
{
    if (this.keys.length <= 0) return false;
    return time >= this.keys[0].time;
};

/**
 * get value at time
 * @function getValue
 * @memberof Anim
 * @instance
 * @param {Number} [time] time
 * @returns {Number} interpolated value at time
 */
Anim.prototype.getValue = function (time)
{
    if (this.keys.length === 0) return 0;
    if (this._needsSort) this.sortKeys();

    if (time < this.keys[0].time) return this.keys[0].value;

    const lastKeyIndex = this.keys.length - 1;
    if (this.loop && time > this.keys[lastKeyIndex].time)
    {
        const currentLoop = time / this.keys[lastKeyIndex].time;
        if (currentLoop > this._timesLooped)
        {
            this._timesLooped++;
            if (this.onLooped) this.onLooped();
        }
        time = (time - this.keys[0].time) % (this.keys[lastKeyIndex].time - this.keys[0].time);
        time += this.keys[0].time;
    }

    const index = this.getKeyIndex(time);
    if (index >= lastKeyIndex)
    {
        if (this.keys[lastKeyIndex].cb && !this.keys[lastKeyIndex].cbTriggered) this.keys[lastKeyIndex].trigger();

        return this.keys[lastKeyIndex].value;
    }
    const index2 = parseInt(index, 10) + 1;
    const key1 = this.keys[index];
    const key2 = this.keys[index2];

    if (key1.cb && !key1.cbTriggered) key1.trigger();

    if (!key2) return -1;

    const perc = (time - key1.time) / (key2.time - key1.time);

    if (!key1.ease) console.log("has no ease", key1, key2);

    return key1.ease(perc, key2);
};

Anim.prototype.addKey = function (k)
{
    if (k.time === undefined)
    {
        Log.log("key time undefined, ignoring!");
    }
    else
    {
        this.keys.push(k);
        if (this.onChange !== null) this.onChange();
    }
};

Anim.prototype.easingFromString = function (str)
{
    if (str == "linear") return CONSTANTS.ANIM.EASING_LINEAR;
    if (str == "absolute") return CONSTANTS.ANIM.EASING_ABSOLUTE;
    if (str == "smoothstep") return CONSTANTS.ANIM.EASING_SMOOTHSTEP;
    if (str == "smootherstep") return CONSTANTS.ANIM.EASING_SMOOTHERSTEP;

    if (str == "Cubic In") return CONSTANTS.ANIM.EASING_CUBIC_IN;
    if (str == "Cubic Out") return CONSTANTS.ANIM.EASING_CUBIC_OUT;
    if (str == "Cubic In Out") return CONSTANTS.ANIM.EASING_CUBIC_INOUT;

    if (str == "Expo In") return CONSTANTS.ANIM.EASING_EXPO_IN;
    if (str == "Expo Out") return CONSTANTS.ANIM.EASING_EXPO_OUT;
    if (str == "Expo In Out") return CONSTANTS.ANIM.EASING_EXPO_INOUT;

    if (str == "Sin In") return CONSTANTS.ANIM.EASING_SIN_IN;
    if (str == "Sin Out") return CONSTANTS.ANIM.EASING_SIN_OUT;
    if (str == "Sin In Out") return CONSTANTS.ANIM.EASING_SIN_INOUT;

    if (str == "Back In") return CONSTANTS.ANIM.EASING_BACK_IN;
    if (str == "Back Out") return CONSTANTS.ANIM.EASING_BACK_OUT;
    if (str == "Back In Out") return CONSTANTS.ANIM.EASING_BACK_INOUT;

    if (str == "Elastic In") return CONSTANTS.ANIM.EASING_ELASTIC_IN;
    if (str == "Elastic Out") return CONSTANTS.ANIM.EASING_ELASTIC_OUT;

    if (str == "Bounce In") return CONSTANTS.ANIM.EASING_BOUNCE_IN;
    if (str == "Bounce Out") return CONSTANTS.ANIM.EASING_BOUNCE_OUT;

    if (str == "Quart Out") return CONSTANTS.ANIM.EASING_QUART_OUT;
    if (str == "Quart In") return CONSTANTS.ANIM.EASING_QUART_IN;
    if (str == "Quart In Out") return CONSTANTS.ANIM.EASING_QUART_INOUT;

    if (str == "Quint Out") return CONSTANTS.ANIM.EASING_QUINT_OUT;
    if (str == "Quint In") return CONSTANTS.ANIM.EASING_QUINT_IN;
    if (str == "Quint In Out") return CONSTANTS.ANIM.EASING_QUINT_INOUT;
};

Anim.prototype.createPort = function (op, title, cb)
{
    const port = op.addInPort(
        new Port(op, title, CONSTANTS.OP.OP_PORT_TYPE_VALUE, {
            "display": "dropdown",
            "values": CONSTANTS.ANIM.EASINGS,
        }),
    );

    port.set("linear");
    port.defaultValue = "linear";

    port.onChange = function ()
    {
        this.defaultEasing = this.easingFromString(port.get());
        if (cb) cb();
    }.bind(this);

    return port;
};

// ------------------------------

Anim.slerpQuaternion = function (time, q, animx, animy, animz, animw)
{
    if (!Anim.slerpQuaternion.q1)
    {
        Anim.slerpQuaternion.q1 = quat.create();
        Anim.slerpQuaternion.q2 = quat.create();
    }

    const i1 = animx.getKeyIndex(time);
    let i2 = i1 + 1;
    if (i2 >= animx.keys.length) i2 = animx.keys.length - 1;

    if (i1 == i2)
    {
        quat.set(q, animx.keys[i1].value, animy.keys[i1].value, animz.keys[i1].value, animw.keys[i1].value);
    }
    else
    {
        const key1Time = animx.keys[i1].time;
        const key2Time = animx.keys[i2].time;
        const perc = (time - key1Time) / (key2Time - key1Time);

        quat.set(Anim.slerpQuaternion.q1, animx.keys[i1].value, animy.keys[i1].value, animz.keys[i1].value, animw.keys[i1].value);

        quat.set(Anim.slerpQuaternion.q2, animx.keys[i2].value, animy.keys[i2].value, animz.keys[i2].value, animw.keys[i2].value);

        quat.slerp(q, Anim.slerpQuaternion.q1, Anim.slerpQuaternion.q2, perc);
    }
    return q;
};

const TL = ANIM;
TL.Anim = Anim;

export { Anim };
export { TL };
