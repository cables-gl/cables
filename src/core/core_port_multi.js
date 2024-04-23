import { CONSTANTS } from "./constants.js";
import { Port } from "./core_port.js";



class MultiPort extends Port
{
    constructor(__parent, name, type, uiAttribs)
    {
        super(__parent, name, type, uiAttribs);

        this.ports = [];


        const updateArray = () =>
        {
            const arr = [];
            for (let i = 0; i < this.ports.length; i++)
            {
                arr[i] = this.ports[i];
            }

            console.log("update array");

            this.setRef(arr);
        };

        const updateUi = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                if (i == 0) this.ports[i].setUiAttribs({ "longPort": this.ports.length });
                else this.ports[i].setUiAttribs({ "longPort": 0 });
            }

            console.log(this.ports);
        };

        function countPorts()
        {
            console.log("ports.length", this.ports.length);

            if (this.ports[this.ports.length - 1].isLinked())
            {
                const po = this.newPort();
                this.ports.push(po);
                this.op.addInPort(po);
            }
            updateArray();
            updateUi();
        }

        this.newPort = () =>
        {
            const po = new Port(this, name + "_" + CABLES.shortId(), type, {
                "type": "string"
            });
            po.direction = CONSTANTS.PORT_DIR_IN;

            po.on("change", updateArray.bind(this));
            po.onLinkChanged = countPorts.bind(this);

            updateUi();
            return po;
        };

        this.initPorts = () =>
        {
            for (let i = 0; i < 2; i++)
            {
                const po = this.newPort();
                this.ports.push(po);
                this.op.addInPort(po);
            }
            updateArray();
            updateUi();
        };
    }
}



export { MultiPort };
