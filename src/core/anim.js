import { Events, Logger } from "cables-shared-client";
import { uuid } from "./utils.js";
import { AnimKey } from "./anim_key.js";
import { Op } from "./core_op.js";
import { Port } from "./core_port.js";

/**
 * Keyframed interpolated animation.
 *
 * @class
 * @param cfg
 * @example
 * var anim=new CABLES.Anim();
 * anim.setValue(0,0);  // set value 0 at 0 seconds
 * anim.setValue(10,1); // set value 1 at 10 seconds
 * anim.getValue(5);    // get value at 5 seconds - this returns 0.5
 */

export class Anim extends Events
{
    static EVENT_KEY_DELETE = "keyDelete";
    static EVENT_CHANGE = "onChange";
    static EVENT_UIATTRIB_CHANGE = "uiattrchange";

    static LOOP_OFF = 0;
    static LOOP_REPEAT = 1;
    static LOOP_MIRROR = 2;
    static LOOP_OFFSET = 3;

    static EASING_LINEAR = 0;
    static EASING_ABSOLUTE = 1;
    static EASING_SMOOTHSTEP = 2;
    static EASING_SMOOTHERSTEP = 3;
    static EASING_CUBICSPLINE = 4;

    static EASING_CUBIC_IN = 5;
    static EASING_CUBIC_OUT = 6;
    static EASING_CUBIC_INOUT = 7;

    static EASING_EXPO_IN = 8;
    static EASING_EXPO_OUT = 9;
    static EASING_EXPO_INOUT = 10;

    static EASING_SIN_IN = 11;
    static EASING_SIN_OUT = 12;
    static EASING_SIN_INOUT = 13;

    static EASING_BACK_IN = 14;
    static EASING_BACK_OUT = 15;
    static EASING_BACK_INOUT = 16;

    static EASING_ELASTIC_IN = 17;
    static EASING_ELASTIC_OUT = 18;

    static EASING_BOUNCE_IN = 19;
    static EASING_BOUNCE_OUT = 21;

    static EASING_QUART_IN = 22;
    static EASING_QUART_OUT = 23;
    static EASING_QUART_INOUT = 24;

    static EASING_QUINT_IN = 25;
    static EASING_QUINT_OUT = 26;
    static EASING_QUINT_INOUT = 27;

    static EASINGNAMES = ["linear", "absolute", "smoothstep", "smootherstep", "Cubic In", "Cubic Out", "Cubic In Out", "Expo In", "Expo Out", "Expo In Out", "Sin In", "Sin Out", "Sin In Out", "Quart In", "Quart Out", "Quart In Out", "Quint In", "Quint Out", "Quint In Out", "Back In", "Back Out", "Back In Out", "Elastic In", "Elastic Out", "Bounce In", "Bounce Out"];

    #tlActive = true;
    uiAttribs = {};

    /**
     * @param {AnimCfg} [cfg]
     */
    constructor(cfg = {})
    {
        super();
        cfg = cfg || {};
        this.id = uuid();

        /** @type {AnimKey[]} */
        this.keys = [];
        this.onChange = null;
        this.stayInTimeline = false;

        this.loop = 0;
        this._log = new Logger("Anim");
        this._lastKeyIndex = 0;
        this._cachedIndex = 0;
        this.name = cfg.name || null;

        /** @type {Number} */
        this.defaultEasing = cfg.defaultEasing || Anim.EASING_LINEAR;
        this.onLooped = null;

        this._timesLooped = 0;
        this._needsSort = false;
    }

    forceChangeCallback()
    {
        if (this.onChange !== null) this.onChange();
        this.emitEvent(Anim.EVENT_CHANGE, this);
    }

    forceChangeCallbackSoon()
    {
        // clearTimeout(this.forcecbto);
        if (!this.forcecbto)
            this.forcecbto = setTimeout(() =>
            {
                this.forceChangeCallback();
                this.forcecbto = null;
            },
            50);
    }

    getLoop()
    {
        return this.loop;
    }

    /**
     * @param {number} loopType
     */
    setLoop(loopType)
    {
        if (loopType === false)loopType = 0;
        if (loopType === true)loopType = 1;

        this.loop = loopType;
        this.emitEvent(Anim.EVENT_CHANGE, this);
    }

    /**
     * returns true if animation has ended at @time
     * checks if last key time is < time
     * @param {Number} time
     * @returns {Boolean}
     * @memberof Anim
     * @instance
     * @function
     */
    hasEnded(time)
    {
        if (this.keys.length === 0) return true;
        if (this.keys[this._lastKeyIndex].time <= time) return true;
        return false;
    }

