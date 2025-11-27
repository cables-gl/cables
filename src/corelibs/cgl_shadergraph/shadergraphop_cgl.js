import { CONSTANTS } from "cables";
import { ShaderGraphOp } from "./shadergraphop.js";

export class ShaderGraphOpCgl extends ShaderGraphOp
{
    constructor(op, src)
    {
        super(op, src);
    }

    isTypeDef(str)
    {
        return str == "void" || str == "float" || str == "sampler2D" || str == "vec2" || str == "vec3" || str == "vec4" || str == "void" || str == "mat4" || str == "mat3" || str == "mat2" || str == "out";
    }

    parseCode(_code)
    {
        let code = _code;
        let info = { "functions": [], "uniforms": [] };

        const origLines = code.split("\n");
        const prelines = code.split("\n");

        for (let i = 0; i < prelines.length; i++)
            prelines[i] += "###line:" + i + ":###";

        code = prelines.join("\n");

        code = code.replaceAll("{{", ""); // remove spaces before brackets
        code = code.replaceAll("}}", ""); // remove spaces before brackets

        // code = code.replaceAll(/\/\*[\s\S]*?\*\/|\/\/.*/g, ""); // remove comments
        // code = code.replaceAll(/{[^{}]*}/g, "{}"); // remove function content
        code = code.replaceAll("\n{", "{");
        code = code.replaceAll(";", " ;"); // add spaces for better splitting
        // code = code.replaceAll("{", "{"); // remove spaces before brackets
        code = code.replaceAll("(", " ( "); // add spaces for better splitting
        code = code.replaceAll(")", " ) "); // add spaces for better splitting
        code = code.replaceAll(",", " , "); // add spaces for better splitting
        code = code.replace(/ +(?= )/g, ""); // remove double whitespaces

        // console.log(origLines);

        const lines = code.split("\n");

        // console.log(lines);

        for (let i = 0; i < lines.length; i++)
        {
            // identify function
            if (lines[i].indexOf("{") > 0 && lines[i].indexOf("(") > 0 && lines[i].indexOf(")") > 0)
            {
                const words = lines[i].split(" ");

                if (this.isTypeDef(words[0])) // function header start with return typedef
                {
                    // merge all the remaining lines to be able to search for the end of the function ...
                    let remainingcode = "";
                    for (let j = i; j < lines.length; j++) remainingcode += lines[j];

                    // search for all {} and find the end of the function body...
                    const startPos = remainingcode.indexOf("{");
                    let count = 0;
                    let cc = 0;
                    for (cc = startPos; cc < remainingcode.length; cc++)
                    {
                        if (remainingcode.charAt(cc) == "{") count++;
                        if (remainingcode.charAt(cc) == "}") count--;
                        if (count == 0) break;
                    }

                    // console.log("remainingcode", remainingcode);
                    // parse the first and last line numbers
                    let functioncode = remainingcode.substring(0, cc + 1);
                    const linenums = functioncode.split("###line:");

                    // console.log("functioncode", functioncode);
                    // console.log("linenums", linenums);

                    let lineNumStart = i, lineNumEnd = i - 1;
                    if (linenums.length > 1)
                    {
                        lineNumStart = parseInt(linenums[1].split(":")[0]);
                        lineNumEnd = parseInt(linenums[linenums.length - 1].split(":")[0]);
                    }

                    functioncode = "";

                    // concat the whole function
                    for (let j = lineNumStart; j <= lineNumEnd + 1; j++)
                        if (origLines[j])functioncode += origLines[j] + "\n";

                    const infoFunc = { "name": words[1], "type": words[0], "params": [], "src": functioncode };
                    infoFunc.uniqueName = words[0] + "_" + words[1];

                    // analyze function head and read all parameters
                    words.length = words.indexOf(")") + 1;
                    for (let j = 3; j < words.length - 2; j += 3)
                    {
                        infoFunc.params.push({ "name": words[j + 1], "type": words[j] });
                        infoFunc.uniqueName += "_" + words[j + 0] + "_" + words[j + 1];
                    }

                    info.functions.push(infoFunc);
                }
            }

            if (lines[i].indexOf("UNI") == 0 || lines[i].indexOf("uniform") == 0)
            {
                const words = lines[i].split(" ");
                if (this.isTypeDef(words[1])) info.uniforms.push({ "name": words[2], "type": words[1] });
            }
        }

        info.src = _code;
        // if (this._op.uiAttribs.comment)_code = "//" + this._op.uiAttribs.comment + "\n" + _code;

        this.info = info;
        this.updatePorts(this.info);

        return info;
    }

}
