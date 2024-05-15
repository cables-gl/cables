import { CONSTANTS } from "./constants.js";
import { Port } from "./core_port.js";

const MIN_NUM_PORTS = 2;

class MultiPort extends Port
{
    constructor(__parent, name, type, dir, uiAttribs)
    {
        super(__parent, name, CONSTANTS.OP.OP_PORT_TYPE_ARRAY, uiAttribs);

        this.uiAttribs.multiPortNum = this.uiAttribs.multiPortNum || MIN_NUM_PORTS;
        this.setUiAttribs({ "multiPort": true, "group": this.name, "order": -1 });
        this.ports = [];
        this.direction = dir;

        const updateArray = () =>
        {
            const arr = [];
            for (let i = 0; i < this.ports.length - 1; i++)
            {
                arr[i] = this.ports[i];
            }

            this.setRef(arr);
        };





        const updateUi = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                let lp; // undefined to remove/not set it
                let opacity;// undefined to remove/not set it
                let grey;// undefined to remove/not set it

                if (!this.uiAttribs.editable)grey = true;
                if (i == 0) lp = this.ports.length;
                if (i == this.ports.length - 1)
                {
                    opacity = 0.2;
                    grey = true;
                }

                this.ports[i].setUiAttribs({ "longPort": lp, "opacity": opacity, "greyout": grey, "group": this.name });
            }
        };

        this.removeInvalidPorts = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                if (!this.ports[i]) this.ports.splice(i, 1);
            }
        };

        this.countPorts = () =>
        {
            if (gui.patchView.patchRenderer.isDraggingPort())
            {
                clearTimeout(this.retryTo);
                this.retryTo = setTimeout(this.countPorts.bind(this));
                return;
            }
            this.retryTo = null;

            let redo = false;
            this.removeListeners();
            this.removeInvalidPorts();

            for (let i = 0; i < this.ports.length; i++)
            {
                if (this.ports[i] && this.ports[i].links.length > 1)
                {
                    const po = this.ports[i + 1];
                    const otherPort = this.ports[i].links[0].getOtherPort(this.ports[i]);
                    this.ports[i].links[0].remove();
                    this.op.patch.link(this.op, po.name, otherPort.op, otherPort.name);
                    redo = true;
                    break;
                }
            }


            let foundHole = true;
            if (!this.uiAttribs.editable)
                while (foundHole)
                {
                    foundHole = false;
                    for (let i = this.ports.length - 1; i > 0; i--)
                    {
                        if (this.ports[i] && this.ports[i].links.length > 0 && this.ports[i - 1].links.length == 0)
                        {
                            console.log("found hole!");
                            // found hole

                            const otherPort = this.ports[i].links[0].getOtherPort(this.ports[i]);
                            this.ports[i].links[0].remove();

                            const po = this.ports[i - 1];

                            if (po && this.ports[i])
                            {
                                console.log("move ", this.ports[i].name, "to", po.name);

                                this.op.patch.link(this.op, po.name, otherPort.op, otherPort.name);
                                foundHole = true;
                                redo = true;
                                break;
                            }
                        }
                    }
                }

            if (this.ports.length > 2)
            {
                let i = this.ports.length - 1;
                if (!this.uiAttribs.editable)
                {
                    if (this.ports[i].links.length == 0 && this.ports[i - 1].links.length == 0)
                    {
                        this.ports[i].remove();
                        this.ports[i] = null;
                    }
                }
            }
            this.removeInvalidPorts();

            if (this.ports[this.ports.length - 1].isLinked()) this.newPort();

            updateArray();
            updateUi();

            if (redo) this.countPorts();
            else this.addListeners();
        };

        this.removeListeners = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                const po = this.ports[i];
                po.multiPortChangeListener = po.off(po.multiPortChangeListener);
                po.multiLinkChangeListener = po.off(po.multiLinkChangeListener);
            }
        };

        this.addListeners = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                const po = this.ports[i];

                if (po.multiPortChangeListener)po.multiPortChangeListener = po.off(po.multiPortChangeListener);
                po.multiPortChangeListener = po.on("change", updateArray.bind(this));

                if (po.multiPortTriggerListener)po.multiPortTriggerListener = po.off(po.multiPortTriggerListener);
                po.multiPortTriggerListener = po.on("trigger", this.trigger());


                if (po.multiLinkChangeListener)po.multiLinkChangeListener = po.off(po.multiLinkChangeListener);
                po.multiLinkChangeListener = po.on("onLinkChanged", this.countPorts.bind(this));
            }
        };

        this.newPort = () =>
        {
            const attrs = {};
            if (type == CABLES.OP_PORT_TYPE_STRING) attrs.type = "string";
            const po = new Port(this.op, name + "_" + this.ports.length, type, attrs);

            po.direction = dir;
            this.ports.push(po);
            console.log("CONSTANTS.PORT_DIR_OUT", CONSTANTS.PORT.PORT_DIR_OUT, this.direction);
            if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) this.op.addOutPort(po);
            else this.op.addInPort(po);

            po.setInitialValue("");
            this.addListeners();

            updateUi();
            return po;
        };

        this.initPorts = () =>
        {
            for (let i = 0; i < 2; i++) this.newPort();
            updateArray();
            updateUi();
        };

        this.checkNum = () =>
        {
            if (MIN_NUM_PORTS != this.uiAttribs.multiPortNum) this.setUiAttribs({ "editable": true });

            this.uiAttribs.multiPortNum = Math.max(MIN_NUM_PORTS, this.uiAttribs.multiPortNum);

            while (this.ports.length < this.uiAttribs.multiPortNum) this.newPort();
            while (this.ports.length > this.uiAttribs.multiPortNum) if (this.ports[this.ports.length - 1]) this.ports.pop().remove();

            this.removeInvalidPorts();
        };

        this.incDec = (incDir) =>
        {
            this.setUiAttribs({ "multiPortNum": this.uiAttribs.multiPortNum + incDir });
            this.checkNum();
            this.setUiAttribs({ "editable": true });
            updateUi();
        };

        this.on("onUiAttrChange", this.checkNum.bind(this));
        this.checkNum();
    }
}



export { MultiPort };
