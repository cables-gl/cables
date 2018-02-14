
var arr=["apple", "baby", "back", "ball", "bear", "bed", "bell", "bird",
"birthday", "boat", "box", "boy", "bread", "brother", "cake", "car",
"cables", "cat", "chair", "chicken", "children", "Christmas", "coat", "corn",
"cow", "day", "dog", "doll", "door", "duck", "egg", "eye", "farm", "farmer", 
"father", "feet", "fire", "fish", "floor", "flower", "game", "garden", "girl", 
"good-bye","grass", "ground", "hand", "head", "hill", "home", "horse", "house", 
"kitty", "leg", "letter", "man", "men", "milk", "money", "morning", "mother", 
"name", "nest", "night", "paper", "party", "picture", "pig", "rabbit", "rain", 
"ring", "robin", "Santa Claus", "school", "seed", "sheep", "shoe", "sister", 
"snow", "song", "squirrel", "stick", "street", "sun", "table", "thing", "time", 
"top", "toy", "tree", "watch", "water", "way", "wind", "window", "wood"];


function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
arr=shuffleArray(arr);

var values=op.outArray("Words",arr);




