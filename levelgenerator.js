//Praveen's level generator

function generateRandomLevel(parameters) {
    var array = [];
    array.push({x:0, y:0, name:"PlayerSpawn"})
    var cx = 0;
    var cy = 0;
    for (var i = 0; i < 100; ++i) if (Math.random() < 0.5) ++cx; else ++cy;
    array.push({x:cx, y:cy, name:"Exit"})
    return array
}