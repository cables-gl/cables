import { Events } from "cables-shared-client";
import { CONSTANTS, Op, Port } from "cables";
import { Lang } from "./lang.js";
import { StandaloneElectron } from "../standalone_electron/standalone_electron.js";

/**
 * @typedef ShaderNodeParam
 * @property {string} type
 * @property {string} type
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
    lang;

    /** @type {Port} */
    #port;

    _options = {};

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

        if (node.srcUni && !this._opIdsHeadUniSrc[op.id])
        {
            this._headFuncSrc += node.srcUni;
            this._opIdsHeadUniSrc[op.id] = true;
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
     * @param {} convertParam
     */
    _getPortParamStr(otherPort, node, doConvert, convertParam)
    {
        let paramStr = "";

        /** @type {ShaderNode} */
        const otherNode = otherPort.op.shaderNode;

        this.log("param", otherPort.name, node.result.type, otherNode.name);

        this.execNode(otherPort.op, otherPort.op.sgOp.getResult(otherPort.name).result?.type);// uiAttribs.objType);

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

                this.log(node, "component", otp.name, convertParam.port.name);
                paramStr += sourcePort.op.shaderNode.resultVarName + "." + otherPort.name;
            }
            else console.log("no otp");
        }
        else
        if (otherNode.result)
        {
            if (doConvert)
                paramStr += this.lang.convertTypes(this.log.bind(this), convertParam.type, otherNode.result.type, otherNode.resultVarName, node);
            else
                paramStr += otherNode.resultVarName;

        }

        if (otherPort.direction == CONSTANTS.PORT.PORT_DIR_OUT)
            this.execNode(otherPort.op, otherPort.op.sgOp.getResult(otherPort.name).result?.type);// uiAttribs.objType);
        // this.execNode(otherPort.op, otherNode.result.type);

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
        if (!node) return console.log("no node?");

        if (node.update) this.updateableOps[node.id] = node;
        if (node.type == "component") return;
        if (node.type == "bindstruct") return;
        if (node.type == "var")node.resultVarName = node.name;
        if (!node.resultVarName)
            node.resultVarName = ("r" + op.getTitle() + "_" + node.id);

        if (node.type == "operator" || node.maxGen)
        {

            // this.setNodeResult(node, ShaderGraphProgram.getMaxGenTypeFromInputParams(node.params, op.portsOut[0]), "operator maxgen");
        }

        let title = "";
        if (node.title == "name") title += node.name + " ";
        if (this.options.showType && node.results.length == 1) title += node.results[0].type + " ";
        if (this.options.showId) title += "id" + node.id;

        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": title || "..." });
        // op.portsOut[0].setUiAttribs({ "objType": "sg_" + node.result.type });

        /* minimalcore:end */

        const varDef = this.lang.getVarDef(node);

        if (node.resultVarName) callstr += this.lang.getResultDef(node);
        else if (varDef)callstr += varDef;
        else console.log("no var??", op);

        if (this._opIdsFuncCallSrc[node.id]) return;
        this._opIdsFuncCallSrc[node.id] = true;

        /// //////

        if (node.type == "value" && node.values) callstr += this.lang.vecStr(node.values);

        if (node.type == "function") callstr += node.name + "(";
        if (node.type == "string") callstr += node.name;

        this.addOpShaderFuncCode(op);

        const numObjectPorts = this.countObjectInputPorts(op);
        let count = 0;

        if (node.params)
        {
            for (let i = 0; i < node.params.length; i++)
            {
                let paramStr = "";

                const param = node.params[i];
                const port = param.port;

                if (port.type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;

                // this.setNodeResultType(node, node.result.type, param);

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

                        // if (node.result.type == "gen" && otherPort.op.shaderNode.result)
                        // {

                        //     // node.result.type = otherPort.op.shaderNode.results[0].type;
                        //     // let t = this.getParamFromPort(node, otherPort).type; otherPort.op.shaderNode.results[0].type;
                        //     let t = this.getTypeFromInputPort(port);

                        //     // if (t == "gen")
                        //     // {
                        //     // t = this.lang.getMaxGenTypeFromInputParams(node.params);
                        //     // }
                        //     node.result.type = t;
                        //     // node.result.type = otherPort.op.shaderNode.results[0].type;
                        // }
                        // node.result.type = otherPort.op.shaderNode.result.type;

                        this.addOpShaderFuncCode(otherPort.op);
                    }

                    if (node.type == "constructor")
                        if (i == op.portsIn.length - 1)paramStr += ")";
                }
                else
                {
                    this.addOpShaderFuncCode(port.op);
                    // this.log("defaultvalue ", port.op.shaderNode.params[i].name);

                    let defaul = null;
                    if (port.attribs.sg) defaul = port.attribs.sg;
                    else
                    {

                        /* minimalcore:start */
                        // if (port.op.shaderNode.params[i].default)port.setAttribs({ "sg": port.op.shaderNode.params[i].default });
                        // do not set for less data.........

                        /* minimalcore:end */
                    }
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

        /* minimalcore:end */

        if (callstr.trim() != "") callstr += "\n";

        /* minimalcore:start */
        this.log(node, "execnode  [" + node.type + "]");
        // this.log("->" + node.result.type);

        /* minimalcore:end */

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
    }

    static getNewId()
    {
        return String(++shaderIdCounter);
    }

    /**
     * @param {ShaderNode} node
     * @param {string} t
     * @param {string} reason
     */
    // setNodeResult(node, t, reason)
    // {
    //     if (reason) this.log(node, "set node result", reason);
    //     node.result.type = t;
    // }

    // setNodeResultType(node, type, param)
    // {

    //     if (param.resultType)param.type = node.result.type;
    // }

    /**
     * @param {ShaderNode} node
     * @param {Port} [port]
     */
    // getTypeFromInputPort(port)
    // {

    //     console.log("gettypefrominput", port.op.name + ":" + port.name);
    //     const node = port.op.shaderNode;
    //     if (node.params)
    //         for (let i = 0; i < node.params.length; i++)
    //             if (node.params[i].port == port)
    //             {
    //                 if (node.params[i].type == "gen")
    //                 {
    //                     if (port.isLinked())
    //                     {

    //                         return this.getTypeFromOutputPort(port.links[0].getOtherPort(port));
    //                     }
    //                 }
    //                 console.log("return", node.params[i].type);
    //                 return node.params[i].type;
    //             }
    //     console.log("lalala", port, node);
    // }

    // getTypeFromOutputPort(port)
    // {

    //     console.log("gettypefrominput", port.op.name + ":" + port.name);
    //     const node = port.op.shaderNode;
    //     if (node.params)
    //         for (let i = 0; i < node.results.length; i++)
    //             if (node.results[i].port == port)
    //             {
    //                 if (node.results[i].type == "gen")
    //                 {
    //                     if (port.isLinked())
    //                     {

    //                         return this.getTypeFromInputPort(port.links[0].getOtherPort(port));
    //                     }
    //                 }
    //                 this.log(node, "return", node.results[i].type);
    //                 return node.results[i].type;
    //             }
    //     console.log("lalala", port, node);
    // }

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
            for (let i = 0; i < params[j].port.links.length; i++)
            {
                const otherport = params[j].port.links[i].getOtherPort(params[j].port);
                const otherop = otherport.op;
                const r = otherop.sgOp.getResult(otherport.name);
                const type = r.type;
                // console.log("type", type);
                const t = types.indexOf(params[j].type);
                typeIdx = Math.max(typeIdx, t);
            }
        }

        const t = types[typeIdx];
        // console.log("getmaxgentype", params, portsSetType, t);

        if (portsSetType)
        //     for (let i = 0; i < portsSetType.length; i++)
            portsSetType.op.shaderNode.result.type = t;

        return t;
    }

}
