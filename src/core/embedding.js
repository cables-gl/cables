import Patch from "./core_patch";
import { generateUUID } from "./utils";

const EMBED = {};

/**
 * add patch into html element (will create canvas and set size to fill containerElement)
 * @name CABLES.EMBED#addPatch
 * @param {object|string} containerElement dom element or id of element
 * @param {options} patch options
 * @function
 */
EMBED.addPatch = function (_element, options)
{
    var el = _element;
    var id = generateUUID();
    if (typeof _element == "string")
    {
        id = _element;
        el = document.getElementById(id);

        if (!el)
        {
            console.error(`${id} Polyshape Container Element not found!`);
            return;
        }
    }

    var canvEl = document.createElement("canvas");
    canvEl.id = `glcanvas_${id}`;
    canvEl.width = el.clientWidth;
    canvEl.height = el.clientHeight;

    window.addEventListener(
        "resize",
        function ()
        {
            this.setAttribute("width", el.clientWidth);
            this.height = el.clientHeight;
        }.bind(canvEl),
    );

    el.appendChild(canvEl);

    options = options || {};
    options.glCanvasId = canvEl.id;

    if (!options.onError)
    {
        options.onError = function (err)
        {
            console.log(err);
        };
    }

    CABLES.patch = new Patch(options);
    return canvEl;
};

export { EMBED };
