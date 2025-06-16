/**
 * @typedef keyUiAttribs
 * @property  {string} text
 */
/**
 * @typedef SerializedAnim
 * @property  {number} loop
 * @property  {boolean} tlActive
 * @property  {SerializedKey[]} keys
 */
/**
 * @typedef SerializedKey
 * @property  {number} [v]
 * @property  {number} [t]
 * @property  {number} [e]
 * @property  {keyUiAttribs} [uiAttribs]
 * @property  {Function} [cb]
 * @property  {import("./anim.js").Anim} [anim] do not use
 * @property  {number} [value] do not use
 * @property  {number} [time] do not use
 * @property  {number[]} [cp1]
 * @property  {number[]} [cp2]
 */

/**
 * configuration object for loading a patch
 * @typedef AnimCfg
 * @property {number} [defaultEasing] use easing index as default
 * @property {string} [name] anim name
 */
