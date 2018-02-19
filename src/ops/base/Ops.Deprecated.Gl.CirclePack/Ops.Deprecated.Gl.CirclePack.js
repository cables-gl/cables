op.name="CirclePack";

var render=op.inFunction("Render");

var max=op.inValue("Max Circles",200);

var next=op.outFunction("Next");
var outIndex=op.outValue("index");
var outX=op.outValue("x");
var outY=op.outValue("y");
var outRadius=op.outValue("radius");

var circles=[];

render.onTriggered=draw;

var width=500;
var height=500;

max.onChange=reset;

function reset()
{
    finished=false;
    circles.length=0;
}

function dist(x1,y1,x2,y2)
{
	var xd = x2-x1;
	var yd = y2-y1;
	return Math.sqrt(xd*xd + yd*yd);
}

function Circle(x, y)
{
    this.x = x;
    this.y = y;
    this.r = 4;
    this.growing = true;

    this.grow = function()
    {
        if(this.growing)
        {
            this.r += 1;
        }
    };

    this.show = function()
    {
        outX.set(this.x-width/2);
        outY.set(this.y-height/2);
        
        outRadius.set(this.r);
        next.trigger();
    };

    this.edges = function()
    {
        return (this.x + this.r >= width || this.x - this.r <= 0 || this.y + this.r >= height || this.y - this.r <= 0);
    };
}



var finished=false;
function draw()
{
    if(finished)
    {
        for (var i = 0; i < circles.length; i++)
        {
            var circle = circles[i];
            outIndex.set(i);
            circle.show();
        }
        return;
    }

    while(!finished)
    {
    
        var total = 5;
        var count = 0;
        var attempts = 0;
    
        // console.log(circles.length);
    
        while (count < total && circles.length<max.get())
        {
            var newC = newCircle();
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
                finished=true;
                break;
            }
        }
        
        if(circles.length>=max.get())finished=true;
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
                    for (var j = 0; j < circles.length; j++)
                    {
                        var other = circles[j];
                        if (circle !== other)
                        {
                            var d = dist(circle.x, circle.y, other.x, other.y);
                            var distance = circle.r + other.r;
                
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

function newCircle() {
  var x = Math.random()*width;
  var y = Math.random()*height;
  var valid = true;
  for (var i = 0; i < circles.length; i++) {
    var circle = circles[i];
    var d = dist(x, y, circle.x, circle.y);
    if (d < circle.r) {
      valid = false;
      break;
    }
  }
  if (valid) {
    return new Circle(x, y);
  } else {
    return null;
  }
}