import { Anim } from "./anim.js";

export class AnimKey
{

    /**
     * @param {SerializedKey} obj
     * @param {Anim} [an]
     */
    constructor(obj, an)
    {
        this.id = CABLES.shortId();
        this.time = 0.0;
        this.value = 0.0;
        this.selected = false;

        /** @type {Anim} */
        this.anim = obj.anim || an || null;

        this.onChange = null;
        this._easing = 0;
        // this.bezTangIn = 0;
        // this.bezTangOut = 0;
        // this.bezTime = 0.5;
        // this.bezValue = 0;
        // this.bezTimeIn = -0.5;
        // this.bezValueIn = 0;

        this.cb = null;
        this.cbTriggered = false;
        this.temp = {};
        this.uiAttribs = {};

        // const bezierAnim = null;
        // this._updateBezier = false;

        this.setEasing(Anim.EASING_LINEAR);
        this.set(obj);
    }

    delete()
    {
        if (this.anim) this.anim.remove(this);
        else console.log("animkey without anim...");
    }

    setUiAttribs(o)
    {
        for (const i in o)
        {
            this.uiAttribs[i] = o[i];
            if (o[i] === null) delete this.uiAttribs[i];
        }
        this.anim.emitEvent(Anim.EVENT_CHANGE);
    }

    /**
     * @param {Number} e
     */
    setEasing(e)
    {
        this._easing = e;

        if (this._easing == Anim.EASING_LINEAR) this.ease = AnimKey.easeLinear;
        else if (this._easing == Anim.EASING_ABSOLUTE) this.ease = AnimKey.easeAbsolute;
        else if (this._easing == Anim.EASING_SMOOTHSTEP) this.ease = AnimKey.easeSmoothStep;
        else if (this._easing == Anim.EASING_SMOOTHERSTEP) this.ease = AnimKey.easeSmootherStep;
        else if (this._easing == Anim.EASING_CUBIC_IN) this.ease = AnimKey.easeCubicIn;
        else if (this._easing == Anim.EASING_CUBIC_OUT) this.ease = AnimKey.easeCubicOut;
        else if (this._easing == Anim.EASING_CUBIC_INOUT) this.ease = AnimKey.easeCubicInOut;
        else if (this._easing == Anim.EASING_EXPO_IN) this.ease = AnimKey.easeExpoIn;
        else if (this._easing == Anim.EASING_EXPO_OUT) this.ease = AnimKey.easeExpoOut;
        else if (this._easing == Anim.EASING_EXPO_INOUT) this.ease = AnimKey.easeExpoInOut;
        else if (this._easing == Anim.EASING_SIN_IN) this.ease = AnimKey.easeSinIn;
        else if (this._easing == Anim.EASING_SIN_OUT) this.ease = AnimKey.easeSinOut;
        else if (this._easing == Anim.EASING_SIN_INOUT) this.ease = AnimKey.easeSinInOut;
        else if (this._easing == Anim.EASING_BACK_OUT) this.ease = AnimKey.easeOutBack;
        else if (this._easing == Anim.EASING_BACK_IN) this.ease = AnimKey.easeInBack;
        else if (this._easing == Anim.EASING_BACK_INOUT) this.ease = AnimKey.easeInOutBack;
        else if (this._easing == Anim.EASING_ELASTIC_IN) this.ease = AnimKey.easeInElastic;
        else if (this._easing == Anim.EASING_ELASTIC_OUT) this.ease = AnimKey.easeOutElastic;
        // else if (this._easing == Anim.EASING_ELASTIC_INOUT) this.ease = AnimKey.easeElasticInOut;
        else if (this._easing == Anim.EASING_BOUNCE_IN) this.ease = AnimKey.easeInBounce;
        else if (this._easing == Anim.EASING_BOUNCE_OUT) this.ease = AnimKey.easeOutBounce;
        else if (this._easing == Anim.EASING_QUART_OUT) this.ease = AnimKey.easeOutQuart;
        else if (this._easing == Anim.EASING_QUART_IN) this.ease = AnimKey.easeInQuart;
        else if (this._easing == Anim.EASING_QUART_INOUT) this.ease = AnimKey.easeInOutQuart;
        else if (this._easing == Anim.EASING_QUINT_OUT) this.ease = AnimKey.easeOutQuint;
        else if (this._easing == Anim.EASING_QUINT_IN) this.ease = AnimKey.easeInQuint;
        else if (this._easing == Anim.EASING_QUINT_INOUT) this.ease = AnimKey.easeInOutQuint;
        else if (this._easing == Anim.EASING_CUBICSPLINE)
        {
            // this._updateBezier = true;
            this.ease = AnimKey.easeCubicSpline;
        }
        else
        {
            this._easing = Anim.EASING_LINEAR;
            this.ease = AnimKey.easeLinear;
        }
        this.anim.forceChangeCallbackSoon();
    }

