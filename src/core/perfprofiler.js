export class PerfProfiler
{
    numframes = 120;

    /** @type {Map<String,number>} */
    counts = new Map();
    countsFrames = {};

    /** @type {Object<String,number>} */
    durations = {};
    durationsFrames = {};

    /** @type {Object<String,String>} */
    #countNames = {};

    constructor()
    {
    }

    endFrame()
    {

        for (const i in this.durationsFrames)
        {
            while (this.durationsFrames[i].length < this.numframes) this.durationsFrames[i].push({ "ms": 0 });
            this.durationsFrames[i] = this.durationsFrames[i] || [];
            if (this.durations.hasOwnProperty(i))
                this.durationsFrames[i].push({ "ms": this.durations[i] });
            else
            if (this.durationsFrames[i] && this.durationsFrames[this.durationsFrames[i].length - 1])
                this.durationsFrames[i].push(this.durationsFrames[this.durationsFrames[i].length - 1]);

            while (this.durationsFrames[i].length > this.numframes) this.durationsFrames[i].shift();
        }

        for (const i in this.countsFrames)
        {
            while (this.countsFrames[i].length < this.numframes) this.countsFrames[i].push({ "num": 0 });
            this.countsFrames[i] = this.countsFrames[i] || [];
            if (this.counts.has(i))
                this.countsFrames[i].push({ "num": this.counts.get(i) });
            else
            if (this.countsFrames[i] && this.countsFrames[this.countsFrames[i].length - 1])
                this.countsFrames[i].push(this.countsFrames[this.countsFrames[i].length - 1]);

            while (this.countsFrames[i].length > this.numframes) this.countsFrames[i].shift();
        }

        this.reset();
    }

    reset()
    {

        this.counts.clear();
        this.durations = {};
    }

    /**
     * @param {string } name
     */
    getCount(name)
    {
        if (this.counts.has("count " + name))
        {
            return this.counts.get("count " + name);
        }
        return -1;
    }

    /**
     * @param {string} _name
     * @param {number} [v]
     */
    count(_name, v = 1)
    {
        let name = this.#countNames[_name];
        if (!name)
        {
            name = this.#countNames[_name] = "count " + _name;
            this.countsFrames[name] = this.countsFrames[name] || 0;
        }
        this.counts.set(name, (this.counts.get(name) || 0) + (v || 1));
    }

    /**
     * @param {string} _name
     * @param {number} t
     */
    setDuration(_name, t)
    {
        const name = "duration " + _name;
        this.durations[name] = this.durations[name] || 0;
        this.durationsFrames[name] = this.durationsFrames[name] || 0;
        if (t) this.durations[name] += t;
    }
}
