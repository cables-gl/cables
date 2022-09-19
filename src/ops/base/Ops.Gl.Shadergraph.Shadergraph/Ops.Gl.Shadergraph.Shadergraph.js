const inFunc = op.inObject("Fragment", null, "sg_func");
const inCompile = op.inTriggerButton("Compile");
const outshader = op.outObject("Shader");
const outSrcFrag = op.outString("Source Fragment");

inCompile.onTriggered =
inFunc.onChange = compile;

let opIdsHeadSrc = {};
let headSrc = "";

CABLES.shaderIdCounter = CABLES.shaderIdCounter || 1;

function replaceId(op, txt)
{

    if (!op.shaderId)
    {
        op.shaderId = CABLES.shaderIdCounter;
        CABLES.shaderIdCounter++;
    }
    return txt.replaceAll("_ID", "_" + op.shaderId);
}

function addOpShaderFuncCode(op)
{
    if (opIdsHeadSrc[op.id])
    {
        // console.log("already exist",op.name,op.id);
        return;
    }
    opIdsHeadSrc[op.id] = true;

    if (op.shaderSrc)
    {
        let src = op.shaderSrc.endl();//+"/* "+op.id+" */".endl();;
        src = replaceId(op, src);

        // console.log(src);
        headSrc += src;
    }
}

function convertTypes(typeTo, typeFrom, paramStr)
{
    console.log(typeFrom, " to ", typeTo);

    if (typeTo == "sg_genType") return paramStr;

    if (typeFrom == "sg_vec4" && typeTo == "sg_vec3") return paramStr + ".xyz";
    if (typeFrom == "sg_vec4" && typeTo == "sg_vec2") return paramStr + ".xy";
    if (typeFrom == "sg_vec4" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec3" && typeTo == "sg_vec2") return paramStr + ".xy";
    if (typeFrom == "sg_vec3" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec2" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec3" && typeTo == "sg_vec4") return "vec4(" + paramStr + ",1.)";

    if (typeFrom == "sg_vec2" && typeTo == "sg_vec4") return "vec4(" + paramStr + ",1.,1.)";

    if (typeFrom == "sg_float" && typeTo == "sg_vec2") return "vec2(" + paramStr + "," + paramStr + ")";
    if (typeFrom == "sg_float" && typeTo == "sg_vec3") return "vec3(" + paramStr + "," + paramStr + "," + paramStr + ")";
    if (typeFrom == "sg_float" && typeTo == "sg_vec4") return "vec4(" + paramStr + "," + paramStr + "," + paramStr + ",1.0)";

    return "/* conversionfail: " + typeFrom + "->" + typeTo + " */";
}

function getDefaultParameter(t)
{
    if (t == "sg_vec4") return "vec4(1., 1., 1., 1.)";
    if (t == "sg_vec3") return "vec3(1., 1., 1.)";
    if (t == "sg_vec2") return "vec2(1., 1.)";
    if (t == "sg_float") return "1.";
    if (t == "sg_genType") return "1.";
    return "/* no default: "+t+"*/";
}

function getPortParamStr(p, convertTo)
{
    if (p.parent.shaderVar)
    {
        return p.parent.shaderVar;
    }

    let paramStr = "";

    if (p.direction == CABLES.PORT_DIR_OUT)
    {
        paramStr += callFunc(p.parent);
    }

    if (convertTo && convertTo != p.uiAttribs.objType)
    {
        console.log("convertTo", convertTo, "from", p.uiAttribs.objType);
        paramStr = convertTypes(convertTo, p.uiAttribs.objType, paramStr);
    }

    return paramStr;
}

function callFunc(op, convertTo)
{
    let callstr = " " + replaceId(op, op.shaderFunc) + "(";

    addOpShaderFuncCode(op);

    for (let i = 0; i < op.portsIn.length; i++)
    {
        let paramStr = "";
        const p = op.portsIn[i];
        if (p.uiAttribs.objType == "sg_void") continue;

        // parameters...
        if (p.isLinked())
        {
            for (let i = 0; i < p.links.length; i++)
            {
                const otherPort = p.links[i].getOtherPort(p);
                paramStr = getPortParamStr(otherPort, p.uiAttribs.objType);
                addOpShaderFuncCode(otherPort.parent);
            }
        }
        else
        {
            addOpShaderFuncCode(p.parent);
            paramStr = getDefaultParameter(p.uiAttribs.objType);
        }

        if (paramStr)
        {
            callstr += paramStr;
            if (i < op.portsIn.length - 1)callstr += ",";
        }
    }

    callstr += ") ";

    return callstr;
}

function compile()
{
    const l = inFunc.links;
    console.log(l);

    opIdsHeadSrc = {};
    headSrc = "";
    let callSrc = "";

    for (let i = 0; i < l.length; i++)
    {
        const lnk = l[i];
        callSrc+= callFunc(lnk.getOtherPort(inFunc).parent) + ";".endl();
    }

    const src = "".endl() +
        "{{MODULES_HEAD}}".endl() +
        "IN vec2 texCoord;".endl().endl() +
        headSrc.endl().endl() +

        "void main()".endl() +
        "{".endl() +
        "{{MODULE_BEGIN_FRAG}}".endl()+

        callSrc.endl() +
        "}".endl();

    outSrcFrag.set(src);
}
