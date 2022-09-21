class ShaderGraphOp
{
    constructor(op, srcFrag)
    {
        this._op = op;
        op.sgOp = this;
        this._inPorts = [];
        this._outPorts = [];
        this._defines = [];
        if (srcFrag)
        {
            const info = this.parseCode(srcFrag);
            this.updatePorts(info);
        }

        this._op.on("onLinkChanged", this.sendOutPing.bind(this));
        this.addPortWatcher();
    }

    addPortWatcher()
    {
        for (let i = 0; i < this._op.portsIn.length; i++)
        {
            if (this._op.portsIn[i].type != CABLES.OP_PORT_TYPE_OBJECT) continue;
            // this._op.portsIn[i].onLinkChanged = this.sendOutPing.bind(this);
            this._op.portsIn[i].onChange = this.sendOutPing.bind(this);
        }
    }

    sendOutPing()
    {
        // console.log("sendoutping", this._op.portsOut.length);
        for (let i = 0; i < this._op.portsOut.length; i++)
        {
            if (this._op.portsOut[i].type != CABLES.OP_PORT_TYPE_OBJECT) continue;
            this._op.portsOut[i].set(null);
            this._op.portsOut[i].set({});
        }
    }

    isTypeDef(str)
    {
        return str == "void" || str == "float" || str == "vec2" || str == "vec3" || str == "vec4" || str == "void" || str == "mat4" || str == "mat3" || str == "mat2";
    }

    parseCode(_code)
    {
        let code = _code;

        let info = { "functions": [], "uniforms": [] };

        code = code.replaceAll("{{", ""); // remove spaces before brackets
        code = code.replaceAll("}}", ""); // remove spaces before brackets

        code = code.replaceAll(/\/\*[\s\S]*?\*\/|\/\/.*/g, ""); // remove comments
        code = code.replaceAll(/{[^{}]*}/g, "{}"); // remove function content
        code = code.replaceAll("\n{}", "{}");
        code = code.replaceAll(";", " ;"); // add spaces for better splitting
        code = code.replaceAll(" {", "{"); // remove spaces before brackets
        code = code.replaceAll("(", " ( "); // add spaces for better splitting
        code = code.replaceAll(")", " ) "); // add spaces for better splitting
        code = code.replaceAll(",", " , "); // add spaces for better splitting
        code = code.replace(/ +(?= )/g, ""); // remove double whitespaces

        const lines = code.split("\n");

        console.log(lines);

        for (let i = 0; i < lines.length; i++)
        {
            if (lines[i].indexOf("{}") > 0 &&
                lines[i].indexOf("(") > 0 &&
                lines[i].indexOf(")") > 0)
            {
                const words = lines[i].split(" ");

                if (this.isTypeDef(words[0]))
                {
                    const infoFunc = { "name": words[1], "type": words[0], "params": [] };
                    info.functions.push(infoFunc);

                    for (let j = 3; j < words.length - 2; j += 3)
                        infoFunc.params.push({ "name": words[j + 1], "type": words[j] });
                }
            }

            if (lines[i].indexOf("UNI") == 0 || lines[i].indexOf("uniform") == 0)
            {
                const words = lines[i].split(" ");
                if (this.isTypeDef(words[1]))
                {
                    info.uniforms.push({ "name": words[2], "type": words[1] });
                }
            }
        }

        info.src = _code;
        console.log(info);
        return info;
    }


    updatePorts(info)
    {
        const foundPortInNames = {};
        this._op.shaderSrc = info.src;

        if (info.functions.length > 0)
        {
            const f = info.functions[0];
            this._op.setTitle(f.name);
            this._op.shaderFunc = f.name;

            for (let p = 0; p < f.params.length; p++)
            {
                const port = this._op.getPort(f.params[p].name) || this._op.inObject(f.params[p].name);

                port.setUiAttribs({ "objType": "sg_" + f.params[p].type });

                this._inPorts.push(port);

                foundPortInNames[f.params[p].name] = true;
            }


            let port = this._op.getPort("Result");
            if (!port)
            {
                port = this._op.outObject("Result");
                this._outPorts.push(port);
            }
            port.setUiAttribs({ "objType": "sg_" + f.type });
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
        this.sendOutPing();
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
                this.sendOutPing();
                return;
            }
        }
    }

    toggleDefine(name, enabled)
    {
        if (enabled) this.define(name);
        else this.removeDefine(name);
        this.sendOutPing();
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
