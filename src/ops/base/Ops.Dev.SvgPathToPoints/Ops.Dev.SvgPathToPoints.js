const
    inStr = op.inString("SVG Path"),
    inStepSize = op.inFloat("Bezier Stepsize", 3),
    outArr = op.outArray("Points A"),
    outHoles = op.outArray("Points B");

inStepSize.onChange =
inStr.onChange = () =>
{
    let str = inStr.get();

    if (!str || str.length < 2) return;

    str = str.replace(/([A-Z,a-z])/g, " $1 ");

    const cmds = fromPathToArray(str);

    // create a list of closed contours
    const polys = [];
    cmds.forEach(({ type, x, y, x1, y1, x2, y2 }) =>
    {
        switch (type)
        {
        case "M":
            polys.push(new Polygon());
            polys[polys.length - 1].moveTo({ x, y });
            break;
        case "L":
            polys[polys.length - 1].moveTo({ x, y });
            break;
        case "C":
            polys[polys.length - 1].cubicTo({ x, y }, { "x": x1, "y": y1 }, { "x": x2, "y": y2 });
            break;
        case "Q":
            polys[polys.length - 1].conicTo({ x, y }, { "x": x1, "y": y1 });
            break;
        case "Z":
            polys[polys.length - 1].close();
            break;
        }
    });

    // sort contours by descending area
    polys.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
    // classify contours to find holes and their 'parents'
    const root = [];
    for (let i = 0; i < polys.length; ++i)
    {
        let parent = null;
        for (let j = i - 1; j >= 0; --j)
        {
            // a contour is a hole if it is inside its parent and has different winding
            if (polys[j].inside(polys[i].points[0]) && polys[i].area * polys[j].area < 0)
            {
                parent = polys[j];
                break;
            }
        }
        if (parent)
        {
            parent.children.push(polys[i]);
        }
        else
        {
            root.push(polys[i]);
        }
    }

    const totalPoints = polys.reduce((sum, p) => sum + p.points.length, 0);
    const vertexData = new Float32Array(totalPoints * 2);
    let vertexCount = 0;
    const indices = [];

    // function process(poly) {
    //   // construct input for earcut
    //   const coords = [];
    //   const holes = [];
    //   poly.points.forEach(({x, y}) => coords.push(x, y));
    //   poly.children.forEach(child => {
    //     // children's children are new, separate shapes
    //     child.children.forEach(process);

    //     holes.push(coords.length / 2);
    //     child.points.forEach(({x, y}) => coords.push(x, y));
    //   });

    //   // add vertex data
    //   vertexData.set(coords, vertexCount * 2);
    //   // add index data
    //   earcut(coords, holes).forEach(i => indices.push(i + vertexCount));
    //   vertexCount += coords.length / 2;
    // }
    // root.forEach(process);

    const coords = [];
    const holes = [];

    for (let i = 0; i < polys.length; i++)
    {
        const arr = [];
        for (let j = 0; j < polys[i].points.length; j++)
        {
            arr.push(polys[i].points[j].x, polys[i].points[j].y, 0);
        }
        coords.push(arr);

        if (polys[i].children)
        {
            for (let j = 0; j < polys[i].children.length; j++)
            {
                const hole = [];

                for (let k = 0; k < polys[i].children[j].points.length; k++)
                {
                    hole.push(
                        polys[i].children[j].points[k].x,
                        polys[i].children[j].points[k].y,
                        0);
                }

                holes.push(hole);
                if (j > 0) coords.push([]);
            }
        }

        // if (!polys[i].children || polys[i].children.length == 0)holes.push([]);

        // polys[i].children.forEach((child) =>
        // {
        //     const hole = [];
        //     child.points.forEach(({ x, y }) => hole.push(x, y, 0));

        //     holes.push(hole);
        //     coords.push([]);
        // });

        // for(let i=holes.length;i<arr.length;i++) holes.push([]);

        // if (polys[i].children.length == 0)console.log(arr);

        // for(let i=coords.length;i<holes.length;i++) coords.push([]);
    }

    outArr.set(null);
    outHoles.set(null);

    outArr.set(coords);
    outHoles.set(holes);
};