    /**
     * @param {number} time
     */
    isRising(time)
    {
        if (this.hasEnded(time)) return false;
        const ki = this.getKeyIndex(time);
        if (this.keys[ki].value < this.keys[ki + 1].value) return true;
        return false;
    }

    /**
     * remove all keys from animation before time
     * @param {Number} time
     * @memberof Anim
     * @instance
     * @function
     */
    clearBefore(time)
    {
        const v = this.getValue(time);
        const ki = this.getKeyIndex(time);

        this.setValue(time, v);

        if (ki > 1) this.keys.splice(0, ki);
        this._updateLastIndex();
    }

    /**
     * remove all keys from animation
     * @param {Number} [time=0] set a new key at time with the old value at time
     * @memberof Anim
     * @instance
     * @function
     */
    clear(time)
    {
        let v = 0;
        if (time) v = this.getValue(time);

        for (let i = 0; i < this.keys.length; i++)
            this.emitEvent(Anim.EVENT_KEY_DELETE, this.keys[i]);

        this.keys.length = 0;
        this._updateLastIndex();
        if (time) this.setValue(time, v);
        if (this.onChange !== null) this.onChange();
        this.emitEvent(Anim.EVENT_CHANGE, this);
    }

    sortKeys()
    {
        let isSorted = true;
        for (let i = 0; i < this.keys.length - 1; i++)
            if (this.keys[i].time < this.keys[i + 1].time)
            {
                isSorted = false;
                break;
            }

        if (!isSorted)
        {
            this.keys.sort((a, b) => { return a.time - b.time; });
            this._updateLastIndex();
            this._needsSort = false;
            if (this.keys.length > 999 && this.keys.length % 1000 == 0)console.log(this.name, this.keys.length);

            this.emitEvent(Anim.EVENT_CHANGE);
        }
        return !isSorted;
    }

    hasDuplicates()
    {
        const test = {};
        let count = 0;
        for (let i = 0; i < this.keys.length; i++)
        {
            test[this.keys[i].time] = 1;
            count++;
        }

        const keys = Object.keys(test);
        if (keys.length != count)
        {
            return true;
        }
        return false;
    }

    removeDuplicates()
    {
        if (this.hasDuplicates())
        {
            this.sortKeys();
            let count = 0;

            while (this.hasDuplicates())
            {
                for (let i = 0; i < this.keys.length - 1; i++)
                {
                    if (this.keys[i].time == this.keys[i + 1].time) this.keys.splice(i, 1);
                    count++;
                }
            }
            this._updateLastIndex();
        }
    }

    getLengthLoop()
    {
        if (this.keys.length < 2) return 0;
        return this.lastKey.time - this.firstKey.time;
    }

    getLength()
    {
        if (this.keys.length === 0) return 0;
        return this.lastKey.time;
    }

    /**
     * @param {number} time
     */
    getKeyIndex(time)
    {
        let index = 0;
        let start = 0;
        if (this._cachedIndex && this.keys.length > this._cachedIndex && time >= this.keys[this._cachedIndex].time) start = this._cachedIndex;
        for (let i = start; i < this.keys.length; i++)
        {
            if (time >= this.keys[i].time) index = i;
            if (this.keys[i].time > time)
            {
                if (time != 0) this._cachedIndex = index;
                return index;
            }
        }

        return index;
    }

    /**
     * set value at time
     * @function setValue
     * @memberof Anim
     * @instance
     * @param {Number} time
     * @param {Number} value
     * @param {Function} cb callback
     */
    setValue(time, value, cb = null)
    {
        let found = null;

        if (this.keys.length == 0 || time <= this.lastKey.time)
            for (let i = 0; i < this.keys.length; i++)
                if (this.keys[i].time == time)
                {
                    found = this.keys[i];
                    this.keys[i].setValue(value);
                    this.keys[i].cb = cb;
                    break;
                }

        if (!found)
        {
            found = new AnimKey(
                {
                    "time": time,
                    "value": value,
                    "e": this.defaultEasing,
                    "cb": cb,
                    "anim": this
                });
            this.keys.push(found);

            // if (this.keys.length % 1000 == 0)console.log(this.name, this.keys.length);
            this._updateLastIndex();
        }

        if (this.onChange) this.onChange();
        this.emitEvent(Anim.EVENT_CHANGE, this);
        this._needsSort = true;
        return found;
    }

