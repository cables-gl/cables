
/**
 * @type {Object}
 * @name Variable
 * @param {String} name
 * @param {String|Number} value
 * @memberof Patch
 * @constructor
 */
class PatchVariable
{
    constructor(name, val, type)
    {
        this._name = name;
        this._changeListeners = [];
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
        for (let i = 0; i < this._changeListeners.length; i++)
        {
            this._changeListeners[i](v, this);
        }
    }

    /**
   * function will be called when value of variable is changed
   * @function addListener
   * @memberof Variable
   * @instance
   * @param {Function} callback
   */
    addListener(cb)
    {
        const ind = this._changeListeners.indexOf(cb);
        if (ind == -1) this._changeListeners.push(cb);
    }

    /**
   * remove listener
   * @function removeListener
   * @memberof Variable
   * @instance
   * @param {Function} callback
   */
    removeListener(cb)
    {
        const ind = this._changeListeners.indexOf(cb);
        this._changeListeners.splice(ind, 1);
    }
}

export default PatchVariable;
