/* Should equal the number of SVG objects in the HTML doc. This isn't being calculated automatically because that occasionally fails to work. */
/* Props to my brother Pranav for this objectsLoaded idea. Before he suggested this, I was just implementing an n millisecond delay before loading the page. */
var objectsNotLoaded = 3;

var margin = 10;
var xmargin;
var ymargin;
var xpo = 3;
var svgns = "http://www.w3.org/2000/svg";
var ainterval;
var AIbool = false;

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
acceleration:0.5,
speedx:0,
speedy:0,
maxspeed:50, /*slowDown caps the speed anyway*/
firedelay:5,
firenum:0,
dead: false,
bv: 15, /*bullet velocity*/
slowDown: 0.97, /*less = faster slowdown*/
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
acceleration:1,
speedx:0,
speedy:0,
maxspeed:50,
firedelay:10,
firenum:0,
dead: false,
bv:15,
slowDown: 0.92,
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
    p2.node = createNode({svg:"spaceship", player:2, x:(window.innerWidth-margin-50), y:0});
    createNode({svg:"slime", player:0, x:150, y:150});
    $(".nodeType0").attr("vr","0");
    $(".nodeType0").attr("vy","0");
    $(".nodeType0").attr("fire","0");
    $(".nodeType0").attr("theta","90");
    
    setStat({player: p1, key: "health", value: 250});
    setStat({player: p1, key: "attack", value: 1});
    setStat({player: p1, key: "speed", value: 0});
    p1.rotation_speed = 3.6; /* 180 degrees a second */
    
    setStat({player: p2, key: "health", value: 100});
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
function rotat(element, degrees){
    element.setAttribute("style","-webkit-transform: rotate("+(90-degrees)+"deg); -webkit-transform-origin: 25px 25px;-ms-transform: rotate("+(90-degrees)+"deg); -ms-transform-origin: 25px 25px;transform: rotate("+(90-degrees)+"deg); transform-origin: 25px 25px;");
    
}

/* Add circle */
function circ(x, y, radius, color, underSpaceship, theta, bv){
    /* I'm using createNS because the innerHTML doesnt work with Safari */
    var newBullet = document.createElementNS(svgns, "circle");
    sa(newBullet, "class", "bullet");
    sa(newBullet, "cx", x);
    sa(newBullet, "cy", y);
    sa(newBullet, "r", radius);
    sa(newBullet, "fill", color);
    sa(newBullet, "vx", (Math.cos(Math.PI/180*theta)*bv));
    sa(newBullet, "vy", (Math.sin(Math.PI/180*theta)*bv*-1));
    if(underSpaceship){
        /* Do some magicianship to get it under the ships. I don't know how to do this off the top of my head, so I'm leaving it empty. May add this back in the future. */
    }
    scene.appendChild(newBullet);
}

/* Move bullet */
function moveBullet(){
    var thenode;
    
    for(var i = 0; i < dgid("scene").childNodes.length; i++){
        thenode = dgid("scene").childNodes[i];
        /* Check if its an unit or tile */
        if(thenode.nodeType == 1){
            /* Check if its a bullet */
            if(ga(thenode,"class") == "bullet"){
                
                /* Future position of bullet */
                var fx = (ga(thenode,"cx")*1+ga(thenode,"vx")*1);
                var fy = (ga(thenode,"cy")*1+ga(thenode,"vy")*1);
                /* Check if within bounds */
                if(fx<margin || fx>(xmargin+50) || fy<margin || fy>(ymargin+50)){
                    /* Remove bullet */
                    $(thenode).remove();
                }else {
                    /* Move bullet to future position */
                    sa(thenode,"cx",fx);
                    sa(thenode,"cy",fy);
                }
                
                if(thenode.nodeType == 1){
                    
                    if(collision($(thenode),$(dgid("node_p2")),true)){
                        sa(thenode,"fill","red");
                        sa(thenode,"stage",xpo);
                        sa(thenode,"vx",0);
                        sa(thenode,"vy",0);
                        sa(thenode,"r",6);
                        sa(thenode,"class","exbullet");
                        setStat({player: p2, key: "health", value: (p2.health-p1.attack)});
                        if(p2.health<=0){
                            $(dgid("node_p2")).remove();
                            p2.dead = true;
                        }
                    }
                    
                    if(collision($(thenode),$(dgid("node_p1")),true)){
                        sa(thenode,"fill","red");
                        sa(thenode,"stage",xpo);
                        sa(thenode,"vx",0);
                        sa(thenode,"vy",0);
                        sa(thenode,"r",6);
                        sa(thenode,"class","exbullet");
                        setStat({player: p1, key: "health", value: (p1.health-p2.attack)});
                        if(p1.health<=0){
                            $(dgid("node_p1")).remove();
                            p1.dead = true;
                        }
                    }
                }
            }else if(ga(thenode,"class") == "exbullet"){
                /* Removes exploded bullets or decreases time span */
                sa(thenode,"stage",ga(thenode,"stage")*1-1);
                if(ga(thenode,"stage")*1==0){
                    $(thenode).remove();
                }   
            }
        }
    }
}

