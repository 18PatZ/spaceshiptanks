/* Should equal the number of SVG objects in the HTML doc. This isn't being calculated automatically because that occasionally fails to work. */
/* Props to my brother Pranav for this objectsLoaded idea. Before he suggested this, I was just implementing an n millisecond delay before loading the page. */
var objectsNotLoaded = 2;

var margin = 10;
var xmargin = ga(scene, "width")*1 - margin - 50;
var ymargin = ga(scene, "height")*1 - margin - 50;


p("hiiiii");
function objectLoaded() {
    --objectsNotLoaded;
    if (objectsNotLoaded == 0) {buildScene()}
}
/*** Player data & info ***/
/* merged the movement into these objects */
var p1 = {
node: "none",
health:0,
attack:0,
speed:0,
rotation_speed: 0, /* rotation speed */
vr:0, /* velocity rotation */
vy:0, /* y velocity */
theta:90, /* angle to horizontal */
fire:0, /* fire or not */
acceleration:0.2,
speedx:0,
speedy:0,
maxspeed:15
}

var p2 = {
node:"none",
health:0,
attack:0,
speed:0,
rotation_speed: 0, /* rotation speed */
vr:0, /* velocity rotation */
vy:0, /* y velocity */
theta:90, /* angle to horizontal */
fire: 0, /* fire or not */
acceleration:0.2,
speedx:0,
speedy:0,
maxspeed:20
}

function assignlethrusters(){
/* Assign "thrust" class to thrusters */
dgid("node_p1").childNodes[1].childNodes[7].childNodes[1].setAttribute("class","thrust1");
dgid("node_p1").childNodes[1].childNodes[9].childNodes[1].setAttribute("class","thrust1");
dgid("node_p1").childNodes[1].childNodes[11].childNodes[1].setAttribute("class","thrust1");
dgid("node_p1").childNodes[1].childNodes[13].childNodes[1].setAttribute("class","thrust1");

dgid("node_p2").childNodes[1].childNodes[7].childNodes[1].setAttribute("class","thrust2");
dgid("node_p2").childNodes[1].childNodes[9].childNodes[1].setAttribute("class","thrust2");
dgid("node_p2").childNodes[1].childNodes[11].childNodes[1].setAttribute("class","thrust2");
dgid("node_p2").childNodes[1].childNodes[13].childNodes[1].setAttribute("class","thrust2");
    
}

/* Wow I forgot how this works for a while . . . maybe it should have comments */
function setStat(params) {
    /* get the p1 or p2 object and set its (health, attack, etc.) to whatevy */
    params.player[params.key] = params.value
    /* generates a string "p1" or "p2" based on whether the player is the p1 object or the p2 object */
    var player;
    switch (params.player) {
        case p1: player = "p1"; break;
        case p2: player = "p2"; break;
    }
    /* set the corresponding item (health, attack . . . ) in the display table to the new value */
    document.getElementById(player+"_"+params.key).textContent = params.value
}

function buildScene() {
    p1.node = createNode({svg:"spaceship", player:1, x:0, y:0});
    p2.node = createNode({svg:"spaceship", player:2, x:100, y:0});
    
    setStat({player: p1, key: "health", value: 25});
    setStat({player: p1, key: "attack", value: 1});
    setStat({player: p1, key: "speed", value: 0});
    p1.rotation_speed = 3.6; /* 180 degrees a second */
    
    setStat({player: p2, key: "health", value: 10});
    setStat({player: p2, key: "attack", value: 2});
    setStat({player: p2, key: "speed", value: 0});
    p2.rotation_speed = 3.6;
    
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.setInterval(update, 20);
    /* Set ids for the two spaceships */
    document.getElementsByClassName("spaceship")[0].setAttribute("id","p1");
    document.getElementsByClassName("spaceship")[1].setAttribute("id","p2");
    assignlethrusters();
}

/*** Helper functions ***/

/* Quicker way to write console.log */
function p(str) {
    console.log(str)
}

/* Quicker way to write getAttribute */
function ga(node, attr) {
    return node.getAttribute(attr)
}

/* Quicker way to write setAttribute */
function sa(node, attr, val) {
    node.setAttribute(attr, val)
}

/* Quicker way to write getElementById */
function gid(src, id) {
    return src.getElementById(id)
}

/* Quicker way to write document.getElementById */
function dgid(id) {
    return document.getElementById(id)
}

/* Rotate element */
function rotat(id, degrees){
    dgid(id).setAttribute("style","-webkit-transform: rotate("+(90-degrees)+"deg); -webkit-transform-origin: 25px 25px;-ms-transform: rotate("+(90-degrees)+"deg); -ms-transform-origin: 25px 25px;transform: rotate("+(90-degrees)+"deg); transform-origin: 25px 25px;");
    
}

