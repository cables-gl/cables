import { ThreeRenderer } from "./threerenderer.js";

export class ThreeOp
{
    #op;
    #currentParent = null;
    #object = null;
    #lastTrigger = -1;
    #renderer = null;

    constructor(op)
    {
        this.#op = op;
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
        return this.#renderer || this.#op.patch.cg.frameStore.three.renderer;
    }

    setSceneObject(object)
    {
        this.remove();
        this.#object = object;
    }

    push()
    {
        const parentObject = this.#op.patch.cg.frameStore.three.renderer.currentObject;
        if (!parentObject) return;

        /** @type {ThreeRenderer} */
        this.#renderer = this.#op.patch.cg.frameStore.three.renderer;
        if (!this.#renderer) return;

        if (this.#currentParent != parentObject)
        {
            this.remove();
        }

        if (this.#currentParent === null)
        {
            this.#currentParent = parentObject;
            parentObject.add(this.#object);

            this.#renderer.add(this);
        }

        this.#lastTrigger = this.#op.patch.cg.frameStore.three.frame;
        this.#object.material = this.#renderer.currentMaterial;
        this.#renderer.pushObject(this.#object);
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
    }

}
