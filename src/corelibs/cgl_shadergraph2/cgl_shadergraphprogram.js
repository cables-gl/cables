import { Events } from "cables-shared-client";
import { CONSTANTS, Op } from "cables";
import { LangWgsl } from "./lang.js";
// import { ShaderGraph } from "./cgl_shadergraph.js";

let shaderIdCounter = 0;

export class ShaderGraphProgram extends Events
{
    lang = new LangWgsl();
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

    constructor(op, port, type)
    {
        super();
        // this.#sg = sg;
        this.#type = type;
        this.#op = op;
        this.#port = port;
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

        // if (op.sgOp && op.sgOp._defines)
        //     for (let i = 0; i < op.sgOp._defines.length; i++)
        //         this._headFuncSrc += "#define " + op.sgOp._defines[i][0] + "\n";

        // if (op.sgOp.info)
        // {
        //     for (let i = 0; i < op.sgOp.info.functions.length; i++)
        //     {
        //         const f = op.sgOp.info.functions[i];
        //         if (this._functionIdInHead[f.uniqueName]) continue;
        //         // if (!f.name.includes("_ID")) this._functionIdInHead[f.uniqueName] = true;
        //         let src = f.src;
        //         // src = this.replaceId(op, src);
        //         this._headFuncSrc += src;
        //     }
        // }

        this._headFuncSrc += op.shaderNode.src || "";

    }

    _getPortParamStr(p, convertTo)
    {
        let paramStr = "";

        /** @type {import("./shadergraphop.js").ShaderNode} */
        const node = p.op.shaderNode;

        // paramStr += this.dbg("jaja ", false);

        console.log("!QAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        // if (p.op.shaderVar)
        // {
        //     paramStr = p.op.shaderVar;
        // }
        // else
        // if (p.direction == CONSTANTS.PORT.PORT_DIR_OUT)
        // {
        //     paramStr += this.callFunc(p.op, p.uiAttribs.objType);
        // }

        // if (convertTo && convertTo != p.uiAttribs.objType)
        // {
        //     paramStr += this.callFunc(p.op, p.uiAttribs.objType);
        //     // paramStr = this.#sg.convertTypes(convertTo, p.uiAttribs.objType, paramStr);
        // }
        // paramStr += "[convertTo:" + convertTo + "]";
        //
        // paramStr += this.dbg("hurz"+node.name);
        this.execNode(p.op, p.uiAttribs.objType);
        if (p.op.shaderNode.result)
        {
            paramStr += this.lang.convertTypes(convertTo, node.result.type, node.resultVarName);
            // paramStr += this.dbg("hurz");
        } // paramStr += "\ncolor.a=1.0;\n";
        // if (!node.resultVarName)
        // if (node.functionname || node.langfunction)

        if (p.direction == CONSTANTS.PORT.PORT_DIR_OUT)
        {
            this.execNode(p.op, p.uiAttribs.objType);
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
        callstr += this.dbg(" " + node.name + " " + node.type) + "";
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
            if (p.uiAttribs.objType == "sg_void") continue;
            if (p.type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;

            // parameters...
            if (p.isLinked())
            {
                for (let j = 0; j < p.links.length; j++)
                {
                    const otherPort = p.links[j].getOtherPort(p);
                    paramStr += this._getPortParamStr(otherPort, node.result.type);
                    // console.log("otherPort, node.result.type", otherPort, node.result.type);
                    // callstr += this.dbg("jajajaja");

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
                paramStr = this.lang.getDefaultParameter(p.uiAttribs.objType);
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

            if (count < numObjectPorts - 1) callstr += ", ";
            count++;
        }

        if (node.type == "function") callstr += ")";
        callstr += ";";

        if (op.uiAttribs.comment)callstr += "// " + op.uiAttribs.comment;

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

    dbg(str, newline = true)
    {
        str = "/* " + str + "  */";
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

        console.log("this._callFuncStack", this._callFuncStack);

        this.srcMain = this._callFuncStack.join("\n");
        this.srcHeader = this._headFuncSrc;

        this.emitEvent("compiled");

        console.log(this._opIdsFuncCallSrc);
    }

    static getNewId()
    {
        return String(++shaderIdCounter);
    }
}
