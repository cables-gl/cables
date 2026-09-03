import { Events } from "cables-shared-client";
import { CONSTANTS, Op, Port } from "cables";
import { Lang } from "./lang.js";
import { StandaloneElectron } from "../standalone_electron/standalone_electron.js";

/**
 * @typedef ShaderNodeParam
 * @property {string} type
 * @property {string} type
 * @property {string} name
 * @property {boolean} gen
 * @property {Port} port
 * @property {boolean} resultType - change to result type when that changes
 */

/**
 * @typedef ShaderNode
 * @property {"function"|"constructor"|"value"|"existingvar"|"operator"|"var"|"component"|"string"|"override"|"bindstruct"} [type]
 * @property {string} [name]
 * @property {function} [update]
 * @property {string} [title]
 * @property {string} resultVarName
 * @property {string} id
 * @property {boolean} maxGen
 * @property {number} value
 * @property {number[]} values
 * @property {string} src - this source code will only appended once (per op name) into the shader header
 * @property {string} srcUni - this source code will appended once per op instance id
 * @property {ShaderNodeParam[]} params
 * @property {ShaderNodeParam[]} results
 */

/**
 * @typedef CompileOptions
 * @property {string} name
 * @property {boolean} showId
 * @property {boolean} showType
 * @property {boolean} debug
 */
let shaderIdCounter = 0;

export class ShaderGraphProgram extends Events
{

    /** @type {Lang} */
    lang;

    /** @type {Port} */
    #port;

    options = {};

    /** @type {Object<String,any>} */
    _opIdsHeadFuncSrc = {};

    /** @type {Object<String,any>} */
    _opIdsHeadUniSrc = {};

    /** @type {Object<String,any>} */
    _opIdsFuncCallSrc = {};

    /** @type {Object<String,any>} */
    _functionIdInHead = {};

    _headFuncSrc = "";
    _headUniSrc = "";

    /** @type {string[]} */
    _callFuncStack = [];
    finalSrc = "";
    updateableOps = {};

    /**
     * @param {Port} port
     * @param {Lang} lang
     */
    constructor(port, lang)
    {
        super();
        this.#port = port;
        this.lang = lang;
    }

    /**
     * @param {Op<any>} op
     */
    addOpShaderFuncCode(op)
    {

        /** @type {ShaderNode} */
        const node = op.shaderNode;

        // this._headFuncSrc += "// addfunc " + node.name + "::" + node.srcUni + "\n";

        if (node.srcUni && this._opIdsHeadUniSrc[op.id] != node.srcUni)
        {
            this._headFuncSrc += (node.srcUni || "") + "\n";
            this._opIdsHeadUniSrc[op.id] = node.srcUni;
        }

        if (node.src && !this._opIdsHeadFuncSrc[op.name])
        {
            this._headFuncSrc += node.src || "";
            this._opIdsHeadFuncSrc[op.name] = true;
        }

    }

    /**
     * @param {Port} otherPort
     * @param {ShaderNode} node
     * @param {boolean} doConvert
     * @param {} param
     */
    _getPortParamStr(otherPort, node, doConvert, param)
    {
        let paramStr = "";

        /** @type {ShaderNode} */
        const otherNode = otherPort.op.shaderNode;

        // console.log("parammm", param.port.name);
        // this.log(node, "param [", param.port.name, "]", otherPort.name, node.results[0].type, "=>", param.type, otherNode.name);

        this.execNode(otherPort.op);

        const tt = ShaderGraphProgram.getMaxGenTypeFromInputParams(node.params);

        if (otherNode.type == "bindstruct")
        {
            paramStr += otherPort.op.shaderNode.name + "." + otherPort.name;
        }
        else if (otherNode.type == "component")
        {
            const otp = otherNode.params[0].port;

            if (otp && otp.links.length)
            {
                const sourcePort = otp.links[0].getOtherPort(otp);

                this.execNode(sourcePort.op);

                this.log(node, "component", otp.name, param.port.name);

                paramStr += this.lang.convertTypes(
                    this.log.bind(this),
                    param.type,
                    "float",
                    sourcePort.op.shaderNode.resultVarName + "." + otherPort.name,
                    otherNode);

            }
            else console.log("no otp");
        }
        else
        if (otherNode.results[0])
        {
            // if (doConvert)
            // this.log(node, "param conv ?", otherNode.resultVarName, param.type, "to", otherNode.result.type, node.results[0].type);
            paramStr += this.lang.convertTypes(
                this.log.bind(this),
                param.type,
                otherNode.results[0].type,
                otherNode.resultVarName,
                otherNode);

            if (this.options.debug)
                paramStr += "/* conv " + "param [" + param.type + ": " + param.port.name + "]" + otherNode.results[0].type + " " + otherPort.name + " */";
        }

        if (otherPort.direction == CONSTANTS.PORT.PORT_DIR_OUT)
            this.execNode(otherPort.op);

        return paramStr;
    }

