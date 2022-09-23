import paramsHelper from "../../../../../cables_ui/src/ui/components/opparampanel/params_helper";

const ShaderGraph = class extends CABLES.EventTarget
{
    constructor(op, portFrag, portVert)
    {
        super();
        this._op = op;
        this._portFrag = portFrag;
        this._portVert = portVert;

        this._opIdsHeadFuncSrc = {};
        this._opIdsFuncCallSrc = {};
        this._functionIdInHead = {};

        this._headFuncSrc = "";
        this._headUniSrc = "";
        this._callFuncStack = [];
        this._finalSrcFrag = "";
        this._finalSrcVert = CGL.Shader.getDefaultVertexShader();

        this.uniforms = [];

        portFrag.on("change", () =>
        {
            this.compile(this._portFrag, "frag");
        });
        portVert.on("change", this.updateVertex.bind(this));
        portVert.on("onLinkChanged", this.updateVertex.bind(this));
    }

    updateVertex()
    {
        console.log("update vertex", this._portVert.isLinked());

        if (this._portVert.isLinked()) this.compile(this._portVert, "vert");
        else
        {
            this._finalSrcVert = CGL.Shader.getDefaultVertexShader();
            this.emitEvent("compiled");
        }
    }

    getSrcFrag() { return this._finalSrcFrag; }

    getSrcVert() { return this._finalSrcVert; }

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
        // if (!op.sgOp.info) return;


        if (this._opIdsHeadFuncSrc[op.id])
        {
        // console.log("already exist",op.name,op.id);
            return;
        }
        this._opIdsHeadFuncSrc[op.id] = true;

        if (op.sgOp && op.sgOp._defines)
            for (let i = 0; i < op.sgOp._defines.length; i++)
                this._headFuncSrc += "#define " + op.sgOp._defines[i][0] + "\n";

        // if (op.shaderSrc)
        // {
        //     let src = op.shaderSrc.endl();// +"/* "+op.id+" */".endl();;
        //     src = this.replaceId(op, src);
        //     this._headFuncSrc += src;
        // }


        if (op.sgOp.info)
        {
            console.log(op.sgOp.info.name, op.sgOp.info.functions.length);
            for (let i = 0; i < op.sgOp.info.functions.length; i++)
            {
                const f = op.sgOp.info.functions[i];
                console.log("ADD FUNCTION CODE", f.name, this._functionIdInHead[f.name]);
                if (this._functionIdInHead[f.name]) continue;
                if (f.name.indexOf("_ID") == -1) this._functionIdInHead[f.name] = true;
                let src = f.src;
                console.log("src", src);
                src = this.replaceId(op, src);
                this._headFuncSrc += src;
            }
        }

        if (op.shaderUniforms)
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

    uniformAsStaticVar(uni)
    {
        const typeStr = CGL.Uniform.glslTypeString(uni.type);
        let str = typeStr + " " + uni.name + "=" + typeStr + "(";

        for (let i = 0; i < uni.ports.length; i++)
        {
            str += uni.ports[i].get();
            if (i != uni.ports.length - 1)str += ",";
        }

        str += ");".endl();
        return str;
    }

    callFunc(op, convertTo)
    {
        this.setOpShaderId(op);
        let callstr = "  ";

        const varname = "var_" + op.getTitle() + "_" + op.shaderId;
        if (convertTo)callstr += ShaderGraph.typeConv(convertTo) + " " + varname + " = ";

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
            if (p.type != CABLES.OP_PORT_TYPE_OBJECT) continue;

            // parameters...
            if (p.isLinked())
            {
                for (let j = 0; j < p.links.length; j++)
                {
                    const otherPort = p.links[j].getOtherPort(p);
                    paramStr = this._getPortParamStr(otherPort, p.uiAttribs.objType);

                    // console.log("objtype", p.uiAttribs.objType);
                    this.addOpShaderFuncCode(otherPort.parent);
                }
            }
            else
            {
                this.addOpShaderFuncCode(p.parent);
                // if (p.uiAttribs.objType == "sg_sampler2D")
                // {
                //     // callstr = "vec4(1.0)";
                //     // break;
                //     // paramStr = "null";
                //     // break;
                // }
                // else
                // {
                paramStr = ShaderGraph.getDefaultParameter(p.uiAttribs.objType);
                // }
            }

            if (p.parent.shaderCodeOperator)
            {
                callstr += paramStr;
                if (count < numObjectPorts - 1) callstr += " " + p.parent.shaderCodeOperator + " ";
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
            if (op.portsIn[i].type == CABLES.OP_PORT_TYPE_OBJECT)
                count++;
        return count;
    }


    _getPortParamStr(p, convertTo)
    {
        let paramStr = "";

        if (p.parent.shaderVar)
        {
            paramStr = p.parent.shaderVar;
        }
        else
        if (p.direction == CABLES.PORT_DIR_OUT)
        {
            paramStr += this.callFunc(p.parent, p.uiAttribs.objType);
        }

        if (convertTo && convertTo != p.uiAttribs.objType)
        {
            paramStr = ShaderGraph.convertTypes(convertTo, p.uiAttribs.objType, paramStr);
        }

        return paramStr;
    }

    compile(port, type)
    {
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
            callSrc += this.callFunc(lnk.getOtherPort(port).parent) + ";".endl();
        }

        callSrc = this._callFuncStack.join("\n");

        let src = "".endl() +
            "{{MODULES_HEAD}}".endl().endl();

        // todo use shader attrib system...
        if (type == "frag") src += "IN vec2 texCoord;".endl().endl();
        if (type == "vert") src += "IN vec3 vPosition;".endl() +
                "IN vec2 attrTexCoord;".endl() +
                "OUT vec2 texCoord;".endl().endl();

        if (type == "vert")src += "".endl() +
                "UNI mat4 projMatrix;".endl().endl() +
                "UNI mat4 viewMatrix;".endl().endl() +
                "UNI mat4 modelMatrix;".endl().endl();

        src +=
            this._headUniSrc.endl().endl() +
            this._headFuncSrc.endl().endl() +

            "void main()".endl() +
            "{".endl();

        if (type == "frag")src += "  {{MODULE_BEGIN_FRAG}}".endl();
        if (type == "vert")src += "  {{MODULE_BEGIN_VERTEX}}".endl();

        src += callSrc.endl() +
        "}".endl();

        if (type == "frag") this._finalSrcFrag = src;
        if (type == "vert") this._finalSrcVert = src;

        this.emitEvent("compiled");
    }
};

