# SinusAnim

*Ops.Anim.SinusAnim*    

Outputs a changing value based on a sinus operation, which can be used for animations.

## Input

### Execute

*Type: Function*  
Executes the SinusAnim-op

### Phase

*Type: Value*  
Can be used to shift the animation, e.g. if you use two SinusAnim-ops which should not be in sync

### Frequency

*Type: Value*  
Make it bigger than `1` to speed the animation up

### Amplitude

*Type: Value*
How small / big the values can become, setting it to `2` e.g. results in an output between `-2` and `2`.  

## Output

### Result

*Type: Value*  
A value cycling between `-Amplitude` and `Amplitude`
