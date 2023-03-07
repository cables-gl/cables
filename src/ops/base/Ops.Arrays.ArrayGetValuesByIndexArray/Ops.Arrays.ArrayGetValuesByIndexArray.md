#### Base example

```js
const input_array = ['I', 'love', 'not', 'cables'];
const array_stride = 1;
const index_array = [0, 1, 3];

const result = ['I', 'love', 'cables'];
```

#### Advanced case, changing the input stride
Changing the stride is helpful to pick values from Array2, Array3 or Array4. 

```js
const input_array = [0,0,0, 1,1,1, 2,2,2];
const stride = 3;
const index_array = [0, 2];

const result = [0,0,0, 2,2,2];
```

