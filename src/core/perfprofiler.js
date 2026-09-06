export class PerfProfiler
{

    counts = {};

    constructor()
    {
    }

    reset()
    {
        for (const i in this.counts)
        {
            this.counts[i] = 0;
        }
    }

    /**
     * @param {string} name
     */
    count(name, v)
    {
        this.counts[name] = this.counts[name] || 0;
        if (v)
            this.counts[name] += v;
        else
            this.counts[name]++;
    }

}
