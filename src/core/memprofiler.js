// export class MemProfiler
// {
//     #items = {};
//     lastLog = 0;

//     constructor()
//     {
//         setInterval(() =>
//         {
//             let sum = 0;
//             for (const i in this.#items)
//             {
//                 sum += this.#items[i].size;
//             }

//             if (sum != this.lastLog)
//             {
//                 console.log("memory " + (sum / 1024 / 1024) + "mb");
//                 this.lastLog = sum;
//             }
//         }, 10000);

//     }

//     /**
//      * @param {MemProfilerItem} item
//      */
//     add(item)
//     {
//         this.#items[item.id] = item;
//     }

// }

// // const profiler = new MemProfiler();

export class MemProfilerItem
{
    id = null;// CABLES.uuid();
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
        this.size = size;
        this.data = data;
        // profiler.add(this);
    }

    dispose()
    {
        this.size = 0;
    }

    /**
     * @param {number} s
     */
    setSize(s)
    {
        this.size = s;
    }
}