    trigger()
    {
        this.cb();
        this.cbTriggered = true;
    }

    /**
     * @param {number} v
     */
    setValue(v)
    {
        this.value = v;
        if (this.onChange !== null) this.onChange();
        this.anim.forceChangeCallbackSoon();
    }

    /**
     * @param {SerializedKey} obj
     */
    set(obj)
    {
        if (obj)
        {
            if (obj.hasOwnProperty("e")) this.setEasing(obj.e);
            if (obj.cb)
            {
                this.cb = obj.cb;
                this.cbTriggered = false;
            }

            if (obj.b)
            {
                // this.bezTime = obj.b[0];
                // this.bezValue = obj.b[1];
                // this.bezTimeIn = obj.b[2];
                // this.bezValueIn = obj.b[3];
                // this._updateBezier = true;
            }

            if (obj.hasOwnProperty("t")) this.time = obj.t;
            if (obj.hasOwnProperty("time")) this.time = obj.time;
            if (obj.hasOwnProperty("v")) this.value = obj.v;
            else if (obj.hasOwnProperty("value")) this.value = obj.value;

            if (obj.hasOwnProperty("uiAttribs")) this.setUiAttribs(obj.uiAttribs);
        }
        if (this.onChange) this.onChange();
        this.anim.forceChangeCallbackSoon();
    }

    /**
   * @returns {Object}
   */
    getSerialized()
    {
        const obj = {};
        obj.t = this.time;
        obj.v = this.value;
        obj.e = this._easing;
        obj.uiAttribs = this.uiAttribs;

        return obj;
    }

    getEasing()
    {
        return this._easing;
    }
}

AnimKey.cubicSpline = function (perc, key1, key2)
{
    let
        previousPoint = key1.value,
        previousTangent = key1.bezTangOut,
        nextPoint = key2.value,
        nextTangent = key2.bezTangIn;
    let t = perc;
    let t2 = t * t;
    let t3 = t2 * t;

    return (2 * t3 - 3 * t2 + 1) * previousPoint + (t3 - 2 * t2 + t) * previousTangent + (-2 * t3 + 3 * t2) * nextPoint + (t3 - t2) * nextTangent;
};

AnimKey.easeCubicSpline = function (perc, key2)
{
    return AnimKey.cubicSpline(perc, this, key2);
};

AnimKey.linear = function (perc, key1, key2)
{
    return parseFloat(key1.value) + parseFloat(key2.value - key1.value) * perc;
};

AnimKey.easeLinear = function (perc, key2)
{
    return AnimKey.linear(perc, this, key2);
};

AnimKey.easeAbsolute = function (perc, key2)
{
    return this.value;
};

export const easeExpoIn = function (t)
{
    return (t = 2 ** (10 * (t - 1)));
};

AnimKey.easeExpoIn = function (t, key2)
{
    t = easeExpoIn(t);
    return AnimKey.linear(t, this, key2);
};

export const easeExpoOut = function (t)
{
    t = -(2 ** (-10 * t)) + 1;
    return t;
};

AnimKey.easeExpoOut = function (t, key2)
{
    t = easeExpoOut(t);
    return AnimKey.linear(t, this, key2);
};

export const easeExpoInOut = function (t)
{
    t *= 2;
    if (t < 1)
    {
        t = 0.5 * 2 ** (10 * (t - 1));
    }
    else
    {
        t--;
        t = 0.5 * (-(2 ** (-10 * t)) + 2);
    }
    return t;
};

