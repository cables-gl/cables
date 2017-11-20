# TriggerLimiter

*Ops.TriggerLimiter*

Limits the amount of times a trigger comes through. This op is handy if you don’t know how often another op triggers and you want to make sure it does not trigger more often than x.

## Input

### In Trigger [Function]

The trigger on which you want to make sure that it does not trigger too often

### Milliseconds [Number]

The milliseconds between triggers, e.g. if `Milliseconds` is set to `1000` the out trigger port triggers maximally every 1000 milliseconds (1 second).

## Output

### Out Trigger [Function]

The limited input trigger