const PATH_COMMANDS = {
    "M": ["x", "y"],
    "m": ["dx", "dy"],
    "H": ["x"],
    "h": ["dx"],
    "V": ["y"],
    "v": ["dy"],
    "L": ["x", "y"],
    "l": ["dx", "dy"],
    "Z": [],
    "C": ["x1", "y1", "x2", "y2", "x", "y"],
    "c": ["dx1", "dy1", "dx2", "dy2", "dx", "dy"],
    "S": ["x2", "y2", "x", "y"],
    "s": ["dx2", "dy2", "dx", "dy"],
    "Q": ["x1", "y1", "x", "y"],
    "q": ["dx1", "dy1", "dx", "dy"],
    "T": ["x", "y"],
    "t": ["dx", "dy"],
    "A": ["rx", "ry", "rotation", "large-arc", "sweep", "x", "y"],
    "a": ["rx", "ry", "rotation", "large-arc", "sweep", "dx", "dy"]
};

function fromPathToArray(path)
{
    const items = path.replace(/[\n\r]/g, "")
        .replace(/-/g, " -")
        .replace(/(\d*\.)(\d+)(?=\.)/g, "$1$2 ")
        .trim()
        .split(/\s*,|\s+/);

    // console.log(items);
    const segments = [];
    let currentCommand = "";
    let currentElement = {};
    while (items.length > 0)
    {
        let it = items.shift();
        if (PATH_COMMANDS.hasOwnProperty(it))
        {
            currentCommand = it;
        }
        else
        {
            items.unshift(it);
        }

        currentElement = { "type": currentCommand };
        PATH_COMMANDS[currentCommand].forEach((prop) =>
        {
            it = items.shift(); // TODO sanity check
            currentElement[prop] = parseFloat(it);
        });
        if (currentCommand === "M")
        {
            currentCommand = "L";
        }
        else if (currentCommand === "m")
        {
            currentCommand = "l";
        }
        segments.push(currentElement);
    }
    return segments;
}

// https://stackoverflow.com/questions/50554803/triangulate-path-data-from-opentype-js-using-earcut

const MAX_BEZIER_STEPS = 15;
// this is for inside checks - doesn't have to be particularly
// small because glyphs have finite resolution
const EPSILON = 1e-6;

class Polygon
{
    constructor()
    {
        this.points = [];
        this.children = [];
        this.area = 0.0;

        this.BEZIER_STEP_SIZE = inStepSize.get();
    }

    moveTo(p)
    {
        this.points.push(p);
    }

    lineTo(p)
    {
        this.points.push(p);
    }

    close()
    {
        let cur = this.points[this.points.length - 1];
        this.points.forEach((next) =>
        {
            this.area += 0.5 * cross(cur, next);
            cur = next;
        });
    }

    conicTo(p, p1)
    {
        const p0 = this.points[this.points.length - 1];
        const dist = distance(p0, p1) + distance(p1, p);
        const steps = Math.max(2, Math.min(MAX_BEZIER_STEPS, dist / this.BEZIER_STEP_SIZE));
        for (let i = 1; i <= steps; ++i)
        {
            const t = i / steps;
            this.points.push(lerp(lerp(p0, p1, t), lerp(p1, p, t), t));
        }
    }

    cubicTo(p, p1, p2)
    {
        const p0 = this.points[this.points.length - 1];
        const dist = distance(p0, p1) + distance(p1, p2) + distance(p2, p);
        const steps = Math.max(2, Math.min(MAX_BEZIER_STEPS, dist / this.BEZIER_STEP_SIZE));
        for (let i = 1; i <= steps; ++i)
        {
            const t = i / steps;
            const a = lerp(lerp(p0, p1, t), lerp(p1, p2, t), t);
            const b = lerp(lerp(p1, p2, t), lerp(p2, p, t), t);
            this.points.push(lerp(a, b, t));
        }
    }

    inside(p)
    {
        let count = 0, cur = this.points[this.points.length - 1];
        this.points.forEach((next) =>
        {
            const p0 = (cur.y < next.y ? cur : next);
            const p1 = (cur.y < next.y ? next : cur);
            if (p0.y < p.y + EPSILON && p1.y > p.y + EPSILON)
            {
                if ((p1.x - p0.x) * (p.y - p0.y) > (p.x - p0.x) * (p1.y - p0.y))
                {
                    count += 1;
                }
            }
            cur = next;
        });
        return (count % 2) !== 0;
    }
}

function distance(p1, p2)
{
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function lerp(p1, p2, t)
{
    return { "x": (1 - t) * p1.x + t * p2.x, "y": (1 - t) * p1.y + t * p2.y };
}

function cross(p1, p2)
{
    return p1.x * p2.y - p1.y * p2.x;
}
