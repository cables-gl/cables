
const InterActionNeededButton = class
{
    constructor()
    {
        this.patch = null;
        this.fsElement = null;
        this.callbacks = {};
    }

    add(patch, reason, cb)
    {
        this.patch = patch;
        this.callbacks[reason] = cb;
        this.show();
    }

    remove(reason)
    {
        delete this.callbacks[reason];

        if (Object.keys(this.callbacks).length == 0)
        {
            if (this.fsElement) this.fsElement.remove();
            this.fsElement = null;
        }
    }

    show()
    {
        if (!this.fsElement)
        {
            this.fsElement = document.createElement("div");

            const container = this.patch.cgl.canvas.parentElement;
            if (container)container.appendChild(this.fsElement);

            this.fsElement.addEventListener("pointerdown", (e) =>
            {
                for (const i in this.callbacks) this.callbacks[i]();
            });
        }

        this.fsElement.style.padding = "10px";
        this.fsElement.style.position = "absolute";
        this.fsElement.style.right = "20px";
        this.fsElement.style.bottom = "20px";
        this.fsElement.style.width = "24px";
        this.fsElement.style.height = "24px";
        this.fsElement.style.cursor = "pointer";
        this.fsElement.style["border-radius"] = "40px";
        this.fsElement.style.background = "#444";
        this.fsElement.style["z-index"] = "9999";
        this.fsElement.style.display = "block";
        // this.fsElement.dataset.opid = op.id;
        this.fsElement.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-volume-2\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07\"></path></svg>";
    }
};

CABLES.interActionNeededButton = CABLES.interActionNeededButton || new InterActionNeededButton();
