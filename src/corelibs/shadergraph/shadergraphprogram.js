import { Events } from "cables-shared-client";
import { CONSTANTS, Op, Port } from "cables";
import { Lang } from "./lang.js";
import { StandaloneElectron } from "../standalone_electron/standalone_electron.js";

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
        if (!op.sgOp)
        {
            console.warn("HAS NO SGOP!", op);
            return;
        }

        if (this._opIdsHeadFuncSrc[op.id]) return;

        this._opIdsHeadFuncSrc[op.id] = true;

        this._headFuncSrc += op.shaderNode.src || "";

    }

    /**
     * @param {Port} p
     * @param {any} convertTo
     */
    _getPortParamStr(p, convertTo)
    {
        let paramStr = "";

        /** @type {import("./shadergraphop.js").ShaderNode} */
        const node = p.op.shaderNode;

        this.execNode(p.op, p.op.shaderNode.result.type);// uiAttribs.objType);
        if (p.op.shaderNode.result)
        {
            paramStr += this.lang.convertTypes(convertTo, node.result.type, node.resultVarName);
            paramStr += (this.comment("" + convertTo + " " + node.result.type + " " + node.resultVarName, false));

        }

        if (p.direction == CONSTANTS.PORT.PORT_DIR_OUT)
        {
            this.execNode(p.op, p.op.shaderNode.result.type);// uiAttribs.objType);
        }

        // paramStr += this.callFunc(p.op, p.uiAttribs.objType);

        return paramStr;
    }

    /**
     * @param {Op} op
     * @param {string} [convertTo]
     */
    execNode(op, convertTo)
    {

        /** @type {import("./shadergraphop.js").ShaderNode} */
        const node = op.shaderNode;

        let callstr = "  ";
        callstr += this.comment(" " + node.name + " " + node.type) + "";
        callstr += "  ";

        if (!node.resultVarName)
            if (node.type == "var")node.resultVarName = node.name;
            else node.resultVarName = ("r" + op.getTitle() + "_" + node.id);

        const varDef = this.lang.getVarDef(node);

        if (node.resultVarName) callstr += this.lang.getResultDef(node);
        else if (varDef)callstr += varDef;// this.lang.typeConv(convertTo) + " " + varname + " = ";
        else console.log("no var??", op);

        if (this._opIdsFuncCallSrc[node.id]) return;
        this._opIdsFuncCallSrc[node.id] = true;

        if (node.type == "function") callstr += node.name + "(";
        if (node.type == "string") callstr += node.name;
        this.addOpShaderFuncCode(op);

        const numObjectPorts = this.countObjectInputPorts(op);
        let count = 0;
        for (let i = 0; i < op.portsIn.length; i++)
        {
            let paramStr = "";
            const p = op.portsIn[i];
            // if (p.uiAttribs.objType == "sg_void") continue;
            if (p.type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;

            // parameters...
            if (p.isLinked())
            {
                for (let j = 0; j < p.links.length; j++)
                {
                    const otherPort = p.links[j].getOtherPort(p);

                    console.log("~~~~", p.op.shaderNode.result.type, p.op.shaderNode.name);
                    // paramStr += this._getPortParamStr(otherPort, otherPort.op.shaderNode.result.type);
                    paramStr += this._getPortParamStr(otherPort, p.op.shaderNode.result.type);

                    if (node.result.type == "gen")
                    {
                        node.result.type = otherPort.op.shaderNode.result.type;
                    }

                    this.addOpShaderFuncCode(otherPort.op);
                }
            }
            else
            {
                this.addOpShaderFuncCode(p.op);
                // if (p.uiAttribs.objType == "sg_sampler2D")
                // {
                //     // callstr = "vec4(1.0)";
                //     // break;
                //     // paramStr = "null";
                //     // break;
                // }
                // else
                // {
                paramStr = this.lang.getDefaultParameter(p.op.shaderNode.params[i].type);
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
                if (node.type == "operator")
                {
                    callstr += node.name;
                }
                else callstr += ", ";
            }
            count++;
        }

        if (node.type == "function") callstr += ")";
        callstr += ";";

        if (op.uiAttribs.comment)callstr += this.comment(op.uiAttribs.comment);

        callstr += "\n";
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

    compile()
    {
        const port = this.#port;
        const l = port.links;

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
