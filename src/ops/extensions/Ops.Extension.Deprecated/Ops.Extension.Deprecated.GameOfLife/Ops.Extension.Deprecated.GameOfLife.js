op.name = "GameOfLife";

let render = op.inTrigger("Render");
let reset = op.inTrigger("Reset");
let next = op.outTrigger("Next");

let cells = [];
let cellsA = [];

let size = 30;
let cgl = op.patch.cgl;

cells.length = size * size * size;
cellsA.length = size * size * size;

function doReset()
{
    for (let i = 0; i < cells.length; i++)cells[i] = Math.random() >= 0.8;
}

reset.onTriggered = doReset;
doReset();

let vec = vec3.create();

function analyze(x, y, z)
{
    let livingNeighbours = 0;

    if (cells[index(x - 1, y, z)]) livingNeighbours++;
    // if(cells[index(x,y)]) livingNeighbours++;
    if (cells[index(x + 1, y, z)]) livingNeighbours++;

    if (cells[index(x - 1, y - 1, z)]) livingNeighbours++;
    if (cells[index(x, y - 1, z)]) livingNeighbours++;
    if (cells[index(x + 1, y - 1, z)]) livingNeighbours++;

    if (cells[index(x - 1, y + 1, z)]) livingNeighbours++;
    if (cells[index(x, y + 1, z)]) livingNeighbours++;
    if (cells[index(x + 1, y + 1, z)]) livingNeighbours++;

    if (cells[index(x, y, z + 1)]) livingNeighbours++;
    if (cells[index(x - 1, y, z + 1)]) livingNeighbours++;
    if (cells[index(x + 1, y, z + 1)]) livingNeighbours++;

    if (cells[index(x - 1, y - 1, z + 1)]) livingNeighbours++;
    if (cells[index(x, y - 1, z + 1)]) livingNeighbours++;
    if (cells[index(x + 1, y - 1, z + 1)]) livingNeighbours++;

    if (cells[index(x - 1, y + 1, z + 1)]) livingNeighbours++;
    if (cells[index(x, y + 1, z + 1)]) livingNeighbours++;
    if (cells[index(x + 1, y + 1, z + 1)]) livingNeighbours++;

    if (cells[index(x, y, z - 1)]) livingNeighbours++;
    if (cells[index(x - 1, y, z - 1)]) livingNeighbours++;
    if (cells[index(x + 1, y, z - 1)]) livingNeighbours++;

    if (cells[index(x - 1, y - 1, z - 1)]) livingNeighbours++;
    if (cells[index(x, y - 1, z - 1)]) livingNeighbours++;
    if (cells[index(x + 1, y - 1, z - 1)]) livingNeighbours++;

    if (cells[index(x - 1, y + 1, z - 1)]) livingNeighbours++;
    if (cells[index(x, y + 1, z - 1)]) livingNeighbours++;
    if (cells[index(x + 1, y + 1, z - 1)]) livingNeighbours++;

    cellsA[index(x, y, z)] = cells[index(x, y, z)];

    if (livingNeighbours < 2 * 2)cellsA[index(x, y, z)] = false;
    if (livingNeighbours > 3 * 3)cellsA[index(x, y, z)] = false;

    if (livingNeighbours == 3 * 3) cellsA[index(x, y, z)] = true;
}

function index(x, y, z)
{
    let index = x + y * size + z * size * size;
    if (index < 0) return 0;
    if (index > size * size * size) return 0;

    return index;
}

render.onTriggered = function ()
{
    for (var x = 0; x < size; x++)
    {
        for (var y = 0; y < size; y++)
        {
            for (var z = 0; z < size; z++)
            {
                analyze(x, y, z);
            }
        }
    }

    for (let i = 0; i < cells.length; i++)
        cells[i] = cellsA[i];

    for (var x = 0; x < size; x++)
    {
        for (var y = 0; y < size; y++)
        {
            for (var z = 0; z < size; z++)
            {
                if (cells[index(x, y, z)])
                {
                    vec3.set(vec, (x - size / 2) * 0.1, (y - size / 2) * 0.1, (z - size / 2) * 0.1);
                    cgl.pushModelMatrix();
                    mat4.translate(cgl.mvMatrix, cgl.mvMatrix, vec);
                    next.trigger();
                    cgl.popModelMatrix();
                }
            }
        }
    }
};