ShaderGraph.convertTypes = function (typeTo, typeFrom, paramStr)
{
    // console.log(typeFrom, " to ", typeTo);

    if (typeTo == "sg_genType") return paramStr;

    if (typeFrom == "sg_texture" && typeTo == "sg_vec3") return paramStr + ".xyz";

    if (typeFrom == "sg_vec4" && typeTo == "sg_vec3") return paramStr + ".xyz";
    if (typeFrom == "sg_vec4" && typeTo == "sg_vec2") return paramStr + ".xy";
    if (typeFrom == "sg_vec4" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec3" && typeTo == "sg_vec2") return paramStr + ".xy";
    if (typeFrom == "sg_vec3" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec2" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec3" && typeTo == "sg_vec4") return "vec4(" + paramStr + ", 0.)";

    if (typeFrom == "sg_vec2" && typeTo == "sg_vec4") return "vec4(" + paramStr + ", 0., 0.)";

    if (typeFrom == "sg_float" && typeTo == "sg_vec2") return "vec2(" + paramStr + "," + paramStr + ")";
    if (typeFrom == "sg_float" && typeTo == "sg_vec3") return "vec3(" + paramStr + "," + paramStr + "," + paramStr + ")";
    if (typeFrom == "sg_float" && typeTo == "sg_vec4") return "vec4(" + paramStr + "," + paramStr + "," + paramStr + ", 0.0)";

    return "/* conversionfail: " + typeFrom + "->" + typeTo + " */";
};

ShaderGraph.getDefaultParameter = function (t)
{
    if (t == "sg_vec4") return "vec4(0., 0., 0., 0.)";
    if (t == "sg_vec3") return "vec3(0., 0., 0.)";
    if (t == "sg_vec2") return "vec2(0., 0.)";
    if (t == "sg_float") return "0.";
    if (t == "sg_genType") return "0.";
    return "/* no default: " + t + "*/";
};

ShaderGraph.typeConv = function (sgtype)
{
    return sgtype.substr(3);
};


ShaderGraph.shaderIdCounter = ShaderGraph.shaderIdCounter || 1;
ShaderGraph.getNewId = () =>
{
    return ++ShaderGraph.shaderIdCounter;
};

export { ShaderGraph };
