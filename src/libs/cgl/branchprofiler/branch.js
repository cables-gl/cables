export class Branch
{

    /**
     * @param {string} task
     * @param {string|object} name
     * @param {object} [data]
     */
    constructor(task, name, data = null)
    {
        this.task = task;
        this.name = name;
        this.data = data;
        this.dur = 0;
        this._startTime = 0;
        this.childs = [];
    }

    start()
    {
        this._startTime = performance.now();
    }

    end()
    {
        this.dur = performance.now() - this._startTime;
    }

    push(task, name, data)
    {
        const b = new Branch(task, name, data);
        this.childs.push(b);
        b.start();
        return b;
    }

    print(level)
    {
        level = level || 0;

        let str = "";
        for (let i = 0; i < level; i++) str += "  ";

        for (let i = 0; i < this.childs.length; i++)
            this.childs[i].print(level + 1);
    }
}
