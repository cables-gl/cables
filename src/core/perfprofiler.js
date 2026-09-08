export class PerfProfiler
{
    numframes = 120;

    /** @type {Object<String,number>} */
    counts = {};
    countsFrames = {};

    /** @type {Object<String,number>} */
    durations = {};
    durationsFrames = {};

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
            if (this.counts.hasOwnProperty(i))
                this.countsFrames[i].push({ "num": this.counts[i] });
            else
            if (this.countsFrames[i] && this.countsFrames[this.countsFrames[i].length - 1])
                this.countsFrames[i].push(this.countsFrames[this.countsFrames[i].length - 1]);

            while (this.countsFrames[i].length > this.numframes) this.countsFrames[i].shift();
        }

        this.reset();
    }

    reset()
    {

        this.counts = {};
        this.durations = {};
        // for (const i in this.counts) this.counts[i] = 0;
        // for (const i in this.durations) this.durations[i] = 0;
    }

    /**
     * @param {string} name
     * @param {number} v
     */
    count(name, v)
    {
        this.counts[name] = this.counts[name] || 0;
        this.countsFrames[name] = this.countsFrames[name] || 0;
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
        this.durationsFrames[name] = this.durationsFrames[name] || 0;
        if (t)
            this.durations[name] += t;
    }
}
