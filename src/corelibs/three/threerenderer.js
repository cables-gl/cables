import { ThreeOp } from "./threeop.js";

export class ThreeRenderer
{
    #frame = 0;

    #op = null;
    #scene = null;
    #renderer = null;
    #stackCameras = [];
    #defaultCamera;
    currentCamera = null;
    #stackMaterials = [];
    #stackObjects = [];
    #defaultMaterial;
    #defaultGeometry;

    /** @type {ThreeOp[]} */
    #sceneThreeOps = [];

    constructor(op)
    {
        this.#op = op;
        this.#defaultCamera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 10);
        this.#defaultCamera.position.z = 1.5;
        this.#defaultMaterial = new THREE.MeshBasicMaterial();
        this.#defaultGeometry = new THREE.BoxGeometry(1, 1, 1);
    }

    get defaultGeometry()
    {
        return this.#defaultGeometry;
    }

    renderPre()
    {

        this.#frame++;
        this.#op.patch.cg.frameStore.three = this.#op.patch.cg.frameStore.Three || {};
        this.#op.patch.cg.frameStore.three.scene = this.#scene;
        this.#op.patch.cg.frameStore.three.frame = this.#frame;
        this.#op.patch.cg.frameStore.three.renderer = this;

        this.#startRender();
    }

    #startRender()
    {

        this.currentCamera = this.#defaultCamera;
        this.#stackObjects.length = 0;
        this.pushObject(this.#scene);
        this.pushCamera(this.#defaultCamera);

    }

    #endRender()
    {
        this.popObject();
        this.popCamera();

    }

    pushObject(o)
    {
        this.#stackObjects.push(o);
    }

    popObject()
    {
        return this.#stackObjects.pop();
    }

    get currentObject()
    {
        return this.#stackObjects[this.#stackObjects.length - 1];
    }

    pushMaterial(m)
    {
        this.#stackMaterials.push(m);
    }

    popMaterial()
    {
        return this.#stackMaterials.pop();
    }

    get currentMaterial()
    {
        if (this.#stackMaterials.length == 0) return this.#defaultMaterial;
        return this.#stackMaterials[this.#stackMaterials.length - 1];
    }

    pushCamera(c)
    {
        this.#stackCameras.push(c);
    }

    popCamera()
    {
        return this.#stackCameras.pop();
    }

    render()
    {
        if (!this.#scene)
        {
            this.#scene = new THREE.Scene();
            this.#renderer = new THREE.WebGLRenderer({ "canvas": this.#op.patch.cg.canvas, "context": this.#op.patch.cgl.gl, "alpha": true });
            this.#renderer.autoClear = false;
        }
        this.#op.patch.cgl.lastMesh = null;
        if (CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();

        const container = document.getElementById("cablescanvas") || document.body;

        const r = container.getBoundingClientRect();
        this.#renderer.setSize(r.width, r.height);

        // framestore.threeframe=this.#frame
        // childstuff..
        // renderer.render()

        this.#op.patch.cg.frameStore.three = null;
        this.#renderer.render(this.#scene, this.currentCamera || this.#defaultCamera);
        this.#endRender();
        this.#checkCurrentlyTriggered();

        this.#renderer.resetState();
        if (this.#stackCameras.length != 0) console.warn("stack cameras not 0 !!!");
        if (this.#stackObjects.length != 0) console.warn("stack objects not 0 !!!");
    }

    #checkCurrentlyTriggered()
    {
        for (let i = 0; i < this.#sceneThreeOps.length; i++)
        {
            if (this.#frame != this.#sceneThreeOps[i].lastTrigger)
            {
                this.#sceneThreeOps[i].remove();
            }
        }
    }

    add(threeOp)
    {

        this.#sceneThreeOps.push(threeOp);
    }

}
