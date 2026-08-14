import { Events } from "cables-shared-client";
import { CONSTANTS, Op, Port } from "cables";
import { Lang } from "./lang.js";
import { StandaloneElectron } from "../standalone_electron/standalone_electron.js";

/**
 * @typedef ShaderNodeParam
 * @property {string} type
 * @property {Port} port
 */

/**
 * @typedef ShaderNode
 * @property {"function"|"constructor"|"value"|"existingvar"|"operator"|"var"|"component"|"string"|"override"} [type]
 * @property {string} [name]
 * @property {string} [title]
 * @property {string} resultVarName
 * @property {string} id
 * @property {boolean} maxGen
 * @property {number} value
 * @property {number[]} values
 * @property {string} src
 * @property {ShaderNodeParam[]} params
 * @property {ShaderNodeParam} result
 * @property {ShaderNodeParam[]} results
 */

/**
 * @typedef CompileOptions
 * @property {boolean} showId
 * @property {boolean} showType
 * @property {boolean} debug
 */
let shaderIdCounter = 0;

export class ShaderGraphProgram extends Events
{

    /** @type {Lang} */
    lang = null;
    uniforms = [];
    #sg = null;
    #type = null;
    #op = null;
    #port = null;

    _opIdsHeadFuncSrc = {};
    _opIdsFuncCallSrc = {};
    _functionIdInHead = {};

    _headFuncSrc = "";
    _headUniSrc = "";
    _callFuncStack = [];
    finalSrc = "";

    /**
     * @param {Op} op
     * @param {Port} port
     * @param {string} type
     * @param {Lang} lang
     */
    constructor(op, port, type, lang)
    {
        super();
        this.#type = type;
        this.#op = op;
        this.#port = port;
        this.lang = lang;
    }

    addOpShaderFuncCode(op)
    {
        if (this._opIdsHeadFuncSrc[op.opId]) return;

        this._opIdsHeadFuncSrc[op.opId] = true;
        this._headFuncSrc += op.shaderNode.src || "";
    }

    /**
     * @param {Port} p
     * @param {ShaderNode} node
     * @param {boolean} doConvert
     */
    _getPortParamStr(p, node, doConvert, convertParam)
    {
        let paramStr = "";

        /** @type {ShaderNode} */
        const otherNode = p.op.shaderNode;

        // console.log("text")
        // if (otherNode.result.type == "gen")
        // {
        //     otherNode.result.type = this.lang.getMaxGenTypeFromParams(node);

        //     this.log("iiiiii", convertParam.name, p.name, node.name, otherNode.name);

        // }

        this.log("param", p.name, node.result.type, otherNode.name);
        this.log("nodeee", node.type);

        this.execNode(p.op, otherNode.result?.type);// uiAttribs.objType);

        const tt = this.lang.getMaxGenTypeFromParams(node.params);

        if (otherNode.type == "component")
        {
            const otp = otherNode.params[0].port;
            const sourcePort = otp.links[0].getOtherPort(otp);

            this.execNode(sourcePort.op);

            paramStr += sourcePort.op.shaderNode.resultVarName + "." + convertParam.port.name;

        }
        else
        if (otherNode.result)
        {
            this.log("doconvert", doConvert);
            if (doConvert)
            {
                paramStr += this.lang.convertTypes(this.log.bind(this), convertParam.type, otherNode.result.type, otherNode.resultVarName);
            }
            else
                paramStr += otherNode.resultVarName;

        }

        if (p.direction == CONSTANTS.PORT.PORT_DIR_OUT)
            this.execNode(p.op, otherNode.result.type);// uiAttribs.objType);

        return paramStr;
    }