/* Add circle */
function circ(x, y, radius, color, underSpaceship, theta){
    
    if(underSpaceship){
        /* Append to beginning of SVG so it is under spaceships */
        dgid("scene").innerHTML = "<circle class = 'bullet' cx='"+x+"' cy='"+y+"' r='"+radius+"' fill='"+color+"' vx='"+(Math.cos(Math.PI/180*theta)*10)+"' vy='"+(Math.sin(Math.PI/180*theta)*10*-1)+"'></circle>"+dgid("scene").innerHTML;
        //p((Math.cos(Math.PI/180*theta)*10)+", "+(Math.sin(Math.PI/180*theta)*10*-1));
    }else {
        /* Append to end of SVG so it is over spaceships */
        dgid("scene").innerHTML = dgid("scene").innerHTML+"<circle class = 'bullet' cx='"+x+"' cy='"+y+"' r='"+radius+"' fill='"+color+"' vx='"+(Math.cos(Math.PI/180*theta)*10)+"' vy='"+(Math.sin(Math.PI/180*theta)*10)+"'></circle>";
    }
}

/* Move bullet */
function moveBullet(){
    for(var i = 0; i < dgid("scene").childNodes.length; i++){
        /* Check if its an unit or tile */
        if(dgid("scene").childNodes[i].nodeType == 1){
            /* Check if its a bullet */
            if(ga(dgid("scene").childNodes[i],"class") == "bullet"){
                /* Future position of bullet */
                var fx = (ga(dgid("scene").childNodes[i],"cx")*1+ga(dgid("scene").childNodes[i],"vx")*1);
                var fy = (ga(dgid("scene").childNodes[i],"cy")*1+ga(dgid("scene").childNodes[i],"vy")*1);
                /* Check if within bounds */
                if(fx<margin || fx>xmargin || fy<margin || fy>ymargin){
                    /* Remove bullet with roundabout way so that I can jQuery */
                    sa(dgid("scene").childNodes[i],"id","delete");
                    $("#delete").remove();
                }else {
                    /* Move bullet to future position */
                    sa(dgid("scene").childNodes[i],"cx",fx);
                    sa(dgid("scene").childNodes[i],"cy",fy);
                }
            }
            
        }
    }
}

function enumerate(array, block) {
    for (var i=0; i<array.length; ++i) {
        /* The block can return a boolean value. Returning false ends enumeration. */
        var shouldContinue = block(array[i]);
        if (shouldContinue == false) {break;}
    }
}

function enumerateChildNodes(childNodes, block) {
    function checkingBlock(node) {
        /* Element nodes (like tiles and units) have node type 1. Some other node types cause crashes when they are accessed with common enumeration functions. */
        if (node.nodeType == 1) {
            return block(node);
        }
    }
    enumerate(childNodes, checkingBlock);
}

function stringOfPropertiesOfObject(object) {
    var str = "";
    for (key in object) {
        str += key + ": " + object[key] + ", ";
    }
    return str;
}

/*** Nodes ***/

function createNode(parameters) {
    
    var node = document.getElementById(parameters.svg).contentDocument.documentElement.cloneNode(true);
    
    node.setAttribute("x", parameters.x);
    node.setAttribute("y", parameters.y);
    node.setAttribute("player", parameters.player) /* negative numbers = walls, loot, etc. (will be decided later), 0 = computer controlled enemy, 1 = p1, 2 = p2 */
    node.setAttribute("id", "node_p"+parameters.player);
    
    scene.appendChild(node);
    return node;
}