    /**
     * @param {Op} op
     */
    execNode(op)
    {

        /* minimalcore:start */
        this.detectLangProblems(this.lang.name, op);

        /* minimalcore:end */

        /** @type {ShaderNode} */
        const node = op.shaderNode;

        this.addOpShaderFuncCode(op);
        this.log(node, "execnode start " + op.name);
        let callstr = "    ";
        if (!node) return console.log("no node?");

        if (node.update) this.updateableOps[node.id] = node;
        if (node.type == "component") return;
        if (node.type == "bindstruct") return;
        if (node.type == "var")node.resultVarName = node.name;
        if (!node.resultVarName) node.resultVarName = ("r" + op.getTitle() + "_" + node.id);

        if (node.type == "operator" || node.maxGen)
        {
            node.results[0].type = ShaderGraphProgram.getMaxGenTypeFromInputParams(node.params, op.portsOut[0]);
        }

        let title = "";
        if (node.title == "name") title += node.name + " ";
        if (this.options.showType && node.results.length == 1) title += node.results[0].type + " ";
        if (this.options.showId) title += " " + node.resultVarName;

        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": title || "" });

        /* minimalcore:end */

        const varDef = this.lang.getVarDef(node);

        if (node.resultVarName) callstr += this.lang.getResultDef(node);

        else if (varDef)callstr += varDef;
        else callstr += ("/* no var?? */");

        if (this._opIdsFuncCallSrc[node.id]) return;
        this._opIdsFuncCallSrc[node.id] = true;

        /// //////

        if (node.type == "value" && node.values) callstr += this.lang.vecStr(node.values);

        if (node.type == "function") callstr += node.name + "(";
        if (node.type == "string") callstr += node.name;

        const numObjectPorts = this.countObjectInputPorts(op);
        let count = 0;

        if (node.params && node.type != "value")
        {
            for (let i = 0; i < node.params.length; i++)
            {
                let paramStr = "";

                const param = node.params[i];
                const port = param.port;

                if (port.type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;

                // parameters...
                if (port.isLinked())
                {
                    let doConvertTypes = true;

                    if (node.type == "constructor")
                    {
                        doConvertTypes = false;
                        if (i == 0) paramStr += node.name + "(";
                        if (port.links.length > 1) this.log(node, "WARNING: param should only have one connection" + port.name);
                    }

                    for (let j = 0; j < port.links.length; j++)
                    {
                        const otherPort = port.links[j].getOtherPort(port);

                        paramStr += this._getPortParamStr(otherPort, node, doConvertTypes, param);

                        this.addOpShaderFuncCode(otherPort.op);
                    }

                    if (node.type == "constructor")
                        if (i == op.portsIn.length - 1)paramStr += ")";
                }
                else
                {
                    this.addOpShaderFuncCode(port.op);

                    let defaul = null;
                    if (port.attribs.sg) defaul = port.attribs.sg;
                    defaul = defaul || port.op.shaderNode.params[i].default;

                    paramStr = this.lang.getDefaultParameter(port.op.shaderNode.params[i].type, defaul);
                }

                if (paramStr) callstr += paramStr;
                else if (node.type == "function" && count < numObjectPorts - 1) callstr += " " + node.name + " ";

                if (count < numObjectPorts - 1)
                {
                    if (node.type == "operator") callstr += node.name; // math symbol +-/ , NOT var name
                    else callstr += ", ";
                }

                count++;
            }
        }

        if (node.type == "function") callstr += ")";
        if (callstr.trim() != "") callstr += ";";

        /* minimalcore:start */
        if (op.uiAttribs.comment)callstr += this.comment(op.uiAttribs.comment);
        this.log(node, "execnode  [" + node.type + "]");

        /* minimalcore:end */

        if (callstr.trim() != "") callstr += "\n";
        this._callFuncStack.push(callstr);

        return node.resultVarName;
    }

    countObjectInputPorts(op)
    {
        let count = 0;
        for (let i = 0; i < op.portsIn.length; i++)
            if (op.portsIn[i].type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT) count++;
        return count;
    }

    /**
     * @param {string} str
     */
    comment(str, newline = false)
    {
        str = " /* " + str + "  */ ";
        if (newline)str += "\n";
        return str;
    }

    log(node, ...args)
    {
        if (!this.options.debug) return;
        const str = "    // " + node.name + ":" + args.map(String).join(" ");
        this._callFuncStack.push(str);
    }

    /**
     * @param {CompileOptions} options
     */
    compile(options)
    {
        const port = this.#port;

        this.updateableOps = {};
        this.options = options || {};
        this._callFuncStack = [];
        this._functionIdInHead = {};
        this._opIdsFuncCallSrc = {};
        this._opIdsHeadFuncSrc = {};
        this._opIdsHeadUniSrc = {};
        this._headFuncSrc = "";
        this._headUniSrc = "";

        let callSrc = "";

        if (!port.ports)
        {
            // delete this after upgrading "short"
            const l = port.links;
            for (let i = 0; i < l.length; i++)
            {
                const lnk = l[i];
                this.execNode(lnk.getOtherPort(port).op);
            }
        }
        else
        {
            for (let i = 0; i < port.ports.length; i++)
            {
                if (port.ports[i].isLinked())
                {
                    const lnk = port.ports[i].links[0];
                    this.execNode(lnk.getOtherPort(port.ports[i]).op);
                }
            }
        }
        this.srcMain = this._callFuncStack.join("\n");
        this.srcHeader = this._headFuncSrc;

        this.emitEvent("compiled");
        console.log("compiled " + (this.options.name || ""));
    }

    static getNewId()
    {
        return String(++shaderIdCounter);
    }

    /**
     * @param {ShaderNode} node
     * @param {Port} port
     */
    static getParamFromPort(port)
    {

        /** @type {ShaderNode} */
        const node = port.op.shaderNode;
        if (node.params)
            for (let i = 0; i < node.params.length; i++)
                if (node.params[i].port == port) return node.params[i];

        if (node.results)
            for (let i = 0; i < node.results.length; i++)
                if (node.results[i].port == port) return node.results[i];

        if (node.result) return node.result;
        console.warn("could not find param for port ", port);
        return node;
    }

    /**
     * @param {import("./shadergraphprogram").ShaderNodeParam[]} params
     * @param {Port} [portsSetType]
     */
    static getMaxGenTypeFromInputParams(params, portsSetType)
    {
        params = params || [];
        const types = ["float", "vec2", "vec3", "vec4"];
        let typeIdx = 0;

        for (let j = 0; j < params.length; j++)
        {
            if (!params[j].port) continue;
            for (let i = 0; i < params[j].port.links.length; i++)
            {
                const otherport = params[j].port.links[i].getOtherPort(params[j].port);
                const otherop = otherport.op;
                const r = otherop.sgOp.getResult(otherport.name);

                if (r)
                {
                    const type = r.type;
                    const t = types.indexOf(r.type);
                    typeIdx = Math.max(typeIdx, t);
                }
            }

        }

        const t = types[typeIdx];

        if (portsSetType)
            portsSetType.op.shaderNode.results[0].type = t;

        return t;
    }

    /* minimalcore:start */
    /**
     * @param {string} lang
     * @param {Op} op
     */
    detectLangProblems(lang, op)
    {
        if (lang == "glsl" && op.objName.toLowerCase().includes("wgsl") || lang == "wgsl" && op.objName.toLowerCase().includes("glsl"))
            op.setUiError("sglang", "language conflict: seems not to be " + lang);
    }

    /* minimalcore:end */
}
