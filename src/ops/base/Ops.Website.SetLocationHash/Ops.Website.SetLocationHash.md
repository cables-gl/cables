allows to manipulate window.location.hash to store data in the url without reloading the page.

given a hash in the first parameter, the op will simply replace the whole part behind the # in the url with the given hash.

if you define a route, only parts of the hash that match this route will be considered. the object that has corresponding values dictates the replacement.

a route like this "/scene/:number" with a value-object that has a property "number" set to 5711 will result in a hash like this: /scene/5711. existing routes will be replaced with new ones, if no matching route was found, the newly created on will be added to the hash as #/scene/5711