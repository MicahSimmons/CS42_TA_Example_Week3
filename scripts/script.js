

console.log("Hello World!");

/* Events */
const Events = {
    START: 0,
    TICK: 4
}

/* States */
const States = {
    START: 0,
    PLAYING: 1,
    GAMEOVER: 2
}

/* Avatar direction */
const Dir = {
    STOP: 0,
    LEFT: 1,
    RIGHT: 2
}

/* Model */
class Model {
    constructor () {
        this.init();
        this.setKey = this.setKey.bind(this);
        this.checkCollision = this.checkCollision.bind(this);
    }

    init () {
        this.gameState = States.START;
        this.gameTime = 0;
        this.avatar = {
            direction: Dir.STOP,
            position: 50,
            life: 20
        }
        this.direction = Dir.STOP;

        this.asteroids = [
            { x: 10, y: 110 },
            { x: 30, y: 110 },
            { x: 50, y: 110 },
            { x: 70, y: 110 },
            { x: 30, y: 110 },
            { x: 50, y: 110 },
            { x: 70, y: 110 },
            { x: 90, y: 110 }
        ]

        this.keys = {
            'KeyA': false,
            'KeyD': false
        };

        this.collision = false;
    }

    setKey(keyCode, isKeyDown) {
        this.keys[keyCode] = isKeyDown;

        if (this.keys['KeyA']) {
            this.avatar.direction = Dir.LEFT;
        } else if (this.keys['KeyD']) {
            this.avatar.direction = Dir.RIGHT;
        } else {
            this.avatar.direction = Dir.STOP;
        }
    }

    updatePosition() {
        this.gameTime++;
        switch (this.avatar.direction) {
            case Dir.RIGHT:
                this.avatar.position += 1;
                break;
            case Dir.LEFT:
                this.avatar.position -= 1;
                break;
        }

        this.avatar.position = Math.max(0, this.avatar.position);
        this.avatar.position = Math.min(95, this.avatar.position);
    }

    updateAsteroids() {
        this.asteroids.forEach( (pos) => {
            pos.y += 2;
            if (pos.y > 100) {
                pos.y = Math.random() * -100;
                pos.x = Math.random() * 100;
            }
        })
    }

    checkCollision() {
        this.collision = false;
        this.asteroids.forEach( (pos, idx) => {
            if ((pos.y > 70) && (pos.y < 85)) {
                if (  ((pos.x + 15)   >  (this.avatar.position)   ) &&
                      ((pos.x + 10)   <  (this.avatar.position+10))  ) {
                    //console.log("Pos:" + pos.x + " ava:" + this.avatar.position);
                    this.collision = true;
                    this.avatar.life--;
                }
            }
        })
    }
}


/* View Interface */
class View {
    constructor (root, model) {
        this.root = root;
        this.spaceship = document.getElementsByClassName("spaceship")[0];
        this.update = this.update.bind(this);
        this.starfield = document.getElementsByClassName("starfield")[0];
        model.asteroids.map( (pos, idx) => {
            let asteroid = document.createElement("div");
            asteroid.classList.add("asteroid");
            asteroid.innerHTML='<img src="./images/asteroid.png"></img>'
            asteroid.style.left = pos.x + "vw";
            asteroid.style.top = pos.y + "vh";
            asteroid.id = "asteroid" + idx;
            this.starfield.appendChild(asteroid);
        })

        this.instructions = document.getElementById("instructions");
        this.gameover = document.getElementById("gameover");
    }

    update (model, event) {
        this.instructions.style.visibility = (model.gameState == States.START) ? "" : "hidden";
        this.gameover.style.visibility = (model.gameState == States.GAMEOVER) ? "" : "hidden";

        view.spaceship.style.left = model.avatar.position + "vw";
        model.asteroids.forEach( (pos, idx) => {
            let asteroid = document.getElementById("asteroid"+idx);
            asteroid.style.left = pos.x + "vw";
            asteroid.style.top = pos.y + "vh";
        })

        if ((model.collision)  && (model.gameState == States.PLAYING)) {
            this.starfield.style.background = (model.gameTime % 2) ? "red" : "white";
        } else {
            this.starfield.style.background = "black";
            this.starfield.style.backgroundImage =  "url('./images/space5.png')";
            this.starfield.style.backgroundRepeat = "repeat";
            this.starfield.style.backgroundPosition = "0px " + model.gameTime*3 + "px";
        }
    }
}


/* Control Logic */
class Control {
    constructor () {
        this.fsm = this.fsm.bind(this);
        this.setView = this.setView.bind(this);
    }

    setView (view) {
        this.view = view;
    }

    fsm(model, event, data) {
        switch (model.gameState) {
            case States.START:
                switch (event) {
                    case Events.START:
                        model.init();
                        model.gameState = States.PLAYING;
                        break;
                }
                break;

            case States.PLAYING:
                switch (event) {
                    case Events.TICK:
                        model.updatePosition();
                        model.updateAsteroids();
                        model.checkCollision();
                        if (model.avatar.life <=0) {
                            model.gameState = States.GAMEOVER;
                        }
                        break;
                }
                break;
            case States.GAMEOVER:
                switch (event) {
                    case Events.START:
                        model.init();
                        model.gameState = States.PLAYING;
                }
                break;
        }

        this.view.update(model, event);
    }
}



/* Main */
var model = new Model();
model.init();

var control = new Control();

var gameroot = document.getElementById("#gamecontainer");
var view = new View(gameroot, model)
control.setView(view);

function q(event, data) {
    setTimeout(control.fsm, 0, model, event, data);
}

//control.fsm(model, Events.START, {});

setInterval(() => {
    q(Events.TICK, {});

}, 50)

/**** Goofing around *****/
document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyD":
        case "KeyA":
            model.setKey(event.code, true);
            break;
        case "Space":
            q(Events.START, {});
            break;
    }
})

document.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "KeyD":
        case "KeyA":
            model.setKey(event.code, false);
            break;
    }
})