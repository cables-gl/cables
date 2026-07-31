export class Stack
{
    #arr = [];

    constructor(a)
    {
        if (a) this.push(a);
    }

    /**
     * @param {any} a
     */
    push(a)
    {
        this.#arr.push(a);
    }

    pop()
    {
        return this.#arr.pop();
    }

    clear()
    {
        this.#arr.length = 0;
        return this;
    }

    current()
    {
        return this.#arr[this.#arr.length - 1];
    }

    array()
    {
        return this.#arr;
    }

}
