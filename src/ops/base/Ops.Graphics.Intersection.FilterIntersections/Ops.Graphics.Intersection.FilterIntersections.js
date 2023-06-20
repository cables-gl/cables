const
    inArrCols = op.inArray("Collisions"),
    inName0 = op.inString("Name 1", ""),
    inName0Match = op.inSwitch("Match Name 1", ["exact", "start", "contain"], "exact"),
    inName1 = op.inString("Name 2", ""),
    inName1Match = op.inSwitch("Match Name 2", ["exact", "start", "contain"], "exact"),
    outColliding = op.outBoolNum("Colliding"),
    outNumCollisions = op.outNumber("Num Collisions"),
    outCollisions = op.outArray("Result Collisions");

inArrCols.onChange = () =>
{
    const match0 = inName0Match.get();
    const match1 = inName1Match.get();
    const name0 = inName0.get();
    const name1 = inName1.get();

    let filterFunc = (col) =>
    {
        let isColliding = false;
        let found = false;
        let otherName = "name1";
        if (match0 === "exact")
        {
            if (col.name0 === name0)
            {
                found = true;
            }
            else if (col.name1 === name0)
            {
                found = true;
                otherName = "name0";
            }
        }
        else if (match0 === "start")
        {
            if (col.name0.startsWith(name0))
            {
                found = true;
            }
            else if (col.name1.startsWith(name0))
            {
                found = true;
                otherName = "name0";
            }
        }
        else if (match0 === "contain")
        {
            if (col.name0.includes(inName0.get()))
            {
                found = true;
            }
            else if (col.name1.includes(inName0.get()))
            {
                found = true;
                otherName = "name0";
            }
        }
        if (found)
        {
            if (name1)
            {
                if (match1 === "exact")
                {
                    if (col[otherName] === name1) isColliding = true;
                }
                else if (match1 === "start")
                {
                    if (col[otherName].startsWith(name1)) isColliding = true;
                }
                else if (match1 === "contain")
                {
                    if (col[otherName].includes(name1)) isColliding = true;
                }
            }
            else
            {
                isColliding = true;
            }
        }
        return isColliding;
    };

    const allCols = inArrCols.get() || [];
    const cols = allCols.filter(filterFunc);
    outCollisions.set(cols);
    outNumCollisions.set(cols.length);
    outColliding.set(cols.length > 0);
};
