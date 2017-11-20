# Repeat2d

*Ops.Repeat2d*

Triggers all ops underneath `numX` * `numY` times

## Input

### Exe

*Type: Function*

Triggers repeated execution


### Num X

*Type: Value*

Number of times executed on the X axis

### Num Y

*Type: Value*

Number of times executed on the Y axis


### mul

*Type: Value*

Multiplies the index. Makes it easier e.g. to use the outputs directly in a transform.

## Output

### Trigger

*Type: Function*

Triggers execution of childs

### X

*Type: Value*

Current index X. This value changes when childs are triggered.

### Y

*Type: Value*

Current index X. This value changes when childs are triggered.

### Index

*Type: Value*

Current index. If you have a 5x5 repeater, this value goes from 0 to (including) 24


## Example

- [Repeat2d Example](https://cables.gl/p/570e665d373767344b95c94d)