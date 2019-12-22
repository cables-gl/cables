when given an array with "non" unique items, like:

```javascript
const a = [
  "maus",
  "hund",
  "maus",
  "katze",
  "maus",
];
```

will return only the unique values in that array, as a new array, so:

```javascript
const a = [
  "hund",
  "katze",
  "maus",
];
```