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
        this.addPortWatcher();
        this.updateGraph();

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

    updateGraph()
    {

        /* minimalcore:start */
        if (this.op.shaderNode.params)
        {
            for (let i = 0; i < this.op.shaderNode.params.length; i++)
            {
                if (this.op.shaderNode.params[i].port)
                    this.op.shaderNode.params[i].port.setUiAttribs({ "objType": "sg_" + this.op.shaderNode.params[i].type });
            }
            if (this.op.shaderNode.result.port)
                this.op.shaderNode.result.port.setUiAttribs({ "objType": "sg_" + this.op.shaderNode.result.type });
        }

        /* minimalcore:end */

        for (let i = 0; i < this.op.portsOut.length; i++)
        {
            if (this.op.portsOut[i].type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;
            this.op.portsOut[i].setRef({});
        }
    }

}
