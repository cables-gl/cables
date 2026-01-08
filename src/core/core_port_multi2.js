import { Logger } from "cables-shared-client";
import { CONSTANTS } from "./constants.js";
import { Patch } from "./core_patch.js";
import { Port } from "./core_port.js";

export class MultiPort2 extends Port
{

    /**
     * @param {import("./core_op.js").Op<any>} __parent
     * @param {string} name
     * @param {number} type
     * @param {number} dir
     * @param {import("./core_port.js").PortUiAttribs} uiAttribs
     * @param {import("./core_port.js").PortUiAttribs} [uiAttribsPorts]
     */
    constructor(__parent, name, type, dir, uiAttribs, uiAttribsPorts, minNumPorts = 1)
    {
        super(__parent, name, Port.TYPE_ARRAY, uiAttribs);

        this._log = new Logger("multiport2");
        this.setUiAttribs({ "multiPort2": true, "multiPort": true, "group": this.name, "order": -1, "multiPortManual": true });
        this.minNumPorts = minNumPorts;

        /** @type {Port[]} */
        this.ports = [];
        this.direction = dir;
        this._uiAttribsPorts = uiAttribsPorts;

        const updateArray = () =>
        {
            const arr = [];

            let ll = 1;// do not include addport

            for (let i = 0; i < this.ports.length - ll; i++)
                arr[i] = this.ports[i];

            this.setRef(arr);
        };

        const updateUi = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                let lp; // undefined to remove/not set it
                let addPort = false;
                let title;
                let grey = false;
                let o = {};

                if (this.op.preservedPortTitles && this.op.preservedPortTitles[this.ports[i].name]) title = this.op.preservedPortTitles[this.ports[i].name];
                if (i == 0) lp = this.ports.length;

                if (i == this.ports.length - 1)
                {
                    title = "add port";
                    addPort = true;
                    grey = true;
                }

                for (const attin in this._uiAttribsPorts)
                    o[attin] = this._uiAttribsPorts[attin];

                o.addPort = addPort;
                o.longPort = lp;
                o.title = title;
                o.greyout = grey;
                o.group = this.name;

                this.ports[i].setUiAttribs(o);
            }
        };

        this.removeInvalidPorts = () =>
        {

            for (let i = 0; i < this.ports.length; i++)
                if (!this.ports[i]) this.ports.splice(i, 1);

            updateArray();
        };

        this.countPorts = () =>
        {

            /* minimalcore:start */
            const gui = Patch.getGui();
            if (CABLES.UI && !gui.isRemoteClient && gui.patchView && gui.patchView.patchRenderer && gui.patchView.patchRenderer.isDraggingPort())
            {
                clearTimeout(this.retryTo);
                this.retryTo = setTimeout(this.countPorts.bind(this));
                return;
            }

            /* minimalcore:end */
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

                    if (!po || !otherPort)
                    {
                        this._log.warn("no port found?");
                    }
                    else
                    {
                        this.ports[i].links[0].remove();
                        this.op.patch.link(this.op, po.name, otherPort.op, otherPort.name);
                        redo = true;
                    }
                    break;
                }
            }

            const idxLastPort = this.ports.length - 1;

            if (this.ports.length >= 1 && this.ports[idxLastPort].uiAttribs.addPort && this.ports[idxLastPort].isLinked())
            {
                this.newPort();
                this.setUiAttribs({ "multiPortNum": this.ports.length });
            }

            this.removeInvalidPorts();

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
                if (po.multiPortChangeListener) po.multiPortChangeListener = po.off(po.multiPortChangeListener);
                if (po.multiLinkChangeListener) po.multiLinkChangeListener = po.off(po.multiLinkChangeListener);
            }
        };

        this.addListeners = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                const po = this.ports[i];
                const idx = i;

                if (po.multiPortChangeListener)po.multiPortChangeListener = po.off(po.multiPortChangeListener);
                po.multiPortChangeListener = po.on("change", updateArray.bind(this));

                if (po.multiPortTriggerListener)po.multiPortTriggerListener = po.off(po.multiPortTriggerListener);
                po.multiPortTriggerListener = po.on("trigger", () => { this._onTriggered(idx); });

                if (po.multiLinkChangeListener)po.multiLinkChangeListener = po.off(po.multiLinkChangeListener);
                po.multiLinkChangeListener = po.on("onLinkChanged", () =>
                {
                    this.countPorts();
                    this.emitEvent("onLinkChanged");
                });

                if (po.multiLinkRemoveListener)po.multiLinkRemoveListener = po.off(po.multiLinkRemoveListener);
                po.multiLinkRemoveListener = po.on("onLinkRemoved", () =>
                {
                    updateUi();
                    this.countPorts();
                    this.emitEvent("onLinkChanged");
                });
            }
        };

        this.newPort = (reason) =>
        {

            /** @type {import("./core_port.js").PortUiAttribs} */
            const attrs = {};
            // if (type == CABLES.OP_PORT_TYPE_STRING) attrs.type = "string";
            attrs.type = type;
            const po = this.op.newPort(this.op, name + "_" + this.ports.length, type, attrs);

            po.direction = dir;

            if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) this.op.addOutPort(po);
            else this.op.addInPort(po, this.ports[this.ports.length - 1]);
            this.ports.push(po);

            if (type == Port.TYPE_NUMBER) po.setInitialValue(0);
            else if (type == Port.TYPE_STRING) po.setInitialValue("");

            this.addListeners();

            updateUi();
            updateArray();
            this.emitEvent("onLinkChanged");

            if (this.op.preservedPortTitles && this.op.preservedPortTitles[po.name]) po.setUiAttribs({ "title": this.op.preservedPortTitles[po.name] });

            return po;
        };

        this.initPorts = () =>
        {
            while (this.ports.length < this.minNumPorts) this.newPort("init" + this.minNumPorts);
            updateArray();
            updateUi();
        };

        this.checkNum = () =>
        {
            this.uiAttribs.multiPortNum ||= this.minNumPorts;
            this.uiAttribs.multiPortNum = Math.max(this.minNumPorts, this.uiAttribs.multiPortNum);

            while (this.ports.length < this.uiAttribs.multiPortNum) this.newPort("checknum");
            while (this.ports.length > this.uiAttribs.multiPortNum) if (this.ports[this.ports.length - 1]) this.ports.pop().remove();

            this.removeInvalidPorts();
            if (this.ports.length > 1 && this.ports[this.ports.length - 1].uiAttribs.addPort && this.ports[this.ports.length - 1].isLinked())
            {
                this.ports[this.ports.length - 1].removeLinks();
            }
        };

        this.incDec = (incDir) =>
        {
            this.uiAttribs.multiPortNum = this.uiAttribs.multiPortNum || this.minNumPorts;
            this.setUiAttribs({ "multiPortNum": this.uiAttribs.multiPortNum + incDir });
            this.checkNum();

            updateUi();
        };

        this.on("onUiAttrChange", this.checkNum.bind(this));
        this.checkNum();
        this.countPorts();
        this.removeInvalidPorts();
        updateUi();
    }
}
