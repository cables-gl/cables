this will return information about window.location.hash (the part after the #) in your url.

these parts of the url can be changed without reloading the browserwindow and hence may be used to carry state.

this adheres to "getstring" syntax for key-value-pairs. having multiple # is also allowed. if key-value-pairs are duplicated the last one in the string "wins".

if you define a route, only parts of the hash that match this route will be considered. use multiple ops and multiple hashes to work with urls like this: "#/scene/1#/track/5".

additionally you may set a route like this "/scene/:number" and the op will extract "5711" from this hash `#/scene/5711` and store it in the output object as "number".