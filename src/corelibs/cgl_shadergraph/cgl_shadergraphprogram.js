import { Events } from "cables-shared-client";
import { CONSTANTS } from "cables";
import { ShaderGraph } from "./cgl_shadergraph.js";

export class ShaderGraphProgram extends Events
{
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

    constructor(sg, op, port, type)
    {
        super();
        this.#sg = sg;
        this.#type = type;
        this.#op = op;
        this.#port = port;
    }

    setOpShaderId(op)
    {
        if (!op.shaderId) op.shaderId = CGL.ShaderGraph.getNewId();
    }

    replaceId(op, txt)
    {
        this.setOpShaderId(op);
        return txt.replaceAll("_ID", "_" + op.shaderId);
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
            // console.log(op.sgOp.info.name, op.sgOp.info.functions);
            for (let i = 0; i < op.sgOp.info.functions.length; i++)
            {
                const f = op.sgOp.info.functions[i];
                if (this._functionIdInHead[f.uniqueName]) continue;
                if (!f.name.includes("_ID")) this._functionIdInHead[f.uniqueName] = true;
                let src = f.src;
                src = this.replaceId(op, src);
                this._headFuncSrc += src;
            }
        }

        if (op.shaderUniforms)
        {
            for (let i = 0; i < op.shaderUniforms.length; i++)
            {
                const uni = op.shaderUniforms[i];
                if (!uni.static)
                {
                    this._headUniSrc += "uniform " + CGL.Uniform.glslTypeString(uni.type) + " " + uni.name + ";".endl();
                    this.uniforms.push(uni);
                }
                else
                    this._headUniSrc += this.uniformAsStaticVar(uni);
            }
        }
    }

    uniformAsStaticVar(uni)
    {
        const typeStr = CGL.Uniform.glslTypeString(uni.type);
        let str = "";

        if (typeStr == "float")
        {
            let floatStr = String(uni.ports[0].get());
            if (!floatStr.includes("."))floatStr += ".";
            str = typeStr + " " + uni.name + " = " + floatStr + ";".endl();
        }
        else
        {
            str = typeStr + " " + uni.name + "=" + typeStr + "(";

            for (let i = 0; i < uni.ports.length; i++)
            {
                str += uni.ports[i].get();
                if (i != uni.ports.length - 1)str += ",";
            }

            str += ");".endl();
        }
        return str;
    }

    callFunc(op, convertTo)
    {
        this.setOpShaderId(op);
        let callstr = "  ";

        const varname = "var_" + op.getTitle() + "_" + op.shaderId;
        if (convertTo)callstr += this.#sg.typeConv(convertTo) + " " + varname + " = ";

        if (this._opIdsFuncCallSrc[op.shaderId])
        {
            if (varname) return varname;
            return;
        }
        this._opIdsFuncCallSrc[op.shaderId] = true;

        callstr += this.replaceId(op, op.shaderFunc || "") + "(";

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
                paramStr = this.#sg.getDefaultParameter(p.uiAttribs.objType);
                // }
            }

            if (p.op.shaderCodeOperator)
            {
                callstr += paramStr;
                if (count < numObjectPorts - 1) callstr += " " + p.op.shaderCodeOperator + " ";
            }
            else
            if (paramStr)
            {
                callstr += paramStr;
                if (count < numObjectPorts - 1) callstr += ", ";
            }
            count++;
        }

        callstr += ");";

        this._callFuncStack.push(callstr);

        return varname;
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

        if (p.op.shaderVar)
        {
            paramStr = p.op.shaderVar;
        }
        else
        if (p.direction == CONSTANTS.PORT.PORT_DIR_OUT)
        {
            paramStr += this.callFunc(p.op, p.uiAttribs.objType);
        }

        if (convertTo && convertTo != p.uiAttribs.objType)
        {
            paramStr = this.#sg.convertTypes(convertTo, p.uiAttribs.objType, paramStr);
        }

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
            callSrc += this.callFunc(lnk.getOtherPort(port).op) + ";".endl();
        }

        callSrc = this._callFuncStack.join("\n");

        let src = "".endl() + "{{MODULES_HEAD}}".endl().endl();

        // console.log("COMPILE", this._type);
        // todo use shader attrib system...

        if (this.#type == "frag") src += "IN vec2 texCoord;".endl().endl();
        if (this.#type == "vert") src += "IN vec3 vPosition;".endl() +
                "IN vec2 attrTexCoord;".endl() +
                "OUT vec2 texCoord;".endl().endl();

        if (this.#type == "vert")src += "".endl() +
                "UNI mat4 projMatrix;".endl().endl() +
                "UNI mat4 viewMatrix;".endl().endl() +
                "UNI mat4 modelMatrix;".endl().endl();

        src +=
            this._headUniSrc.endl().endl() +
            this._headFuncSrc.endl().endl() +
            "void main()".endl() +
            "{".endl();

        if (this.#type == "frag")src += "  {{MODULE_BEGIN_FRAG}}".endl();
        if (this.#type == "vert")src += "  {{MODULE_BEGIN_VERTEX}}".endl();

        src += callSrc.endl() +
            "}".endl();

        this.finalSrc = src;

        this.emitEvent("compiled");
    }
}
