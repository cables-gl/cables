This op allows the creation of custom gradients. Click the edit button to get the UI to edit gradient. More colours can be added to the gradient.

Click on the small squares at the bottom and then the larger square to change the colour of that gradient point.

Drag the small squares around to change the relationship between the different colours.
Click once in the thin line at the bottom to add extra squares/gradient points.

This will produce a datastructure like this, which can also go into the 'Gradient Array'-Port:
```
[
  {
    "pos": 0,
    "r": 0,
    "g": 0.19215686274509805,
    "b": 0.6705882352941176,
    "a": 1
  },
  {
    "pos": 0.085,
    "r": 0.00784313725490196,
    "g": 0.20392156862745098,
    "b": 0.6941176470588235,
    "a": 0.76
  },
  ...
  {
    "pos": 1,
    "r": 0.9882352941176471,
    "g": 0.3215686274509804,
    "b": 1,
    "a": 0
  }
]
```
