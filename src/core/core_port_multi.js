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

                // console.log("update array", this.ports[i].getSerialized);
            }

            this.setRef(arr);
        };

        const updateUi = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                if (i == 0) this.ports[i].setUiAttribs({ "longPort": this.ports.length });
                else this.ports[i].setUiAttribs({ "longPort": 0 });
            }

            // console.log(this.ports);
        };


        function countPorts()
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                if (this.ports[i].links.length > 1)
                {
                    const po = this.ports[i + 1];
                    const otherPort = this.ports[i].links[0].getOtherPort(this.ports[i]);
                    this.ports[i].links[0].remove();
                    this.op.patch.link(this.op, po.name, otherPort.op, otherPort.name);

                    break;
                }
            }



            let foundHole = true;
            while (foundHole)
            {
                foundHole = false;
                for (let i = this.ports.length - 1; i > 0; i--)
                {
                    if (this.ports[i].links.length > 0 && this.ports[i - 1].links.length == 0)
                    {
                        console.log("found hole!");
                        // found hole

                        const otherPort = this.ports[i].links[0].getOtherPort(this.ports[i]);
                        this.ports[i].links[0].remove();

                        const po = this.ports[i - 1];

                        console.log("move ", this.ports[i].name, "to", po.name);

                        this.op.patch.link(this.op, po.name, otherPort.op, otherPort.name);
                        foundHole = true;
                        break;
                    }
                }
            }


            if (this.ports[this.ports.length - 1].isLinked())
            {
                const po = this.newPort();
            }
            updateArray();
            updateUi();
        }

        this.newPort = () =>
        {
            const po = new Port(this.op, name + "_" + this.ports.length, type, {
                "type": "string"
            });

            po.direction = CONSTANTS.PORT_DIR_IN;
            this.ports.push(po);
            this.op.addInPort(po);

            po.setInitialValue("");
            po.on("change", updateArray.bind(this));
            po.on("onLinkChanged", countPorts.bind(this));

            updateUi();
            return po;
        };

        this.initPorts = () =>
        {
            for (let i = 0; i < 2; i++)
            {
                const po = this.newPort();
            }
            updateArray();
            updateUi();
        };
    }
}



export { MultiPort };