/* jQuery collision function */
function collision($div1, $div2, isBullet) {
    var left1 = $div1.offset().left;
    var right1;
    var top1 = $div1.offset().top;
    var bottom1;
    
    var left2 = $div2.offset().left;
    var top2 = $div2.offset().top;
    var right2 = left2*1+$div2[0].getAttribute("width")*1;
    var bottom2 = top2*1+$div2[0].getAttribute("height")*1;
    
    if(!isBullet){
        right1 = left1*1+$div1[0].getAttribute("width")*1;
        bottom1 = top1*1+$div1[0].getAttribute("height")*1;
    }else {
        right1 = left1*1+8;
        bottom1 = top1*1+8;
    }
    
    if((between(left1,left2,right2) || between(right1,left2,right2)) && (between(top1,top2,bottom2) || between(bottom1,top2,bottom2))){
        return true;
    }else {
        return false;
    }
}
function between(target,bet1,bet2){
    if((target>=bet1 && target<=bet2) || (target<=bet1 && target>=bet2)){
        return true;
    }else {
        return false;
    }
}

/* AIIII AHAHAHAHA */
function AI(node){
    var desangle;
    var eex;
    var eey;
    var theta;
    var distanceP1 = Math.sqrt(Math.pow((ga(p1.node,"x")*1-ga(node,"x")*1),2)+Math.pow((ga(p1.node,"y")*1-ga(node,"y")*1),2));
    var distanceP2 = Math.sqrt(Math.pow((ga(p2.node,"x")*1-ga(node,"x")*1),2)+Math.pow((ga(p2.node,"y")*1-ga(node,"y")*1),2));
    
    if(distanceP1 <= distanceP2){
        targetNode = p1.node;
    }else {
        targetNode = p2.node;
    }
        if(ga(node,"theta")*1 >= 0){
            theta = (ga(node,"theta")*1)%360;
        }else {
            theta = 360-Math.abs((ga(node,"theta")*1)%360);
        }
        eex = ga(targetNode,"x")*1-ga(node,"x")*1;
        /* I always forget that positive y is down */
        eey = (ga(targetNode,"y")*1-ga(node,"y")*1)*-1;
        
        if(ga(targetNode,"x")*1 >= ga(node,"x")*1){
            desangle = Math.atan(eey/eex)*180/Math.PI;
        }else {
            desangle = Math.atan(eey/eex)*180/Math.PI+180;
        }
        
        if(desangle >= 0){
            desangle = desangle%360;
        }else {
            desangle = 360-Math.abs(desangle%360);
        }
        p(eex+" || "+eey+" || "+desangle+" || "+(desangle%360-p2.theta%360));
        if((desangle%360-theta)<=180 && (desangle%360-theta)>0){
            sa(node,"vr",-1);
        }else if((desangle%360-theta)>180 || (desangle%360-theta)<0){
            sa(node,"vr",1);
        }else if((desangle%360-theta) == 0){
            sa(node,"vr",0);
        }
        
        sa(node,"fire",1);
        sa(node,"vy",-1);
        
}