    /**
     * @param {Op} op
     * @param {string} [convertTo]
     */
    execNode(op, convertTo)
    {

        /** @type {ShaderNode} */
        const node = op.shaderNode;

        let callstr = "    ";

        if (node.type == "component") return;
        if (node.type == "var")node.resultVarName = node.name;
        if (!node.resultVarName)
            node.resultVarName = ("r" + op.getTitle() + "_" + node.id);

        if (node.type == "operator" || node.maxGen)
        {
            node.result.type = this.lang.getMaxGenTypeFromParams(node.params, op.portsOut[0]);
            this.log("set result ", node.name, node.result.type);
        }

        op.portsOut[0].setUiAttribs({ "objType": "sg_" + node.result.type });

        let title = "";

        if (node.title == "name")title += node.name + " ";

        if (this.options.showType) title += node.result.type + " ";

        if (this.options.showId) title += "id" + node.id;
        op.setUiAttrib({ "extendTitle": title });

        const varDef = this.lang.getVarDef(node);

        if (node.resultVarName) callstr += this.lang.getResultDef(node);
        else if (varDef)callstr += varDef;// this.lang.typeConv(convertTo) + " " + varname + " = ";
        else console.log("no var??", op);

        if (this._opIdsFuncCallSrc[node.id]) return;
        this._opIdsFuncCallSrc[node.id] = true;

        /// //////

        if (node.type == "value")
        {
            if (node.values) callstr += this.lang.vecStr(node.values);
            // else callstr += "|" + this.lang.floatStr(node.value) + "_";
        }

        if (node.type == "function") callstr += node.name + "(";
        if (node.type == "string") callstr += node.name;
        this.addOpShaderFuncCode(op);

        const numObjectPorts = this.countObjectInputPorts(op);
        let count = 0;

        if (node.params)
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
                    // if (param.type == "gen")doConvertTypes = false;

                    if (node.type == "constructor")
                    {
                        doConvertTypes = false;
                        if (i == 0) paramStr += node.name + "(";
                        if (port.links.length > 1) this.log("WARNING: param should only have one connection" + port.name);
                    }

                    for (let j = 0; j < port.links.length; j++)
                    {
                        const otherPort = port.links[j].getOtherPort(port);

                        // paramStr += this._getPortParamStr(otherPort, otherPort.op.shaderNode.result.type);
                        paramStr += this._getPortParamStr(otherPort, node, doConvertTypes, param);

                        if (node.result.type == "gen")
                            node.result.type = otherPort.op.shaderNode.result.type;

                        this.addOpShaderFuncCode(otherPort.op);
                    }

                    if (node.type == "constructor")
                    {
                        if (i == op.portsIn.length - 1)paramStr += ")";
                    }
                }
                else
                {
                    this.addOpShaderFuncCode(port.op);
                    // if (p.uiAttribs.objType == "sg_sampler2D")
                    // {
                    //     // callstr = "vec4(1.0)";
                    //     // break;
                    //     // paramStr = "null";
                    //     // break;
                    // }
                    // else
                    // {
                    this.log("defaultvalue ", port.op.shaderNode.params[i].name);
                    paramStr = this.lang.getDefaultParameter(port.op.shaderNode.params[i].type);
                // }
                }

                if (paramStr)
                {

                    callstr += paramStr;
                }
                // else
                // if (node.type)
                // {
                //     // callstr += paramStr;
                //     if (count < numObjectPorts - 1) callstr += " " + node.langfunction + " ";
                // }
                else
                if (node.type == "function")
                {
                // callstr += paramStr;
                    if (count < numObjectPorts - 1) callstr += " " + node.name + " ";
                }

                if (count < numObjectPorts - 1)
                {
                    if (node.type == "operator") callstr += node.name; // math symbol +-/ , NOT var name
                    else callstr += ", ";
                }

                count++;
            }

        if (node.type == "function") callstr += ")";
        if (callstr.trim() != "") callstr += ";";

        if (op.uiAttribs.comment)callstr += this.comment(op.uiAttribs.comment);

        if (callstr.trim() != "") callstr += "\n";

        this.log("execnode " + node.name + " [" + node.type + "]");
        this.log("result type " + node.result.type);
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

    log(...args)
    {
        if (!this.options.debug) return;
        const str = "    // " + args.map(String).join(" ");
        this._callFuncStack.push(str);
    }

    /**
     * @param {CompileOptions} options
     */
    compile(options)
    {
        const port = this.#port;
        const l = port.links;

        this.options = options;
        this.uniforms = [];
        this._callFuncStack = [];
        this._functionIdInHead = {};
        this._opIdsFuncCallSrc = {};
        this._opIdsHeadFuncSrc = {};
        this._headFuncSrc = "";
        this._headUniSrc = "";
        let callSrc = "";

        for (let i = 0; i < l.length; i++)
        {
            const lnk = l[i];
            this.execNode(lnk.getOtherPort(port).op);
        }

        this.srcMain = this._callFuncStack.join("\n");
        this.srcHeader = this._headFuncSrc;

        this.emitEvent("compiled");
    }

    static getNewId()
    {
        return String(++shaderIdCounter);
    }
}
