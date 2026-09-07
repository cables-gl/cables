export class PerfProfiler
{

    /** @type {Object<String,number>} */
    counts = {};

    /** @type {Object<String,number>} */
    durations = {};

    constructor()
    {
    }

    reset()
    {
        for (const i in this.counts) this.counts[i] = 0;
        for (const i in this.durations) this.durations[i] = 0;
    }

    /**
     * @param {string} name
     * @param {number} v
     */
    count(name, v)
    {
        this.counts[name] = this.counts[name] || 0;
        if (v)
            this.counts[name] += v;
        else
            this.counts[name]++;
    }

    /**
     * @param {string} name
     * @param {number} t
     */
    setDuration(name, t)
    {
        this.durations[name] = this.durations[name] || 0;
        if (t)
            this.durations[name] += t;
    }
}
