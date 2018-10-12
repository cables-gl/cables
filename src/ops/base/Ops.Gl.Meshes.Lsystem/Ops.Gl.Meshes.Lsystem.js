"use strict";

const inExe = op.inTrigger ('Trigger');
const inStrAxiom = op.inValueString("Axiom / seed");
const inStrConstant1 = op.inValueString("Constant 1");
const inStrRule1 = op.inValueString("Rule 1");
const inStrConstant2 = op.inValueString("Constant 2");
const inStrRule2 = op.inValueString("Rule 2");

inStrAxiom.hidePort();
inStrConstant1.hidePort();
inStrRule1.hidePort();
inStrConstant2.hidePort();
inStrRule2.hidePort();

const inIterations = op.inValueInt("Iterations",1);
const inStepLength = op.inValue("Step length",0.5);
const inStepScale = op.inValue("Step scale multiplier",0.995);
const inRotate = op.inValue("rotation");

var needsCalc = true;

const outTrigger = op.outTrigger("out trigger");
const lineTrigger = op.outTrigger("line trigger");
const stringOut = op.outValueString('String out');
const outArray = op.outArray("Matrix Array out");
const outPoints = op.outArray("Points out");


const seed = op.inValue("random seed");
const inRandStr = op.inValue("random strength");

var angle = inRotate.get();
var len = inStepLength.get();
var lenScale = inStepScale.get();

var cgl = op.patch.cgl;

//create a matrix
var trans = mat4.create();
//array to put trans into
var transforms = [];
//pop in and out matrix for branch transforms
var stack = [];

//used for splines array
var pointArrays = [];
var currentPointArray=[];
var lastPointArray=[0,0,0];



//axiom, the string that starts it all
//var axiom = inStrAxiom.get();
//create a copy to iterate through
var sentence = "";//axiom;
//an array that holds the string replacment rules
var rules = []

//UI input 
inRotate.onChange = generate;
inStepLength.onChange = generate;
inStepScale.onChange = generate;
inIterations.onChange = generate;
inExe.onTriggered = render;
seed.onChange = generate;
inRandStr.onChange = generate;

inStrAxiom.onChange = defineRules;
inStrConstant1.onChange = defineRules;
inStrRule1.onChange = defineRules;
inStrConstant2.onChange = defineRules;
inStrRule2.onChange = defineRules;

//creates the constants and the rule sets
function defineRules()
{
    rules[0]=
    {
        a : inStrConstant1.get(),
        b : inStrRule1.get(),
        c : inStrConstant2.get(),
        d : inStrRule2.get()
    }
    generate();
}
//reset everything
function resetAll()
{
    //define axiom here
    sentence = inStrAxiom.get();
    angle = inRotate.get();
    len = inStepLength.get();
    lenScale = inStepScale.get();
}

//generates the string from the ruleset
function generate()
{
   
    //reset the state of everything   
    resetAll();
    var nextSentence = "";

    for (var iter = 0; iter < inIterations.get() ; iter++)
    {
        
        for (var i =0; i < sentence.length; i++)
        {
            var current = sentence.charAt(i);
            var found = false;
            
            for (var j = 0; j < rules.length; j++)
            {
                if (current == rules[j].a)
                {
                    found = true;
                    nextSentence += rules[j].b;
                    break;
                }
                else if (current == rules[j].c)
                {
                    found = true;
                    nextSentence += rules[j].d;
                    break;
                }
                else if (current == rules[j].e)
                {
                    found = true;
                    nextSentence += rules[j].f;
                    break;
                }
                else if (current == rules[j].g)
                {
                    found = true;
                    nextSentence += rules[j].h;
                    break;
                }
            }    
            //if nothing is found continue no matter what
            if(!found)  nextSentence += current;
        }
        //final result
        sentence = nextSentence ;
        //used to debug the sentence as a string
        //can be removed later
        stringOut.set(sentence);
       
        //removing will add everything on top of each other recursively
        nextSentence="";
    }
    //draw everything with the turtle function
    turtle();
}



var pos=vec3.create();
var empty=vec3.create();  


//recreates the turtle algorithm

