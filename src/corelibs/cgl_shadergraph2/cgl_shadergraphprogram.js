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

        if (op.sgOp && op.sgOp._defines)
            for (let i = 0; i < op.sgOp._defines.length; i++)
                this._headFuncSrc += "#define " + op.sgOp._defines[i][0] + "\n";

        if (op.sgOp.info)
        {
            for (let i = 0; i < op.sgOp.info.functions.length; i++)
            {
                const f = op.sgOp.info.functions[i];
                if (this._functionIdInHead[f.uniqueName]) continue;
                // if (!f.name.includes("_ID")) this._functionIdInHead[f.uniqueName] = true;
                let src = f.src;
                // src = this.replaceId(op, src);
                this._headFuncSrc += src;
            }
        }

    }

    /**
     * @param {Op} op
     * @param {string} [convertTo]
     */
    callFunc(op, convertTo)
    {
        // this.setOpShaderId(op);
        let callstr = "  ";

        /** @type {import("./shadergraphop.js").ShaderNode} */
        const node = op.shaderNode;
        const varname = "v" + op.getTitle() + "_" + node.id;
        if (convertTo)callstr += this.lang.typeConv(convertTo) + " " + varname + " = ";

        if (this._opIdsFuncCallSrc[node.id])
        {
            if (varname) return varname;
            return;
        }
        this._opIdsFuncCallSrc[node.id] = true;

        callstr += this.getFunctionName(node) + "(";

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
                    paramStr = this._getPortParamStr(otherPort, p.uiAttribs.objType);

                    // console.log("objtype", p.uiAttribs.objType);
                    this.addOpShaderFuncCode(otherPort.op);
                    continue;
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
            else
            if (node.langfunction)
            {
                // callstr += paramStr;
                if (count < numObjectPorts - 1) callstr += " " + node.langfunction + " ";
            }
            else
            if (node.functionname)
            {
                // callstr += paramStr;
                if (count < numObjectPorts - 1) callstr += " " + node.functionname + " ";
            }

            if (count < numObjectPorts - 1) callstr += ", ";
            count++;
        }

        callstr += ");";

        if (op.uiAttribs.comment)callstr += "// " + op.uiAttribs.comment;

        this._callFuncStack.push(callstr);

        return varname;
    }

    /**
     * @param {import("./shadergraphop.js").ShaderNode} node
     */
    getFunctionName(node)
    {
        if (node.langfunction) return node.langfunction;
        else return node.functionname + node.id;

    }

    countObjectInputPorts(op)
    {
        let count = 0;
        for (let i = 0; i < op.portsIn.length; i++)
            if (op.portsIn[i].type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT) count++;
        return count;
    }

    _getPortParamStr(p, convertTo)
    {
        let paramStr = "";

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

        paramStr += this.callFunc(p.op, p.uiAttribs.objType);

        return paramStr;
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
            callSrc += this.callFunc(lnk.getOtherPort(port).op) + ";";
            // callSrc += "// " + lnk.getOtherPort(port).op.uiAttribs.comment;
            callSrc += "\n";
            // console.log("jlajaja");
        }

        callSrc = this._callFuncStack.join("\n");

        console.log("this._callFuncStack", this._callFuncStack);
        let src = "";// .endl() + "{{MODULES_HEAD}}".endl().endl();

        // console.log("COMPILE", this._type);
        // todo use shader attrib system...

        // if (this.#type == "frag") src += "IN vec2 texCoord;".endl().endl();
        // if (this.#type == "vert") src += "IN vec3 vPosition;".endl() +
        //         "IN vec2 attrTexCoord;".endl() +
        //         "OUT vec2 texCoord;".endl().endl();

        // if (this.#type == "vert")src += "".endl() +
        //         "UNI mat4 projMatrix;".endl().endl() +
        //         "UNI mat4 viewMatrix;".endl().endl() +
        //         "UNI mat4 modelMatrix;".endl().endl();

        // src +=
        //     this._headUniSrc.endl().endl() +
        //     this._headFuncSrc.endl().endl() +
        //     "void main()".endl() +
        //     "{".endl();

        // if (this.#type == "frag")src += "  {{MODULE_BEGIN_FRAG}}".endl();
        // if (this.#type == "vert")src += "  {{MODULE_BEGIN_VERTEX}}".endl();

        src += callSrc;
        //     "}".endl();

        this.finalSrc = src;

        this.emitEvent("compiled");

        console.log(this._opIdsFuncCallSrc);
    }

    static getNewId()
    {
        return String(++shaderIdCounter);
    }
}
