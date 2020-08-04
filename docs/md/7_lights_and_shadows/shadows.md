
# Shadows

## Basic Setup
Please refer to the [basic example](https://cables.gl/p/p-Pnre) to see the most basic setup for enabling shadows.

The following ops are able to cast shadows:

- [Point Light](https://cables.gl/op/Ops.Gl.Phong.PointLight_v5)
- [Directional Light](https://cables.gl/op/Ops.Gl.Phong.DirectionalLight_v5)
- [Spot Light](https://cables.gl/op/Ops.Gl.Phong.SpotLight_v5)

The following op(s) allow to receive shadows:

- [Shadow](https://cables.gl/op/Ops.Gl.ShaderEffects.Shadow_v2)

in conjuction with any [Material](https://cables.gl/ops/collection/Material).


Before we dive into creating shadows, we need to cover the basic terminology first:

## Theoretical Overview

There are 3 entities at work when talking about shadows: the light source, the occluder and the receiver.

![receiveroccluder](img/03_2_umbra_penumbra.png)

The *light source* emits light. The *occluder* is an object that *casts* a shadow onto a *receiver*. A receiver *receives* the shadow cast by the occluder.
Shadows are achieved through the occluder blocking the light from the light source that is supposed to reach the receiver, therefore coloring the part of the receiver that is occluded darker than the rest.

The shadow that is being cast can be split in two zones:
the *umbra*, the hard part of the shadow, and the *penumbra*, the soft part at the edge of the shadow.

When we talk about *soft shadows*, we mean shadows that feature a soft penumbra. When we talk about *hard shadows*, the shadows do **not** display a penumbra.

Okay, enough with the theory, let's dive in to the algorithms!

## Algorithms
The shadow system of cables currently features 4 shadow algorithms that can be selected in the [Shadow](https://cables.gl/op/Ops.Gl.ShaderEffects.Shadow_v2) op. They will be briefly introduced in this section:

### Default
The default shadow algorithm is only able to produce hard shadows. This algorithm is the fastest & cheapest and is based on the [1978 algorithm by Williams](http://cseweb.ucsd.edu/~ravir/274/15/papers/p270-williams.pdf).


### PCF (Percentage-Closer-Filtering)
The *PCF*, or *Percentage-Closer-Filtering*, algorithm is an extension of the default algorithm. It is able to produce *soft shadows* by linearly interpolating between the pixels of the shadow map. We are able to set the amount of sampling with the parameter `Sample Amount` featured in the [Shadow](https://cables.gl/op/Ops.Gl.ShaderEffects.Shadow_v2) op.
The higher the `Sample Amount`, the more expensive the calculations become. Most of the time, an amount of **4** samples should be enough to soften the shadows' edges.

#### A note on the [Point Light](https://cables.gl/op/Ops.Gl.Phong.PointLight_v5) op:

When using a point light, it is possible to use the `Sample Distribution` parameter to either:

 1) combat *shadow acne* (explained in the section *Common Problems & Artifacts*)
 2) change the appearance of the shadows so that there are "multiple" shadows that overlap each other

With the PCF algorithm, this parameter only works with a point light.

### Poisson
The *Poisson* algorithm (named after the famous french mathematician [Siméon Denis Poisson](https://en.wikipedia.org/wiki/Siméon_Denis_Poisson)) works like the PCF algorithm, with the difference that samples are not taken by linearly interpolating between values, but instead using *random offsets* distributed on a [Poisson Disc](https://medium.com/@hemalatha.psna/implementation-of-poisson-disc-sampling-in-javascript-17665e406ce1).

We are able to set the amount of sampling with the parameter `Sample Amount` featured in the [Shadow](https://cables.gl/op/Ops.Gl.ShaderEffects.Shadow_v2) op. In most cases, taking **4** samples will be enough. The `Sample Distribution` parameter allows us to change the "amount of sample points" used. The higher the value, the denser the sample distribution. Try keeping the value between **250** - **800** for best results.

### VSM (Variance Shadow Mapping)

TBD


## Common Problems & Artifacts

In this section, we are going to examine common pitfalls that can happen when using shadow mapping. The different algorithms can produce different artifacts, depending on how they are used. Let's first start with artifacts that can happen with any of the algorithms:

### Shadow acne

![shadow acne image](img/03_6_shadow_acne.png)

Shadow acne can happen with any algorithm. The root for the problem is that the shadow map is always a 2D representation of a 3D scene. The values stored in this 2D representation can sometimes lack accuracy or have "dead spots", where the value over- or undershoots. To solve this problem, there are a few possible solutions:

1. Try increasing the `Bias` property on your light. Usually a bias between `0.001` and `0.1` should do the trick. Try keeping the bias as low as possible as it can make shadows seem unrealistic with higher values.
2. Increase the resolution of the shadow map if the problem still persists after increasing the `Bias`.

A note on the `Bias` property used with the `VSM` (Variance Shadow Mapping) algorithm:

Here the `Bias` is not used to counter shadow acne, but so called `Light Leaking` which will be explained a little further ahead. `VSM` by design eliminates shadow acne, therefor no bias adjustment is needed for shadow acne.

## Peter Panning

![peter panning image](img/03_7_peter_panning.png)

Peter Panning basically means that your object appears to be hovering, even though it shouldn't be.

There are 4 solutions to get rid of it:

1. Set the `Near` and `Far` properties of the `Shadow Map Settings` of the casting light so, that:
   1. The `Near`-plane of the shadow camera starts as far away from its position as possible.
   2. The `Far`-plane of the shadow camera is as close to its position as possible.
2. Do not use geometries that have no width. If you want to have a floor, lose a very thin cube instead of a rectangle.
3. Compose your scene so it contains as little touching geometries as possible.
4. Use the `Normal Offset` property of the casting light to move the shadow along the normal of the receiving geometry (does not work with PointLight).

Generally speaking, always try to ONLY render what your light actually sees. There is no use in trying to capture the whole scene with the light's shadow camera when the only thing casting shadows is a mesh in the middle of a scene.

## Perspective & Projective Aliasing

### Perspective Aliasing

![perspective aliasing image](img/03_9_perspective_aliasing.png)

*Perspective Aliasing* occurs when shadow map resolution is insufficient for the size of the shadow camera's view frustum. In simple terms, *Perspective Aliasing* occurs when your `Near` and `Far` values span a large range and your occluding geometry is far away from the light. This typically happens more often with `SpotLight` rather than `Directional-` or `PointLight` operators.

To get rid of perspective aliasing, you can do the following:

1. readjust your `Near` and `Far` values and your light's `Position`.
2. Increase the `Shadow Map Size` of your light.
3. Make sure your geometry is not too far away from your light.

### Projective Aliasing
![projective aliasing image](img/03_10_projective_aliasing.png)

*Projective Aliasing* happens when the light's direction & the view direction is (almost) perpendicular to the occluder. This problem does not occur as often and can be fixed by one of the following measurements:

1. Change the angle (position) of your light until the problem disappears.
2. Use the light's `Normal Offset` property to move the shadows a little bit.
3. Try changing the positions of objects in your scene a little bit.

## Light Bleeding (only VSM)

![projective aliasing image](img/03_17_lightleaking.png)

*Light Bleeding*, also called *Light Leaking*, happens with the `VSM`, or *Variance Shadow Mapping*, algorithm only. The problem occurs when multiple occluders cover the same area of a receiver. You can try getting rid of light leaking by increasing the `Bias` property. The more you increase the bias, the less soft your shadows will appear. Be careful when adjusting.

In general it is advised to use VSM with wide scenes or scenes where objects have a bit of distance to each other and don't overlap.
