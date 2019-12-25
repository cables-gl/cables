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

will return an object with information on the ocurrences of every unique value, so:

```javascript
{
  "hund" : 1,
  "katze": 1,
  "maus": 3,
};
```