    /**
     * @param {number} index
     * @param {number} easing
     */
    setKeyEasing(index, easing)
    {
        if (this.keys[index])
        {
            this.keys[index].setEasing(easing);
            this.emitEvent(Anim.EVENT_CHANGE, this);
        }
    }

    /**
     * @param {object} obj
     */
    deserialize(obj)
    {

        if (obj.loop) this.loop = obj.loop;
        if (obj.tlActive) this.#tlActive = obj.tlActive;
        for (const ani in obj.keys)
        {
            this.keys.push(new AnimKey(obj.keys[ani], this));
        }
    }

    /**
     * @returns {SerializedAnim}
     */
    getSerialized()
    {

        /** @type {SerializedAnim} */
        const obj = {};
        obj.keys = [];
        obj.loop = this.loop;
        if (this.#tlActive)obj.tlActive = this.tlActive;

        for (let i = 0; i < this.keys.length; i++)
            obj.keys.push(this.keys[i].getSerialized());

        return obj;
    }

    /**
     * @param {number} time
     */
    getKey(time)
    {
        const index = this.getKeyIndex(time);
        return this.keys[index];
    }

    /**
     * @param {number} time
     */
    getNextKey(time)
    {
        let index = this.getKeyIndex(time) + 1;
        if (index >= this.keys.length) return null;

        return this.keys[index];
    }

    /**
     * @param {number} time
     */
    getPrevKey(time)
    {
        let index = this.getKeyIndex(time) - 1;
        if (index < 0) return null;

        return this.keys[index];
    }

    /**
     * @param {number} time
     */
    isFinished(time)
    {
        if (this.keys.length <= 0) return true;
        return time > this.lastKey.time;
    }

    /**
     * @param {number} time
     */
    isStarted(time)
    {
        if (this.keys.length <= 0) return false;
        return time >= this.firstKey.time;
    }

    /**
     * @param {AnimKey} k
     */
    remove(k, events)
    {
        for (let i = 0; i < this.keys.length; i++)
        {
            if (this.keys[i] == k)
            {
                this.emitEvent(Anim.EVENT_KEY_DELETE, this.keys[i]);
                this.keys.splice(i, 1);
                if (events === undefined)
                {
                    this._updateLastIndex();
                    this.emitEvent(Anim.EVENT_CHANGE, this);
                }
                return;
            }
        }
        console.log("key remove not found", k);
    }

    get lastKey()
    {
        return this.keys[this._lastKeyIndex];
    }

    get firstKey()
    {
        return this.keys[0];
    }

    /**
     * @param {number} time
     */
    getLoopIndex(time)
    {
        if (this.keys.length < 2) return 0;
        return (time - this.firstKey.time) / this.getLengthLoop();
    }

    /**
     * get value at time
     * @function getValue
     * @memberof Anim
     * @instance
     * @param {Number} [time] time
     * @returns {Number} interpolated value at time
     */
    getValue(time)
    {
        let valAdd = 0;
        if (this.keys.length === 0) return 0;
        if (this._needsSort) this.sortKeys();

        if (!this.loop && time > this.keys[this._lastKeyIndex].time)
        {
            if (this.lastKey.cb && !this.lastKey.cbTriggered) this.lastKey.trigger();

            return this.lastKey.value;
        }

        if (time < this.firstKey.time) return this.keys[0].value;

        if (this.loop && this.keys.length > 1 && time > this.lastKey.time)
        {
            const currentLoop = this.getLoopIndex(time);
            if (currentLoop > this._timesLooped)
            {
                this._timesLooped++;
                if (this.onLooped) this.onLooped();
            }

            time = (time - this.firstKey.time) % (this.getLengthLoop());

            if (this.loop == Anim.LOOP_REPEAT) { }
            else if (this.loop == Anim.LOOP_MIRROR)
            {
                if (Math.floor(currentLoop) % 2 == 1)time = this.getLengthLoop() - time;
            }
            else if (this.loop == Anim.LOOP_OFFSET)
            {
                valAdd = (this.lastKey.value - this.keys[0].value) * Math.floor(currentLoop);
            }

            time += this.firstKey.time;
        }

        const index = this.getKeyIndex(time);
        if (index >= this._lastKeyIndex)
        {
            if (this.lastKey.cb && !this.lastKey.cbTriggered) this.lastKey.trigger();
            return this.lastKey.value;
        }

        const index2 = index + 1;
        const key1 = this.keys[index];
        const key2 = this.keys[index2];

        if (key1.cb && !key1.cbTriggered) key1.trigger();

        if (!key2) return -1;

        const perc = (time - key1.time) / (key2.time - key1.time);

        return key1.ease(perc, key2) + valAdd;
    }

    _updateLastIndex()
    {
        this._lastKeyIndex = this.keys.length - 1;
    }

    /**
     * @param {AnimKey} k
     */
    addKey(k)
    {
        if (k.time === undefined)
        {
            this._log.warn("key time undefined, ignoring!");
        }
        else
        {
            this.keys.push(k);
            if (this.onChange !== null) this.onChange();
            this.emitEvent(Anim.EVENT_CHANGE, this);
            this._needsSort = true;
        }
        this._updateLastIndex();
    }

    sortSoon()
    {
        this._needsSort = true;
    }

    /**
     * @param {string} str
     */
    easingFromString(str)
    {
        // todo smarter way to map ?
        if (str == "linear") return Anim.EASING_LINEAR;
        if (str == "absolute") return Anim.EASING_ABSOLUTE;
        if (str == "smoothstep") return Anim.EASING_SMOOTHSTEP;
        if (str == "smootherstep") return Anim.EASING_SMOOTHERSTEP;

        if (str == "Cubic In") return Anim.EASING_CUBIC_IN;
        if (str == "Cubic Out") return Anim.EASING_CUBIC_OUT;
        if (str == "Cubic In Out") return Anim.EASING_CUBIC_INOUT;

        if (str == "Expo In") return Anim.EASING_EXPO_IN;
        if (str == "Expo Out") return Anim.EASING_EXPO_OUT;
        if (str == "Expo In Out") return Anim.EASING_EXPO_INOUT;

        if (str == "Sin In") return Anim.EASING_SIN_IN;
        if (str == "Sin Out") return Anim.EASING_SIN_OUT;
        if (str == "Sin In Out") return Anim.EASING_SIN_INOUT;

        if (str == "Back In") return Anim.EASING_BACK_IN;
        if (str == "Back Out") return Anim.EASING_BACK_OUT;
        if (str == "Back In Out") return Anim.EASING_BACK_INOUT;

        if (str == "Elastic In") return Anim.EASING_ELASTIC_IN;
        if (str == "Elastic Out") return Anim.EASING_ELASTIC_OUT;

        if (str == "Bounce In") return Anim.EASING_BOUNCE_IN;
        if (str == "Bounce Out") return Anim.EASING_BOUNCE_OUT;

        if (str == "Quart Out") return Anim.EASING_QUART_OUT;
        if (str == "Quart In") return Anim.EASING_QUART_IN;
        if (str == "Quart In Out") return Anim.EASING_QUART_INOUT;

        if (str == "Quint Out") return Anim.EASING_QUINT_OUT;
        if (str == "Quint In") return Anim.EASING_QUINT_IN;
        if (str == "Quint In Out") return Anim.EASING_QUINT_INOUT;

        console.log("unknown anim easing?", str);
    }

    /**
     * @param {Op} op
     * @param {string} title
     * @param {function} cb
     * @returns {Port}
     */
    createPort(op, title, cb)
    {
        const port = op.inDropDown(title, Anim.EASINGNAMES, "linear");
        port.set("linear");
        port.defaultValue = "linear";

        port.onChange = () =>
        {
            this.defaultEasing = this.easingFromString(port.get());
            this.emitEvent("onChangeDefaultEasing", this);

            if (cb) cb();
        };

        return port;
    }

    get tlActive()
    {
        return this.#tlActive;
    }

    set tlActive(b)
    {
        if (CABLES.UI)
        {
            this.#tlActive = b;
            window.gui.emitEvent("tlActiveChanged", this);
            this.forceChangeCallbackSoon();
        }
    }

    /**
     * @param {Object} o
     */
    setUiAttribs(o)
    {
        for (const i in o)
        {
            this.uiAttribs[i] = o[i];
            if (o[i] === null) delete this.uiAttribs[i];
        }

        this.emitEvent(Anim.EVENT_UIATTRIB_CHANGE);
    }

    /**
     * @param {number} t
     * @param {number} t2
     */
    hasKeyframesBetween(t, t2)
    {
        return this.getKeyIndex(t) != this.getKeyIndex(t2);
    }
}

// ------------------------------
