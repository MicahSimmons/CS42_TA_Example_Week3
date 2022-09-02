

console.log("Hello World!");

/* Events */
var Events = {
    START: 0,
    GUESS: 1,
    CORRECT: 2,
    INCORRECT: 3
}

/* States */
var States = {
    START: 0,
    PLAYING: 1,
    GAMEOVER: 2
}

/* Model */
class Model {
    constructor () {
        this.gameState = States.START;
        this.theNumber = -1;
        this.guesses = 0;
        this.lastGuess = -1;        
    }

    init () {
        this.theNumber = Math.floor(Math.random() * 100) + 1
        this.guesses = 0
        this.lastGuess = -1        
    }

    guess (new_guess) {
        this.guesses++;
        this.lastGuess = new_guess;
    
        if (new_guess == this.theNumber) {
          return Events.CORRECT;
        } else {
          return Events.INCORRECT;
        }
    }
}


/* View Interface */
class View {
    constructor (root) {
        console.log("here!");
        this.root = root;
        this.gameOut = document.getElementById('#output')
        this.gameIn = document.getElementById("#gameInput")
        this.gameBtn = document.getElementById("#gameBtn")
        this.btn_cb = null;
        this.last_guess_count = 0;

        this.btnHandler = this.btnHandler.bind(this);
        this.update = this.update.bind(this);

        console.log(this.gameBtn);
        this.gameBtn.addEventListener("click", this.btnHandler);
    }

    addButtonListener( btn_cb ) {
        this.btn_cb = btn_cb;
    }

    btnHandler () {
        var inputText = this.gameIn.value;
        if (this.btn_cb) {
            this.btn_cb(parseInt(inputText));
        }
    }

    update (model, event) {
        if (model.guesses == this.last_guess_count) {
            return;
        }
        this.last_guess_count = model.guesses;

        if (model.lastGuess == "") {
          this.gameOut.innerHTML += "Type a number between 1 and 100!<br>";
        }

        if (isNaN(model.lastGuess)) {
            this.gameOut.innerHTML += "That wasn't a number...<br>";
        }

        if (model.lastGuess == model.theNumber) {
            this.gameOut.innerHTML += "You got it in " + model.guesses + " tries!<br>";
        }

        if (model.lastGuess < model.theNumber) {
            this.gameOut.innerHTML += model.lastGuess + " was too low...<br>"
        }

        if (model.lastGuess > model.theNumber) {
            this.gameOut.innerHTML += model.lastGuess + " was too high...<br>"
        }
    }
}


/* Control Logic */
class Control {
    constructor () {
        this.fsm = this.fsm.bind(this);
        this.guessHandler = this.guessHandler.bind(this);
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
                    case Events.GUESS: {
                        var result = model.guess(data);
                        this.fsm(model, result, data);
                    } break;
                    case Events.CORRECT:
                        model.gameState = States.GAMEOVER;
                        break;
                    case Events.INCORRECT:
                        model.gameState = States.PLAYING;
                        break;
                }
                break;
            case States.GAMEOVER:
                break;
        }

        this.view.update(model, event);
    }
    
    guessHandler( guessText ) {
        q(Events.GUESS, guessText);
    }
}



/* Main */
var model = new Model();
model.init();

var control = new Control();

var gameroot = document.getElementById("#gamecontainer");
var view = new View(gameroot)
view.addButtonListener(control.guessHandler);
control.setView(view);

function q(event, data) {
    setTimeout(control.fsm, 0, model, event, data);
}

control.fsm(model, Events.START, {});