/* Update will process movement of players, bullets, etc. as well as collision detection and other future stuff. Essentially a new frame */
function update(){
    
    
    /* Set new angles */
    p1.theta -= p1.rotation_speed*p1.vr;
    p2.theta -= p2.rotation_speed*p2.vr;
    rotat("p1",p1.theta);
    rotat("p2",p2.theta);
    
    var p1sx = p1.speedx + Math.cos(p1.theta*Math.PI/180)*p1.acceleration*p1.vy*-1;
    var p1sy = p1.speedy + Math.sin(p1.theta*Math.PI/180)*p1.acceleration*p1.vy;
    var p2sx = p2.speedx + Math.cos(p2.theta*Math.PI/180)*p2.acceleration*p2.vy*-1;
    var p2sy = p2.speedy + Math.sin(p2.theta*Math.PI/180)*p2.acceleration*p2.vy;
    
    if(Math.sqrt(Math.pow(p1sx,2)+Math.pow(p1sy,2))<=p1.maxspeed){
        p1.speedx = p1sx;
        p1.speedy = p1sy;
    }
    if(Math.sqrt(Math.pow(p2sx,2)+Math.pow(p2sy,2))<=p2.maxspeed){
        p2.speedx = p2sx;
        p2.speedy = p2sy;
    }
    
    dgid("p1_speed").innerHTML = (Math.sqrt(Math.pow(p1.speedx,2)+Math.pow(p1.speedy,2))+"").substring(0,2);
    dgid("p2_speed").innerHTML = (Math.sqrt(Math.pow(p2.speedx,2)+Math.pow(p2.speedy,2))+"").substring(0,2);
    
    /* Future positions */
    var p1x = ga(p1.node, "x")*1 + p1.speedx;
    var p1y = ga(p1.node, "y")*1 + p1.speedy;
    var p2x = ga(p2.node, "x")*1 + p2.speedx;
    var p2y = ga(p2.node, "y")*1 + p2.speedy;
    
    /* Check if outside bounds */
    if(p1x < margin){p1x = margin;p1.speedx=p1.speedx*-4/5;}
    if(p1y < margin){p1y = margin;p1.speedy=p1.speedy*-4/5;}
    if(p1x > xmargin){p1x = xmargin;p1.speedx=p1.speedx*-4/5;}
    if(p1y > ymargin){p1y = ymargin;p1.speedy=p1.speedy*-4/5;}
    
    if(p2x < margin){p2x = margin;p2.speedx=p2.speedx*-4/5;}
    if(p2y < margin){p2y = margin;p2.speedy=p2.speedy*-4/5;}
    if(p2x > xmargin){p2x = xmargin;p2.speedx=p2.speedx*-4/5;}
    if(p2y > ymargin){p2y = ymargin;p2.speedy=p2.speedy*-4/5;}
    
    /* Set new positions */
    p1.node.setAttribute("x", p1x);
    p1.node.setAttribute("y", p1y);
    p2.node.setAttribute("x", p2x);
    p2.node.setAttribute("y", p2y);
    
    /* Make the SVG scene the same size as the window */
    sa(scene, "width", window.innerWidth);
    sa(scene, "height", window.innerHeight);
    
    if(p1.fire == 1){
        var ex = ga(p1.node,"x")*1+25+Math.cos(Math.PI/180*p1.theta)*40;
        var why = ga(p1.node,"y")*1+25-Math.sin(Math.PI/180*p1.theta)*40;
        circ(ex,why,4,"black",true,p1.theta);
    }
    
    sa(dgid("node_p1"),"x",ga(p1.node,"x"));
    sa(dgid("node_p1"),"y",ga(p1.node,"y"));
    sa(dgid("node_p2"),"x",ga(p2.node,"x"));
    sa(dgid("node_p2"),"y",ga(p2.node,"y"));
    
    moveBullet();
}


/*** Keyboard integration ***/

function keyUp(event) {
    switch (event.keyCode) {
        case 37 /* left arrow */:
            p1.vr = 0;
            break;
        case 39 /* right arrow */:
            p1.vr = 0;
            break;
        case 38 /* up arrow */:
            p1.vy = 0;
            $(".thrust1").attr("fill","#8C8C8C")
            break;
        case 40 /* down arrow */:
            p1.vy = 0;
            break;
        case 32 /* space */:
            p1.fire = 0;
            break;
            
        case 65 /* A(left) */:
            p2.vr = 0;
            break;
        case 68 /* D(right) */:
            p2.vr = 0;
            break;
        case 87 /* W(up) */:
            p2.vy= 0;
            $(".thrust2").attr("fill","#8C8C8C");
            break;
        case 83 /* S(down) */:
            p2.vy= 0;
            break;
            
    }
}

function keyDown(event) {
    switch (event.keyCode) {
        case 37 /* left arrow */:
            p1.vr = -1;
            event.preventDefault(); /*stop keyboard scrolling of browser*/
            break;
        case 39 /* right arrow */:
            p1.vr = 1;
            event.preventDefault(); /*stop keyboard scrolling of browser*/
            break;
        case 38 /* up arrow */:
            p1.vy= -1;
            event.preventDefault(); /*stop keyboard scrolling of browser*/
            $(".thrust1").attr("fill","red");
            break;
        case 40 /* down arrow */:
            p1.vy= 1;
            event.preventDefault(); /*stop keyboard scrolling of browser*/
            break;
        case 32 /* space */:
            p1.fire = 1;
            break;
        case 67 /* C button */:
            $(".bullet").remove();
            break;
            
        case 65 /* A(left) */:
            p2.vr = -1;
            break;
        case 68 /* D(right) */:
            p2.vr = 1;
            break;
        case 87 /* W(up) */:
            p2.vy= -1;
            $(".thrust2").attr("fill","red");
            break;
        case 83 /* S(down) */:
            p2.vy= 1;
            break;
        
    }
}

/*
    This is a poem
    about coding.
    There is a problem:
    Xcode does not allow
    for extra scrolling.
    
    How, then, you ask,
    is it possible 
    to scroll
    past the limits 
    of the code?
    
    The answer
    is simple.
    Either add 
    line breaks
    or a poem,
    whitespace
    or words.
 
    I have chosen 
    the latter.
    You can probably 
    tell
    because this 
    is not
    whitespace.
 
    It is a poem
    (which is,
    in this case,
    just a set of
    sentences 
    with some line breaks
    in between).
 
    How would this poem look
    without line breaks?
 
    This is prose about coding. There is a problem: Xcode does not allow for extra scrolling. 
    How, then, you as, is it possible to scroll past the limits of the code?
    The answer is simple. Either add line breaks or prose, whitespace or words. 
    I have chosen the latter. You can probably tell because this is not whitespace. 
    It is prose (which is, in this case, just a poem without line breaks). 
    How would this prose look with some line breaks? See above.
 */
