class ShaderGraphOp
{
    constructor(op, src)
    {
        op.sgOp = this;
        this._op = op;
        this._inPorts = [];
        this._outPorts = [];
        this._defines = [];
        this.enabled = true;
        this.info = null;

        if (src)
            this.parseCode(src);

        this._op.on("onLinkChanged", this.updateGraph.bind(this));
        this.addPortWatcher();
    }

    addPortWatcher()
    {
        for (let i = 0; i < this._op.portsIn.length; i++)
        {
            if (this._op.portsIn[i].type != CABLES.OP_PORT_TYPE_OBJECT) continue;

            if (this._op.portsIn[i].uiAttribs.objType && this._op.portsIn[i].uiAttribs.objType.indexOf("sg_") == 0) this._op.portsIn[i].setUiAttribs({ "display": "sg_vec" });

            this._op.portsIn[i].on("change", this.updateGraph.bind(this));
        }
    }

    updateGraph()
    {
        for (let i = 0; i < this._op.portsOut.length; i++)
        {
            if (this._op.portsOut[i].type != CABLES.OP_PORT_TYPE_OBJECT) continue;
            // this._op.portsOut[i].setRef(null);
            this._op.portsOut[i].setRef({});
        }
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

    updatePorts(info)
    {
        const foundPortInNames = {};
        this._op.shaderSrc = info.src;

        if (info.functions.length > 0)
        {
            const f = info.functions[info.functions.length - 1];
            this._op.setTitle(f.name);
            this._op.shaderFunc = f.name;

            for (let p = 0; p < f.params.length; p++)
            {
                const port = this._op.getPort(f.params[p].name) || this._op.inObject(f.params[p].name);

                // let changed = false;
                // if (port.uiAttribs.objType != f.params[p].type) changed = true;
                port.setUiAttribs({ "objType": "sg_" + f.params[p].type, "ignoreObjTypeErrors": true });
                // if (changed) port.setRef(port.get());

                this._inPorts.push(port);

                foundPortInNames[f.params[p].name] = true;
            }

            let port = this._op.getPort("Result");
            if (!port)
            {
                port = this._op.outObject("Result");
                this._outPorts.push(port);
            }

            // let changed = false;
            // if (port.uiAttribs.objType != f.type) changed = true;
            port.setUiAttribs({ "objType": "sg_" + f.type });
            // if (changed) port.setRef(port.get());
        }

        for (let i = 0; i < this._inPorts.length; i++) if (!foundPortInNames[this._inPorts[i].name]) this._inPorts[i].remove();

        this.addPortWatcher();
        this._op.refreshParams();
    }

    /**
 * add a define to a shader, e.g.  #define DO_THIS_THAT 1
 * @function define
 * @memberof Shader
 * @instance
 * @param {String} name
 * @param {Any} value (can be empty)
 */
    define(name, value)
    {
        if (value === null || value === undefined) value = "";

        if (typeof (value) == "object") // port
        {
            value.removeEventListener("change", value.onDefineChange);
            value.onDefineChange = (v) =>
            {
                this.define(name, v);
            };
            value.on("change", value.onDefineChange);

            value = value.get();
        }

        for (let i = 0; i < this._defines.length; i++)
        {
            if (this._defines[i][0] == name && this._defines[i][1] == value) return;
            if (this._defines[i][0] == name)
            {
                this._defines[i][1] = value;
                // this.setWhyCompile("define " + name + " " + value);

                // this._needsRecompile = true;
                return;
            }
        }
        // this.setWhyCompile("define " + name + " " + value);
        // this._needsRecompile = true;
        this._defines.push([name, value]);
        this.updateGraph();
    }

    getDefines()
    {
        return this._defines;
    }

    getDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
            if (this._defines[i][0] == name) return this._defines[i][1];
        return null;
    }

    /**
  * return true if shader has define
  * @function hasDefine
  * @memberof Shader
  * @instance
  * @param {String} name
  * @return {Boolean}
  */
    hasDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
            if (this._defines[i][0] == name) return true;
    }

    /**
  * remove a define from a shader
  * @param {name} name
  * @function removeDefine
  * @memberof Shader
  * @instance
  */
    removeDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
        {
            if (this._defines[i][0] == name)
            {
                this._defines.splice(i, 1);
                // this._needsRecompile = true;

                // this.setWhyCompile("define removed:" + name);
                this.updateGraph();
                return;
            }
        }
    }

    toggleDefine(name, enabled)
    {
        if (enabled) this.define(name);
        else this.removeDefine(name);
        this.updateGraph();
    }
}

ShaderGraphOp.getMaxGenTypeFromPorts = (ports, portsSetType) =>
{
    const types = ["sg_float", "sg_vec2", "sg_vec3", "sg_vec4"];
    let typeIdx = 0;

    for (let j = 0; j < ports.length; j++)
        for (let i = 0; i < ports[j].links.length; i++)
        {
            const t = types.indexOf(ports[j].links[i].getOtherPort(ports[j]).uiAttribs.objType);
            typeIdx = Math.max(typeIdx, t);
        }

    const t = types[typeIdx];

    if (portsSetType)
        for (let i = 0; i < portsSetType.length; i++)
            portsSetType[i].setUiAttribs({ "objType": t });

    return t;
};

export { ShaderGraphOp };
