import { Events } from "cables-shared-client";
import { simpleId } from "../utils.js";
import { Port } from "../core_port.js";

/**
 * @typedef ShaderModule
 * @property {String} title
 * @property {Number} id
 * @property {Number} numId
 * @property {String} group
 * @property {String} prefix
 * @property {Number} priority
 * @property {String} srcBodyFrag
 * @property {String} srcBodyVert
 */

class CgShader extends Events
{
    id = simpleId();
    _isValid = true;

    // this._defines.push([name, value]);

    /** @type {Array<Array<String>>} */
    _defines = [];

    /** @type {Array<String>} */
    _moduleNames = [];

    _moduleNumId = 0;
    _needsRecompile = true;
    _compileReason = "initial";

    /** @type {Array<ShaderModule>} */
    _modules = [];

    _compileCount = 0;

    logError = true;
    num = -1;

    constructor()
    {
        super();
    }

    /**
     * @param {string} reason
     */
    setWhyCompile(reason)
    {
        this._compileReason = reason;
        this._needsRecompile = true;
    }

    getWhyCompile()
    {
        return this._compileReason;
    }

    needsRecompile()
    {
        return this._needsRecompile;
    }

    /**
     * easily enable/disable a define without a value
     * @param {String} name
     * @param {Port} enabled value or port
     */
    toggleDefine(name, enabled)
    {
        if (enabled && typeof (enabled) == "object" && enabled.addEventListener) // port
        {
            if (enabled.changeListener)enabled.off(enabled.changeListener);

            enabled.onToggleDefine = (v) =>
            {
                this.toggleDefine(name, v);
            };

            enabled.changeListener = enabled.on("change", enabled.onToggleDefine);
            enabled = enabled.get();
        }

        if (enabled) this.define(name);
        else this.removeDefine(name);
    }

    /**
     * add a define to a shader, e.g.  #define DO_THIS_THAT 1
     * @param {String} name
     * @param {any} value (can be empty)
     */
    define(name, value = "")
    {
        if (value === null || value === undefined) value = "";

        if (typeof (value) == "object") // port
        {
            value.removeEventListener("change", value.onDefineChange);
            value.onDefineChange = (v) =>
            {
                this.define(name, v);
            };
            value.on("change", value.onDefineChange);

            value = value.get();
        }

        for (let i = 0; i < this._defines.length; i++)
        {
            if (this._defines[i][0] == name && this._defines[i][1] == value) return;
            if (this._defines[i][0] == name)
            {
                this._defines[i][1] = value;
                this.setWhyCompile("define " + name + " " + value);
                return;
            }
        }
        this.setWhyCompile("define " + name + " " + value);

        this._defines.push([name, value]);
    }

    getDefines()
    {
        return this._defines;
    }

    /**
     * @param {string} name
     */
    getDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
            if (this._defines[i][0] == name) return this._defines[i][1];
        return null;
    }

    /**
     * return true if shader has define
     * @function hasDefine
     * @memberof Shader
     * @instance
     * @param {String} name
     * @return {Boolean}
     */
    hasDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
            if (this._defines[i][0] == name) return true;
    }

    /**
     * remove a define from a shader
     * @param {string} name
     */
    removeDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
        {
            if (this._defines[i][0] == name)
            {
                this._defines.splice(i, 1);

                this.setWhyCompile("define removed:" + name);

                return;
            }
        }
    }

    /**
     * @param {any} modId
     */
    hasModule(modId)
    {
        for (let i = 0; i < this._modules.length; i++)
            if (this._modules[i].id == modId) return true;

        return false;
    }

    /**
     *
     * @param {Array<String>} names
     */
    setModules(names)
    {
        this._moduleNames = names;
    }

    /**
     * remove a module from shader
     * @param {ShaderModule} mod the module to be removed
     */
    removeModule(mod)
    {
        for (let i = 0; i < this._modules.length; i++)
        {
            if (mod && mod.id)
            {
                if (this._modules[i].id == mod.id || !this._modules[i])
                {
                    let found = true;
                    while (found)
                    {
                        found = false;
                        for (let j = 0; j < this._uniforms.length; j++)
                        {
                            if (this._uniforms[j].getName().startsWith(mod.prefix))
                            {
                                this._uniforms.splice(j, 1);
                                found = true;
                                continue;
                            }
                        }
                    }

                    this.setWhyCompile("remove module " + mod.title);
                    this._modules.splice(i, 1);
                    break;
                }
            }
        }
    }

    getNumModules()
    {
        return this._modules.length;
    }

    getCurrentModules() { return this._modules; }

    /**
     * add a module
     * @param {ShaderModule} mod the module to be added
     * @param {ShaderModule} [sibling] sibling module, new module will share the same group
     */
    addModule(mod, sibling)
    {
        if (this.hasModule(mod.id)) return;
        if (!mod.id) mod.id = CABLES.simpleId();
        if (!mod.numId) mod.numId = this._moduleNumId;
        if (!mod.num)mod.num = this._modules.length;
        if (sibling && !sibling.group) sibling.group = simpleId();

        if (!mod.group)
            if (sibling) mod.group = sibling.group;
            else mod.group = simpleId();

        mod.prefix = "mod" + mod.group + "_";
        this._modules.push(mod);

        this.setWhyCompile("add module " + mod.title);
        this._moduleNumId++;

        return mod;
    }

    isValid()
    {
        return this._isValid;
    }

    // getAttributeSrc(mod, srcHeadVert, srcVert)
    // {
    //     if (mod.attributes)
    //         for (let k = 0; k < mod.attributes.length; k++)
    //         {
    //             const r = this._getAttrSrc(mod.attributes[k], false);
    //             if (r.srcHeadVert)srcHeadVert += r.srcHeadVert;
    //             if (r.srcVert)srcVert += r.srcVert;
    //         }

    //     return { "srcHeadVert": srcHeadVert, "srcVert": srcVert };
    // }

    // replaceModuleSrc()
    // {
    //     let srcHeadVert = "";

    //     for (let j = 0; j < this._modules.length; j++)
    //     {
    //         const mod = this._modules[j];
    //         if (mod.name == this._moduleNames[i])
    //         {
    //             srcHeadVert += "\n//---- MOD: group:" + mod.group + ": idx:" + j + " - prfx:" + mod.prefix + " - " + mod.title + " ------\n";

    //             srcVert += "\n\n//---- MOD: " + mod.title + " / " + mod.priority + " ------\n";

    //             if (mod.getAttributeSrc)
    //             {
    //                 const r = getAttributeSrc(mod, srcHeadVert, srcVert);
    //                 if (r.srcHeadVert)srcHeadVert += r.srcHeadVert;
    //                 if (r.srcVert)srcVert += r.srcVert;
    //             }

    //             srcHeadVert += mod.srcHeadVert || "";
    //             srcVert += mod.srcBodyVert || "";

    //             srcHeadVert += "\n//---- end mod ------\n";

    //             srcVert += "\n//---- end mod ------\n";

    //             srcVert = srcVert.replace(/{{mod}}/g, mod.prefix);
    //             srcHeadVert = srcHeadVert.replace(/{{mod}}/g, mod.prefix);

    //             srcVert = srcVert.replace(/MOD_/g, mod.prefix);
    //             srcHeadVert = srcHeadVert.replace(/MOD_/g, mod.prefix);
    //         }
    //     }

    //     vs = vs.replace("{{" + this._moduleNames[i] + "}}", srcVert);
    // }
}

export { CgShader };