AnimKey.easeExpoInOut = function (t, key2)
{
    t = easeExpoInOut(t);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeSinIn = function (t, key2)
{
    t = -1 * Math.cos((t * Math.PI) / 2) + 1;
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeSinOut = function (t, key2)
{
    t = Math.sin((t * Math.PI) / 2);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeSinInOut = function (t, key2)
{
    t = -0.5 * (Math.cos(Math.PI * t) - 1.0);
    return AnimKey.linear(t, this, key2);
};

export const easeCubicIn = function (t)
{
    t = t * t * t;
    return t;
};

AnimKey.easeCubicIn = function (t, key2)
{
    t = easeCubicIn(t);
    return AnimKey.linear(t, this, key2);
};

// b 0
// c 1/2 or 1
// d always 1
// easeOutCubic: function (x, t, b, c, d) {
//     return c*((t=t/d-1)*t*t + 1) + b;

AnimKey.easeInQuint = function (t, key2)
{
    t = t * t * t * t * t;
    return AnimKey.linear(t, this, key2);
};
AnimKey.easeOutQuint = function (t, key2)
{
    t = (t -= 1) * t * t * t * t + 1;
    return AnimKey.linear(t, this, key2);
};
AnimKey.easeInOutQuint = function (t, key2)
{
    if ((t /= 0.5) < 1) t = 0.5 * t * t * t * t * t;
    else t = 0.5 * ((t -= 2) * t * t * t * t + 2);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeInQuart = function (t, key2)
{
    t = t * t * t * t;
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeOutQuart = function (t, key2)
{
    // return -c * ((t=t/d-1)*t*t*t - 1) + b;
    t = -1 * ((t -= 1) * t * t * t - 1);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeInOutQuart = function (t, key2)
{
    if ((t /= 0.5) < 1) t = 0.5 * t * t * t * t;
    else t = -0.5 * ((t -= 2) * t * t * t - 2);
    return AnimKey.linear(t, this, key2);
};

AnimKey.bounce = function (t)
{
    if ((t /= 1) < 1 / 2.75) t = 7.5625 * t * t;
    else if (t < 2 / 2.75) t = 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    else if (t < 2.5 / 2.75) t = 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    else t = 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    return t;
};

AnimKey.easeInBounce = function (t, key2)
{
    return AnimKey.linear(AnimKey.bounce(t), this, key2);
    // return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d);
};

AnimKey.easeOutBounce = function (t, key2)
{
    return AnimKey.linear(AnimKey.bounce(t), this, key2);
};

AnimKey.easeInElastic = function (t, key2)
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
        t = -(a * 2 ** (10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b;
    }

    return AnimKey.linear(t, this, key2);
};

AnimKey.easeOutElastic = function (t, key2)
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
        t = a * 2 ** (-10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) + c + b;
    }

    return AnimKey.linear(t, this, key2);
};

AnimKey.easeInBack = function (t, key2)
{
    const s = 1.70158;
    t = t * t * ((s + 1) * t - s);

    return AnimKey.linear(t, this, key2);
};

AnimKey.easeOutBack = function (t, key2)
{
    const s = 1.70158;
    t = (t = t / 1 - 1) * t * ((s + 1) * t + s) + 1;

    return AnimKey.linear(t, this, key2);
};

AnimKey.easeInOutBack = function (t, key2)
{
    let s = 1.70158;
    const c = 1 / 2;
    if ((t /= 1 / 2) < 1) t = c * (t * t * (((s *= 1.525) + 1) * t - s));
    else t = c * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);

    return AnimKey.linear(t, this, key2);
};

export const easeCubicOut = function (t)
{
    t--;
    t = t * t * t + 1;
    return t;
};

AnimKey.easeCubicOut = function (t, key2)
{
    t = easeCubicOut(t);
    return AnimKey.linear(t, this, key2);
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

AnimKey.easeCubicInOut = function (t, key2)
{
    t = easeCubicInOut(t);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeSmoothStep = function (perc, key2)
{
    // var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    const x = Math.max(0, Math.min(1, perc));
    perc = x * x * (3 - 2 * x); // smoothstep
    return AnimKey.linear(perc, this, key2);
};

AnimKey.easeSmootherStep = function (perc, key2)
{
    const x = Math.max(0, Math.min(1, (perc - 0) / (1 - 0)));
    perc = x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
    return AnimKey.linear(perc, this, key2);
};
