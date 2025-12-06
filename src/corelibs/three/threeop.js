import { Events } from "cables-shared-client";
import { ThreeRenderer } from "./threerenderer.js";

export class ThreeOp extends Events
{

    /** @type {Op} */
    #op;
    #lastTrigger = -1;

    /** @type {Object3D} */
    #currentParent = null;

    /** @type {Object3D} */
    #object = null;

    /** @type {ThreeRenderer} */
    #renderer = null;
    isInScene = false;

    /**
     * @param {Op} op
     */
    constructor(op)
    {
        super();
        this.#op = op;
        op.threeOp = this;
        op.onDelete = () =>
        {
            console.log("ondeleteeeeeeeeee");
            this.remove();
        };

    }

    get lastTrigger()
    {
        return this.#lastTrigger;
    }

    get renderer()
    {
        return this.#renderer || this.#op.patch?.cg?.frameStore?.three.renderer;
    }

    /**
     * @param {any} object
     */
    setSceneObject(object)
    {
        this.remove();
        this.#object = object;
        object.userData.op = this.#op.id;
    }

    push(asParent = true)
    {
        const parentObject = this.#op.patch.cg.frameStore.three.renderer.currentObject;
        if (!parentObject) return;

        /** @type {ThreeRenderer} */
        this.#renderer = this.#op.patch.cg.frameStore.three.renderer;
        if (!this.#renderer) return;

        if (this.#currentParent != parentObject)
            this.remove();

        if (this.#currentParent === null)
        {
            this.#currentParent = parentObject;
            if (this.#object)parentObject.add(this.#object);

            this.#renderer.add(this);
        }

        this.#lastTrigger = this.#op.patch.cg.frameStore.three.frame;
        if (this.#object)
        {
            this.#object.material = this.#renderer.currentMaterial;
            if (asParent) this.#renderer.pushObject(this.#object);
        }
    }

    pop()
    {

        /** @type {ThreeRenderer} */
        this.#renderer = this.#op.patch.cg.frameStore.three.renderer;
        this.#renderer.popObject();

    }

    remove()
    {

        // console.log("text", this.#currentScene, this.#object);
        if (this.#currentParent)
        {
            this.#currentParent.remove(this.#object);
            this.#currentParent = null;

            console.log("remove from scene...");
        }
        this.emitEvent("inactive");
        this.isInScene = false;
    }

    /**
     * @param {Op} op
     * @param {Object3D} object
     * @param {string} paramName
     * @param {boolean} defaultValue
     * @param {Object} options
     */
    static bindBool(op, object, paramName, defaultValue, options = {})
    {
        op.threeBinds = op.threeBinds || {};

        const a = op.threeBinds[paramName] || {
            "in": op.inBool(paramName, defaultValue),
            "options": options
        };
        op.threeBinds[paramName] = a;

        function update()
        {
            object[paramName] = !!a.in.get();
            if (a.options.needsUpdate) object.needsUpdate = true;
        }

        a.in.onChange = update;

        update();
    }

    /**
     * @param {Op} op
     * @param {Object3D} object
     * @param {string} paramName
     * @param {object} defaultValue
     * @param {Object} options
     */
    static bindObject(op, object, paramName, objType, options = {})
    {
        op.threeBinds = op.threeBinds || {};

        const a = op.threeBinds[paramName] || {
            "in": op.inObject(paramName, null, objType),
            "options": options
        };
        op.threeBinds[paramName] = a;

        function update()
        {
            object[paramName] = a.in.get();
            if (a.options.needsUpdate) object.needsUpdate = true;
        }

        a.in.onChange = update;

        update();
    }

    /**
     * @param {Op} op
     * @param {Object3D} object
     * @param {string} paramName
     * @param {boolean} defaultValue
     * @param {Object} options
     */
    static bindFloat(op, object, paramName, defaultValue, options = {})
    {
        op.threeBinds = op.threeBinds || {};

        const a = op.threeBinds[paramName] || {
            "in": op.inFloat(paramName, defaultValue),
            "options": options
        };
        op.threeBinds[paramName] = a;

        function update()
        {
            object[paramName] = a.in.get();
            if (a.options.needsUpdate) object.needsUpdate = true;
        }

        a.in.onChange = update;

        update();
    }

    /**
     * @param {Op} op
     * @param {Object3D} object
     * @param {string} paramName
     * @param {Object} options
     */
    static bindColor(op, object, paramName, options = {})
    {
        op.threeBinds = op.threeBinds || {};

        const values = [1, 1, 1, 1];
        if (options.values == "random")
        {
            values[0] = Math.random();
            values[1] = Math.random();
            values[2] = Math.random();
            values[3] = 1;
        }
        if (options.values == "0")
        {
            values[0] = values[1] = values[2] = 0;
        }

        const a = op.threeBinds[paramName] || {
            "inR": op.inFloatSlider(paramName + " R", values[0]),
            "inG": op.inFloatSlider(paramName + " G", values[1]),
            "inB": op.inFloatSlider(paramName + " B", values[2]),
            "inA": op.inFloatSlider(paramName + " A", values[3]),
        };

        a.inR.setUiAttribs({ "colorPick": true });
        if (op.threeBinds[paramName])
        {
            // unbind ?s
        }

        op.threeBinds[paramName] = a;

        function update()
        {
            object[paramName].set(a.inR.get(), a.inG.get(), a.inB.get(), a.inA.get());

        }

        a.inR.onChange =
        a.inG.onChange =
        a.inB.onChange =
        a.inA.onChange = update;

        update();
    }

    /**
     * @param {Op} op
     * @param {Object3D} object
     * @param {string} paramName
     * @param {Object} options
     */
    static bindVec(op, object, paramName, options = {})
    {
        op.threeBinds = op.threeBinds || {};

        const values = [0, 0, 0];

        const a = op.threeBinds[paramName] || {
            "inX": op.inFloat(paramName + " X", values[0]),
            "inY": op.inFloat(paramName + " Y", values[1]),
            "inZ": op.inFloat(paramName + " Z", values[2]),
            "options": options
        };
        function update()
        {
            object[paramName].set(a.inX.get(), a.inY.get(), a.inZ.get());
            if (a.options.needsUpdate) object.needsUpdate = true;

        }

        if (!op.threeBinds[paramName])
        {

            op.threeBinds[paramName] = a;

            a.inX.onChange =
        a.inY.onChange =
        a.inZ.onChange = update;

            update();
        }
    }

}
