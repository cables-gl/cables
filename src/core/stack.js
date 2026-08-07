export class Stack
{
    #arr = [];

    /**
     * @param {string} name
     * @param {any} firstItem
     */
    constructor(name = "unknown", firstItem)
    {
        this.name = name;
        if (firstItem) this.push(firstItem);
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

    get length()
    {
        return this.#arr.length;
    }

    /* minimalcore:start */
    checkEmpty()
    {
        if (this.#arr.length != 0)console.warn(this.name + " should be empty but isnt!");

    }

    /* minimalcore:end */

}
