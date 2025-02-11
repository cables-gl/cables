/**
 * extend javascript functionality
 */

/**
 * @namespace Math
 */

/**
     * set random seed for seededRandom()
     * @memberof Math
     * @type Number
     * @static
     */
Math.randomSeed = 1;

Math.setRandomSeed = function (seed)
{
    // https://github.com/cables-gl/cables_docs/issues/622
    Math.randomSeed = seed * 50728129;
    if (seed != 0)
    {
        Math.randomSeed = Math.seededRandom() * 17624813;
        Math.randomSeed = Math.seededRandom() * 9737333;
    }
};

/**
     * generate a seeded random number
     * @function seededRandom
     * @memberof Math
     * @param {Number} max minimum possible random number
     * @param {Number} min maximum possible random number
     * @return {Number} random value
     * @static
     */
Math.seededRandom = function (max, min)
{
    if (Math.randomSeed === 0) Math.randomSeed = Math.random() * 999;
    max = max || 1;
    min = min || 0;

    Math.randomSeed = (Math.randomSeed * 9301 + 49297) % 233280;
    const rnd = Math.randomSeed / 233280.0;

    return min + rnd * (max - min);
};

export default function extendJs()
{

    /**
     * @namespace String
     */

    /**
     * append a linebreak to a string
     * @function endl
     * @memberof String
     * @return {String} string with newline break appended ('\n')
     */
    String.prototype.endl = function ()
    {
        return this + "\n";
    };

    /**
     * return true if string starts with prefix
     * @function startsWith
     * @memberof String
     * @param {String} prefix The prefix to check.
     * @return {Boolean}
     */
    String.prototype.startsWith = function (prefix)
    {
        if (!this || !prefix) return false;
        if (this.length >= prefix.length)
        {
            if (this.substring(0, prefix.length) == prefix) return true;
        }
        return false;
    // return this.indexOf(prefix) === 0;
    };

    /**
     * return true if string ends with suffix
     * @function endsWith
     * @memberof String
     * @param {String} suffix
     * @return {Boolean}
     */
    String.prototype.endsWith = String.prototype.endsWith || function (suffix)
    {
        return this.match(suffix + "$") == suffix;
    };

    /**
     * return true if string contains string
     * @function contains
     * @memberof String
     * @param {String} searchStr
     * @return {Boolean}
     */
    String.prototype.contains = String.prototype.contains || function (searchStr)
    {
        return this.indexOf(searchStr) > -1;
    };

}
