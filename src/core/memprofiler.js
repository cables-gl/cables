export class MemProfiler
{
    items = {};
    usageCpu = 0;
    usageGpu = 0;

    constructor()
    {
        setInterval(() =>
        {
            let sum = 0;
            let sumGpu = 0;
            let count = 0;
            for (const i in this.items)
            {
                sumGpu += this.items[i].sizeGpu;
                sum += this.items[i].size;
                count++;
            }

            this.usageCpu = sum;
            this.usageGpu = sumGpu;
        }, 2000);

    }

    getUsage()
    {
        return this.usageCpu;
    }

    getUsageGpu()
    {
        return this.usageGpu;
    }

    /**
     * @param {MemProfilerItem} item
     */
    add(item)
    {
        this.items[item.id] = item;
    }

    remove(item)
    {
        delete this.items[item.id];
    }
}

export class MemProfilerItem
{

    id = CABLES.uuid();
    name = "";
    type = "";
    size = 0;
    category = 0;
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
        this.sizeGpu = 0;
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

    /**
     * @param {number} s
     */
    setSizeGpu(s)
    {
        this.sizeGpu = s;
    }
}
