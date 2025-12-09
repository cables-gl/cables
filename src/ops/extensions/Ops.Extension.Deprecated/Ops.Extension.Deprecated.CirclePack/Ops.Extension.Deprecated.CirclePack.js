op.name = "CirclePack";

let render = op.inTrigger("Render");

let max = op.inValue("Max Circles", 200);

let next = op.outTrigger("Next");
let outIndex = op.outValue("index");
let outX = op.outValue("x");
let outY = op.outValue("y");
let outRadius = op.outValue("radius");

let circles = [];

render.onTriggered = draw;

let width = 500;
let height = 500;

max.onChange = reset;

function reset()
{
    finished = false;
    circles.length = 0;
}

function dist(x1, y1, x2, y2)
{
    let xd = x2 - x1;
    let yd = y2 - y1;
    return Math.sqrt(xd * xd + yd * yd);
}

function Circle(x, y)
{
    this.x = x;
    this.y = y;
    this.r = 4;
    this.growing = true;

    this.grow = function ()
    {
        if (this.growing)
        {
            this.r += 1;
        }
    };

    this.show = function ()
    {
        outX.set(this.x - width / 2);
        outY.set(this.y - height / 2);

        outRadius.set(this.r);
        next.trigger();
    };

    this.edges = function ()
    {
        return (this.x + this.r >= width || this.x - this.r <= 0 || this.y + this.r >= height || this.y - this.r <= 0);
    };
}

var finished = false;
function draw()
{
    if (finished)
    {
        for (var i = 0; i < circles.length; i++)
        {
            var circle = circles[i];
            outIndex.set(i);
            circle.show();
        }
        return;
    }

    while (!finished)
    {
        let total = 5;
        let count = 0;
        let attempts = 0;

        // console.log(circles.length);

        while (count < total && circles.length < max.get())
        {
            let newC = newCircle();
            if (newC !== null)
            {
                circles.push(newC);
                count++;
            }
            attempts++;
            if (attempts > 100)
            {
                // noLoop();
                console.log("finished");
                finished = true;
                break;
            }
        }

        if (circles.length >= max.get())finished = true;
        console.log(circles.length);

        for (var i = 0; i < circles.length; i++)
        {
            var circle = circles[i];

            if (circle.growing)
            {
                if (circle.edges())
                {
                    circle.growing = false;
                }
                else
                {
                    for (let j = 0; j < circles.length; j++)
                    {
                        let other = circles[j];
                        if (circle !== other)
                        {
                            let d = dist(circle.x, circle.y, other.x, other.y);
                            let distance = circle.r + other.r;

                            if (d - 2 < distance)
                            {
                                circle.growing = false;
                                break;
                            }
                        }
                    }
                }
            }

            circle.show();
            circle.grow();
        }
    }
}

function newCircle()
{
    let x = Math.random() * width;
    let y = Math.random() * height;
    let valid = true;
    for (let i = 0; i < circles.length; i++)
    {
        let circle = circles[i];
        let d = dist(x, y, circle.x, circle.y);
        if (d < circle.r)
        {
            valid = false;
            break;
        }
    }
    if (valid)
    {
        return new Circle(x, y);
    }
    else
    {
        return null;
    }
}
