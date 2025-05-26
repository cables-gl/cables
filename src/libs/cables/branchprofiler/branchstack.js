import { Branch } from "./branch.js";

export class BranchStack
{

    start()
    {
        this.root = new Branch("Root");
        this.root.start();

        /** @type {Branch} */
        this.current = this.root;
    }

    /**
     * @param {string} task
     * @param {string} name
     * @param {any} info
     * @returns {Branch}
     */
    push(task, name, info = null)
    {
        if (!this.current) this.start();

        const prev = this.current;

        if (typeof name != "string" && info != null)
        {
            info = name;
            name = "";
        }

        this.current = this.current.push(task, name, info);
        this.current.prev = prev;
        this.current.start();
        return this.current;
    }

    pop()
    {
        if (!this.current) return;
        this.current.end();
        this.current = this.current.prev;
    }

    finish()
    {
        this.current.end();
        this.root.print();
        this.current = null;
    }
}