function AIP2(){
    var desangle;
    var eex;
    var eey;
    p2.bv = 20;
    p1.bv=10;
    p2.firedelay = 5;
    var theta;
    /* The AI can't aim to save its life */
    
        if(p2.theta >= 0){
            theta = p2.theta%360;
        }else {
            theta = 360-Math.abs(p2.theta%360);
        }
        eex = ga(p1.node,"x")*1-ga(p2.node,"x")*1;
        /* I always forget that positive y is down */
        eey = (ga(p1.node,"y")*1-ga(p2.node,"y")*1)*-1;
        
        if(ga(p1.node,"x")*1 >= ga(p2.node,"x")*1){
            desangle = Math.atan(eey/eex)*180/Math.PI;
        }else {
            desangle = Math.atan(eey/eex)*180/Math.PI+180;
        }
        
        if(desangle >= 0){
            desangle = desangle%360;
        }else {
            desangle = 360-Math.abs(desangle%360);
        }
        
        p(eex+" || "+eey+" || "+desangle+" || "+(desangle%360-p2.theta%360));
        if((desangle%360-theta)<=180 && (desangle%360-theta)>0){
            p2.vr = -1;
        }else if((desangle%360-theta)>180 || (desangle%360-theta)<0){
            p2.vr = 1;
        }else if((desangle%360-theta) == 0){
            p2.vr = 0;
        }
        p2.fire = 1;
        p2.vy = -1;
        if(p1.dead || p2.dead){
            AIbool = false;   
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
    node.setAttribute("class","nodeType"+parameters.player);
    
    scene.appendChild(node);
    return node;
}

/* Update will process movement of players, bullets, etc. as well as collision detection and other future stuff. Essentially a new frame */
function update(){
    
    
    /* Set new angles */
    p1.theta -= p1.rotation_speed*p1.vr;
    p2.theta -= p2.rotation_speed*p2.vr;
    //if(p1.dead==1){
    rotat(dgid("p1"),p1.theta);
    //}
    //if(p2.dead==1){
    rotat(dgid("p2"),p2.theta);
    //}
    p1.theta = p1.theta%360;
    p2.theta = p2.theta%360;
    //p1.vy=p1.vy*p1.dead;
    //p2.vy=p2.vy*p2.dead;
    p1.speedx *= p1.slowDown;
    p1.speedy *= p1.slowDown;
    p2.speedx *= p2.slowDown;
    p2.speedy *= p2.slowDown;
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
    if(p1x < margin){p1x = margin;p1.speedx=p1.speedx*-1/2;}
    if(p1y < margin){p1y = margin;p1.speedy=p1.speedy*-1/2;}
    if(p1x > xmargin){p1x = xmargin;p1.speedx=p1.speedx*-1/2;}
    if(p1y > ymargin){p1y = ymargin;p1.speedy=p1.speedy*-1/2;}
    
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
    /* Set bounds */
    xmargin = ga(scene, "width")*1 - margin - 50;
    ymargin = ga(scene, "height")*1 - margin - 50;
    
    sa(dgid("node_p1"),"x",ga(p1.node,"x"));
    sa(dgid("node_p1"),"y",ga(p1.node,"y"));
    sa(dgid("node_p2"),"x",ga(p2.node,"x"));
    sa(dgid("node_p2"),"y",ga(p2.node,"y"));
    
    
    if(p1.fire == 1){
        if(p1.firenum==0){
            var ex = ga(p1.node,"x")*1+25+Math.cos(Math.PI/180*p1.theta)*40;
            var why = ga(p1.node,"y")*1+25-Math.sin(Math.PI/180*p1.theta)*40;
            circ(ex,why,4,"black",true,p1.theta,p1.bv);
        }
        p1.firenum++;
        if(p1.firenum > p1.firedelay){
            p1.firenum = 0;
        }
    }else {
        p1.firenum = 0;
    }
    
    if(p2.fire == 1){
        if(p2.firenum==0){
            var ex = ga(p2.node,"x")*1+25+Math.cos(Math.PI/180*p2.theta)*40;
            var why = ga(p2.node,"y")*1+25-Math.sin(Math.PI/180*p2.theta)*40;
            circ(ex,why,4,"black",true,p2.theta,p2.bv);
        }
        p2.firenum++;
        if(p2.firenum > p2.firedelay){
            p2.firenum = 0;
        }
    }else {
        p2.firenum = 0;
    }
    
    moveBullet();
    
    
    
    /* Move enemies */
    var enemies = document.getElementsByClassName("nodeType0");
    for(var i = 0; i < enemies.length; i ++){
        if(AIbool){
            AI(enemies[i]);
        }
        
        /* Set new angles */
        sa(enemies[i],"theta",(ga(enemies[i],"theta")*1-ga(enemies[i],"vr")*3.6));
        rotat(enemies[i].childNodes[5],ga(enemies[i],"theta")*1);
        sa(enemies[i],"theta",(ga(enemies[i],"theta")%360));
        
        
        // Future position
        var futx = ga(enemies[i],"x")*1+Math.cos(Math.PI/180*ga(enemies[i],"theta"))*ga(enemies[i],"vy")*-1*5;
        var futy = ga(enemies[i],"y")*1+Math.sin(Math.PI/180*ga(enemies[i],"theta"))*ga(enemies[i],"vy")*5;
        /* Check bounds */
        if(futx < margin){futx = margin;}
        if(futy < margin){futy = margin;}
        if(futx > xmargin){futx = xmargin;}
        if(futy > ymargin){futy = ymargin;}
        // Set future positions
        sa(enemies[i],"x",futx);
        sa(enemies[i],"y",futy);
            
    }
    
    
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
            $(".thrust1").attr("thrust", "none");
            break;
        case 40 /* down arrow */:
            p1.vy = 0;
            $(".thrust1").attr("thrust", "none")
            break;
        case 188 /* < button */:
            p1.fire = 0;
            break;
            
        case 65 /* A(left) */:
            p2.vr = 0;
            break;
        case 68 /* D(right) */:
            p2.vr = 0;
            break;
        case 87 /* W(up) */:
            p2.vy = 0;
            $(".thrust2").attr("thrust","none");
            break;
        case 83 /* S(down) */:
            p2.vy = 0;
            $(".thrust2").attr("thrust", "none");
            break;
        case 84 /* T key */:
            p2.fire = 0;
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
            $(".thrust1").attr("thrust","forward");
            break;
        case 40 /* down arrow */:
            p1.vy= 1;
            event.preventDefault(); /*stop keyboard scrolling of browser*/
            $(".thrust1").attr("thrust", "backward");
            break;
        case 188 /* < arrow */:
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
            $(".thrust2").attr("thrust","forward");
            break;
        case 83 /* S(down) */:
            p2.vy= 1;
            $(".thrust2").attr("thrust", "backward");
            break;
        case 84 /* T key */:
            p2.fire = 1;
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
