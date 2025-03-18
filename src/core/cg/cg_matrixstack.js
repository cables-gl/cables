import { mat4 } from "gl-matrix";

class MatrixStack
{
    constructor()
    {
        this._arr = [mat4.create()];
        this._index = 0;
        this.stateCounter = 0;
    }

    /**
     * @param {mat4} m
     */
    push(m)
    {
        this._index++;
        this.stateCounter++;

        if (this._index == this._arr.length)
        {
            const copy = mat4.create();
            this._arr.push(copy);
        }

        mat4.copy(this._arr[this._index], m || this._arr[this._index - 1]);

        return this._arr[this._index];
    }

    pop()
    {
        this.stateCounter++;

        this._index--;
        if (this._index < 0) this._index = 0;

        return this._arr[this._index];
    }

    length()
    {
        return this._index;
    }
}

export { MatrixStack };
