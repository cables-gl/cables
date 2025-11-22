import { CONSTANTS } from "cables";

export class ShaderGraphOp
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

        console.log("texs pt", this.parseCode);

        if (src)
            this.parseCode(src);

        this._op.on("onLinkChanged", this.updateGraph.bind(this));
        this.addPortWatcher();
    }

    addPortWatcher()
    {
        for (let i = 0; i < this._op.portsIn.length; i++)
        {
            if (this._op.portsIn[i].type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;

            if (this._op.portsIn[i].uiAttribs.objType && this._op.portsIn[i].uiAttribs.objType.indexOf("sg_") == 0) this._op.portsIn[i].setUiAttribs({ "display": "sg_vec" });

            this._op.portsIn[i].on("change", this.updateGraph.bind(this));
        }
    }

    updateGraph()
    {
        for (let i = 0; i < this._op.portsOut.length; i++)
        {
            if (this._op.portsOut[i].type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;
            // this._op.portsOut[i].setRef(null);
            this._op.portsOut[i].setRef({});
        }
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
