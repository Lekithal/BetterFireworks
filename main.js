const canvas = document.getElementById("draw");
const ctx = canvas.getContext("2d")

const FPS = 1000 / 60;

let entities = [];
let entityQueue = [];

let then = Date.now(); 
let now, elapsed;

function draw() {
    requestAnimationFrame(draw);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > FPS) {
        then = now - (elapsed % FPS);

        canvas.width = innerWidth;
        canvas.height = innerHeight;

        entities = entities.concat(entityQueue);
        entityQueue = [];

        //updates each entity and deletes entities
        entities = entities.filter(entity => entity.update(entity.data));
    }
}


function newEntity(data, update) { 
    let entity = {"data": data, "update": update};
    entityQueue.push(entity);
    return entity;
}

const randFloat = (min, max) => Math.random() * (max - min) + min
const randInt = (min, max) => Math.round(randFloat(min, max))

function summonCluster(data, color) {
    for (let i = 0; i < 10; i++) {
        summonFirework(data.position, [randFloat(-10, 10), randInt(-15, 4)], false, color, 10);
    }
}

function summonFirework(position, velocities, main = true, color = `hsl(${randFloat(0, 360)}, 100%, 50%)`, lifespan = 10, cluster = false) {

    let data = {
        "state": "flying",
        "position": Array.from(position),
        "velocities": velocities,
        "trail": new Array(5).fill(position),
        "color": color,
        "type": ["clone", "main"][Number(main)],
        "lifespan": lifespan,
        "cluster": cluster
    }

    let update = data => {
        if (data.state == "flying") {

            data.position[0] += data.velocities[0];
            data.position[1] += data.velocities[1];
            
            data.velocities[1] += 1;
    
            let x = data.position[0];
            let y = data.position[1];
    
            data.trail.push([x, y]);

        }

        data.trail.shift();
        
        ctx.fillStyle = data.color;
        ctx.strokeStyle = data.color;

        for (let i = 0; i < data.trail.length; i++) {
            if (data.trail[i] == undefined) { continue; }

            let x1 = data.trail[i][0];
            let y1 = data.trail[i][1];

            ctx.beginPath();
            ctx.arc(x1, y1, 2, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.closePath();

            if (i == data.trail.length - 1) { continue; }

            let x2 = data.trail[i + 1][0];
            let y2 = data.trail[i + 1][1];
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
        }

        data.lifespan -= 1
        if (data.lifespan <= 0) { data.state = "pop"; }

        if (data.trail.length == 0) {
            if (data.type == "main") {

                if (data.cluster){
                    let value = Number(data.color.split(",")[0].substr(4));

                    for (i = 0; i < 5; i++){
                        summonCluster(data, `hsl(${value + 360 + [-60, 30, 0, 30, 60][i]}, 100%, 50%)`)
                    }

                } else {
                    summonCluster(data, data.color);
                }
            }

            return false;
        }

        return true;
    }

    newEntity(data, update);
}

function goalClick(data) {
    let x = data.clientX;
    let y = data.clientY;

    let fx = randInt(0, innerWidth);
    let fy = innerHeight;


    let frames = 50; //number of frames before the firework should pop
    let v1 = (x - fx) / frames;
    let v2 = (y - fy) / frames - (frames - 1) / 2;

    summonFirework([fx, fy], [v1, v2], true, `hsl(${randFloat(0, 360)}, 100%, 50%)`, frames, randInt(1, 5) == 1);
}

addEventListener("mousedown", goalClick)

draw();