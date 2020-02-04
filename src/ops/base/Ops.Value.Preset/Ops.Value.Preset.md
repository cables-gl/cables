The preset op allows you to capture the current state of all parameters that have been connected to it.
- To get started add the preset op to your patch.
- Now click and drag the `Create Variable` output port to the input port you which to store as a preset. This can be one or more parameters.
- This will create a variable which is now controllable via the preset op itself. 
- To change those parameters now click the preset op and change them there.
- When you are happy with the current state click `create new' and give your new preset a name.
- Continue to do this for as many presets as you'd like.
- Click the dropdown menu to select a preset.
- You can now use multiple `interpolation` modes.

Modes explanation
- None - Use this to create presets
- xfade - Allows you to fade between all presets. If you had 5 presets and put the fade amount on 2.25 then the parameters would be 75% of parameter 2 and 25% of preset 3
-  a-b - pick two presets and then interpolate between them with a range of 0-1

