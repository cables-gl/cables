import { EventTarget } from "./eventtarget";

/**
 * @type {Object}
 * @name Variable
 * @param {String} name
 * @param {String|Number} value
 * @memberof Patch
 * @constructor
 */
class PatchVariable extends EventTarget
{
    constructor(name, val, type)
    {
        super();
        this._name = name;
        this.type = type;
        this.setValue(val);
    }


    /**
     * @function Variable.getValue
     * @memberof Variable
     * @returns {String|Number|Boolean}
     */

    getValue()
    {
        return this._v;
    }

    /**
     * @function getName
     * @memberof Variable
     * @instance
     * @returns {String|Number|Boolean}
     * @function
     */
    getName()
    {
        return this._name;
    }

    /**
     * @function setValue
     * @memberof Variable
     * @instance
     * @returns {String|Number|Boolean}
     * @function
     */
    setValue(v)
    {
        this._v = v;
        this.emitEvent("change", v, this);
    }

    /**
     * function will be called when value of variable is changed
     * @function addListener
     * @memberof Variable
     * @instance
     * @param {Function} cb
     * @return {string} id
     */
    addListener(cb)
    {
        return this.on("change", cb, "var");
    }

    /**
     * remove listener
     * @function removeListener
     * @memberof Variable
     * @instance
     * @param {string} id
     */
    removeListener(id)
    {
        this.off(id);
    }
}

export default PatchVariable;
