import { CONSTANTS, Op, Port } from "cables";
import { ShaderGraphProgram } from "./shadergraphprogram.js";

export class ShaderGraphOp
{

    /**
     * @param {Op} op
     * @param {import("./shadergraphprogram.js").ShaderNode} shaderNode
     */
    constructor(op, shaderNode)
    {
        op.sgOp = this;
        this.op = op;
        this._inPorts = [];
        this._outPorts = [];
        this._defines = [];
        this.enabled = true;
        this.info = null;

        shaderNode.id = ShaderGraphProgram.getNewId();

        op.shaderNode = shaderNode;
        op.updateGraph = this.updateGraph.bind(this);

        this.op.on("onLinkChanged", this.updateGraph.bind(this));
        this.updateGraph();
        this.addPortWatcher();

    }

    addPortWatcher()
    {
        for (let i = 0; i < this.op.portsIn.length; i++)
        {
            if (this.op.portsIn[i].type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;

            if (this.op.portsIn[i].uiAttribs.objType && this.op.portsIn[i].uiAttribs.objType.indexOf("sg_") == 0)
                this.op.portsIn[i].setUiAttribs({ "display": "sg_vec" });

            this.op.portsIn[i].on("change", this.updateGraph.bind(this));
        }
    }

    getResult(name)
    {
        // console.log("getresult ", name);
        const shaderNode = this.op.shaderNode;
        for (let i = 0; i < shaderNode.results.length; i++)
        {
            if (shaderNode.results[i].name == name) return shaderNode.results[i];
        }

        if (shaderNode.result) return shaderNode.result; // fallback old/deprecated way

    }

    updateGraph()
    {

        /** @type {import("./shadergraphprogram.js").ShaderNode} */
        const shaderNode = this.op.shaderNode;

        if (shaderNode.params)
        {
            for (let i = 0; i < shaderNode.params.length; i++)
            {

                if (!shaderNode.params[i].port)
                {
                    shaderNode.params[i].port = this.op.inObject(shaderNode.params[i].name, null, "sg");
                }

                if (shaderNode.params[i].port)
                    shaderNode.params[i].port.setUiAttribs({ "objType": "sg_" + shaderNode.params[i].type });
            }

        }

        if (shaderNode.result && !shaderNode.results)
        {
            shaderNode.results = [shaderNode.result];
        }

        for (let i = 0; i < shaderNode.results.length; i++)
        {

            if (!shaderNode.results[i].port)
                shaderNode.results[i].port = this.op.outObject(shaderNode.results[i].name, null, "sg");

            if (shaderNode.results[i].port)
                shaderNode.results[i].port.setUiAttribs({ "objType": "sg_" + shaderNode.results[i].type });
        }
        // shaderNode.result.port.setUiAttribs({ "objType": "sg_" + shaderNode.result.type });

        for (let i = 0; i < this.op.portsOut.length; i++)
        {
            if (this.op.portsOut[i].type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;
            this.op.portsOut[i].setRef({});
        }
    }

}
