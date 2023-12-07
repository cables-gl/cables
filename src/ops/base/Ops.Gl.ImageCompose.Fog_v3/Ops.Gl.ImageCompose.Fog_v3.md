A little advice for using post processing fog on iOS:

Due to WebGL1 being used on iOS, the depth buffer that is needed for fog calculation is not as precise as the depth buffer being used in Chrome or Firefox. Therefor it is advised to use small scenes and adjust the *scene camera*'s near & far value (with the Perspective op as shown in the example) to only capture the scene and not exceeding the far value too much behind it.

Also, setting the near value to something greater than 0.01 (somewhere between 0.1 - 1 depending on context) can greatly increase depth buffer resolution.

