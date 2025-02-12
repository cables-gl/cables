/**
 * extend javascript functionality
 */

/**
 * @external Math
 */

/**
 * set random seed for seededRandom()
 * @type Number
 * @static
 */
Math.randomSeed = 1;

/**
 * @function external:Math#setRandomSeed
 * @param {number} seed
 */
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

/**
     * @namespace String
     */

/**
 * append a linebreak to a string
 * @function endl
 * @extends String
 * @return {String} string with newline break appended ('\n')
 */
String.prototype.endl = function ()
{
    return this + "\n";
};

String.prototype.contains = function (str)
{
    console.warn("string.contains deprecated, use string.includes");
    console.log((new Error()).stack);
    return this.includes(str);

};

export default function extendJs()
{

}
