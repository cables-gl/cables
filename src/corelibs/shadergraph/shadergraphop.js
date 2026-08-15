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
        this._op = op;
        this._inPorts = [];
        this._outPorts = [];
        this._defines = [];
        this.enabled = true;
        this.info = null;

        shaderNode.id = ShaderGraphProgram.getNewId();

        op.shaderNode = shaderNode;

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
            this._op.portsOut[i].setRef({});
        }
    }

}
