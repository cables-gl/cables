export class MemProfiler
{
    #items = {};
    lastLog = 0;

    constructor()
    {
        setInterval(() =>
        {
            let sum = 0;
            let count = 0;
            for (const i in this.#items)
            {
                sum += this.#items[i].size;
                count++;
            }

            if (sum != this.lastLog)
            {
                // console.log("memory " + (sum / 1024 / 1024) + " mb " + count + " items");
                this.lastLog = sum;
            }
        }, 2000);

    }

    getUsage()
    {
        return this.lastLog;
    }

    /**
     * @param {MemProfilerItem} item
     */
    add(item)
    {
        this.#items[item.id] = item;
    }

    remove(item)
    {
        delete this.#items[item.id];
    }

}

export class MemProfilerItem
{
    id = CABLES.uuid();
    name = "";
    type = "";
    size = 0;
    data = {};

    /**
     * @param {string} [name]
     * @param {string} [type]
     * @param {number} [size]
     * @param {{}} [data]
     */
    constructor(name, type, size, data)
    {
        this.name = name,
        this.type = type;
        this.size = size || 0;
        this.data = data;
        CABLES.memProfiler.add(this);
    }

    dispose()
    {
        this.size = 0;
        CABLES.memProfiler.remove(this);
    }

    /**
     * @param {number} s
     */
    setSize(s)
    {
        this.size = s;
    }
}