function turtle()
{
    //var randAmount = Math.seededRandom()* inRandStr.get();
 
 
    // Math.randomSeed=seed.get();
    //create the main transform array
    trans = mat4.create();
    transforms.length = 0;
    pointArrays.length=0;
    stack.length = 0;
    currentPointArray=[];
;

    //scale with step length could be replaced with
    //scale(trans, trans,[0.0,0.0,0.0])
    for(var i = 0; i < sentence.length; i++)
    {
        //iterate through the final string
        var current = sentence.charAt(i);
        
        //step forward, create point
        if(current == "F")
        {
            //apply to the trans matrix, take a step
            mat4.translate(trans,trans,[0.0,len,0.0]);
            //push matrix for geometry
            transforms.push(mat4.clone(trans));
            //get xyz for point array
            vec3.transformMat4(pos, empty, trans);
            //spline
            currentPointArray.push(pos[0],pos[1],pos[2]);

        }
        //step forward do not add a point
        else if (current == "f")
        {
            mat4.translate(trans,trans,[0.0,len,0.0]);
            
        }
        //alter step length by step multiplier
        else if (current == ">")
        {
            len *=lenScale;
        }
        else if (current == "<")
        {
            len /=lenScale;
        }
        //turn counter counter clockwise x defined by angle
        else if (current == "x")
        {
            mat4.rotateX(trans,trans,CGL.DEG2RAD * (-angle-Math.seededRandom()* inRandStr.get()));
        }
        //turn counter clockwise x defined by angle
        else if (current == "X")
        {
            mat4.rotateX(trans,trans,CGL.DEG2RAD * (angle + Math.seededRandom()* inRandStr.get()));
        }
        //turn counter counter clockwise y defined by angle
        else if (current == "y")
        {
            mat4.rotateY(trans,trans,CGL.DEG2RAD * (-angle-Math.seededRandom()* inRandStr.get()));
        }
        //turn counter clockwise y defined by angle
        else if (current == "Y")
        {
            mat4.rotateY(trans,trans,CGL.DEG2RAD * (angle + Math.seededRandom()* inRandStr.get()));
        }
        //turn counter counter clockwise z defined by angle
        else if (current == "z")
        {
            mat4.rotateZ(trans,trans,CGL.DEG2RAD * (-angle-Math.seededRandom()* inRandStr.get()));
        }
        //turn counter  clockwise z defined by angle
        else if (current == "Z")
        {
            mat4.rotateZ(trans,trans,CGL.DEG2RAD * (angle + Math.seededRandom()* inRandStr.get()));
        }
        ////turn 180 degrees
        else if (current == "|")
        {
            mat4.rotateZ(trans,trans,CGL.DEG2RAD * 180.0);
        }
        else if (current == "[")
        {
            //get current transform matrix push into stack, branch start
            stack.push(mat4.clone(trans));
        }
        //
        else if (current == "]")
        {
            //stack.pop();//with tree this pop destroys the branching
            //get the current branch push into the transform matrix

            // //check if branch has a start to avoid error
            if(stack.length === 0) 
            {
                break;
            }
            // //clear the stack/branch
            else 
            {
                trans = stack[stack.length-1];
                stack.pop();
            }

            // lastPointArray=currentPointArray;
            pointArrays.push(currentPointArray);
            //comment out to see branch start end
            currentPointArray=[];
            // currentPointArray.push(
            //     lastPointArray[lastPointArray.length-3],
            //     lastPointArray[lastPointArray.length-2],
            //     lastPointArray[lastPointArray.length-1]);
            
        }
    }

    pointArrays.push(currentPointArray);
    outArray.set(transforms);
    //console.log("outPoints array length is " + pointArrays.length )
    //outPointsArrayLength.set(currentPointArray.length);
}

function render ()
{
    
    //iterate through transforms array trigger all geometry
    for(var i = 0; i < transforms.length; i++)
    {
        cgl.pushModelMatrix();
        mat4.multiply(cgl.mMatrix,cgl.mMatrix,transforms[i]);
        outTrigger.trigger();
        cgl.popModelMatrix();
    }
    //console.log("pointsArray array length is " + pointArrays.length )
    //iterate through points array for spline xyz data
    for(var i = 0; i < pointArrays.length ; i++)
    {
        //outPoints.set(pointArrays[i]);
        outPoints.set(pointArrays[i]);
        lineTrigger.trigger();
    }
    //outPoints.set(pointArrays);
    //console.log("outPoints array length is " +outPoints.length )
    
}








//BACKUP for string tree
// "use strict";
// const inExe = op.inTrigger ('Trigger');
// var resetButton = op.inFunctionButton("reset");
// const stringOut = op.outValueString('String out');
// var axiom = 'A';
// var sentence = axiom;

// var rules = []
// rules[0] = 
// {
//     a:'A',
//     b:'AB'
// }

// rules[1] = 
// {
//     a:'B',
//     b:'A'
// }

// function generate()
// {
//     var nextSentence = "";
    
//     // resetButton.onTriggered = function (sentence)
//     // {
//     //     sentence = axiom;
//     //     nextSentence = "";
//     //     console.log(" sentence is " + sentence + " next sentence is " + nextSentence);
        
//     // }
//     for (var i =0; i < sentence.length; i++)
//     {
//         var current = sentence.charAt(i);
//         var found = false;
        
//         for (var j = 0; j < rules.length; j++)
//         {
//             if (current == rules[j].a)
//             {
//                 found = true;
//                 nextSentence += rules[j].b;
//                 break;
//             }
//         }    
//         if(!found)
//         {
//             nextSentence = current;
//         }

//     }
//     sentence = nextSentence ;
//     console.log(" sentence is " + sentence);
//     stringOut.set(sentence);
// }

// function resetAll()
// {
//     sentence = axiom;
    
// }
// inExe.onTriggered = generate;
// resetButton.onTriggered = resetAll;