const gameBoard = (function () {
  const gameState = [];
  
  const gameSet = function() {
    for (let i = 0; i < 9; i++) {
    gameState[i] = null;
    }
  }
  
  gameSet()

  return {gameState, gameSet}
})();


const PlayerFactory = (name, marker, isHuman, aiLevel) => {
  const playerProto = {
    pick() {
      if (event.target.textContent) return false;

      gameBoard.gameState[event.target.dataset.position] = this.marker;
      event.target.textContent = this.marker;
      this.picks.push(Number(event.target.dataset.position));
      
      this.roundsPlayed++
      return true;
    },
    
    resetPlayer() {
      this.roundsPlayed = 0;
      this.picks = [];
    },
    
    pickCPU() {
      //  console.log(aiLevel)
     // if (this.aiLevel == "easy") {

        let pickFunc = () => Math.floor(Math.random() * 9)
      

        let currentPick = pickFunc();

        while(gameBoard.gameState[currentPick]) {
          currentPick = pickFunc();
        }
        document.querySelector(`[data-position="${currentPick}"]`).click();

     // }
      
    },
    
    getPicks() {
      return this.picks
    }
  }
  
  this.roundsPlayed = 0;
  this.picks = [];

  return Object.assign (Object.create(playerProto), {name, marker, isHuman, roundsPlayed, picks, aiLevel})
}


const game = (function() {

  const playerOne = PlayerFactory("One", "X", true);
  const playerTwo = PlayerFactory("Two", "O", true);
  
  
  (function() {
    const form = document.forms[0]
  
  
    const getForm = function() {
    const whichPlayer = (form.marker.value === "X") ? playerOne : playerTwo;
    const otherPlayer = (whichPlayer == playerOne) ? playerTwo : playerOne;

    whichPlayer.name = form.name1.value;
    otherPlayer.name = form.name2.value;
  
    otherPlayer.isHuman = JSON.parse(form.humanorai.value);
    if (!otherPlayer.isHuman) otherPlayer.aiLevel = form.ailevel.value;

    form.classList.add("visually-hidden")

    gameBoard.gameSet();
    playerOne.resetPlayer();
    playerTwo.resetPlayer();
    _createBoard();
    
    if (!playerOne.isHuman) otherPlayer.pickCPU();
    }

    const toggleAIRadio = function() {
      document.querySelector("#ai-form-label").classList.toggle("visually-hidden")
    }
  
  form.querySelector("#human-or-ai").addEventListener("change", toggleAIRadio)
  form.querySelector("#submit-btn").addEventListener("click", getForm)
  })();
  

  const _createBoard = () => {
    const gameStateArray = gameBoard.gameState;

    document.querySelectorAll(".cell").forEach(cell => cell.remove());

    gameStateArray.forEach((element, index) => {
      const newCell = document.createElement("div");
      newCell.classList.add("cell");
      newCell.dataset.position = index;
      newCell.textContent = element;
      document.querySelector("#game-board").appendChild(newCell);
      newCell.addEventListener("click", _pickHandler);
  })}
  
  const _pickHandler = function() {
    let whoPicked;
        if (playerOne.roundsPlayed === playerTwo.roundsPlayed) {
          if(!playerOne.pick()) return;
          whoPicked = playerOne;
        } else {
          if (!playerTwo.pick()) return;
          whoPicked = playerTwo;
        }

    const otherPlayer = (whoPicked == playerOne) ? playerTwo : playerOne;

    if (_checkEnd(whoPicked)) {
      if (!otherPlayer.isHuman) {playerOne.pickCPU()}
    }
  };
  
  
  const _checkEnd = function(whoPicked) {

    const winOptions = [[0,1,2], [0,3,6], [0,4,8], [3,4,5], [1,4,7], [2,4,6], [6,7,8], [2,5,8]]

    let didWin = winOptions.some(option => {
      if (option.every(position => whoPicked.getPicks().includes(position))) {
        return (function(whoPicked) {
          
          document.querySelectorAll(".cell").forEach(cell => cell.removeEventListener("click", _pickHandler))
          
          console.log(`${whoPicked.name} wins!`);
          return true;
        })(whoPicked);
      }
    }
    )

    if (didWin) return false;


    if (!gameBoard.gameState.includes(null)) {
      console.log("tie");
      return false;
    }

    return true;
  }
  
  
  document.querySelector("#reset-btn").addEventListener("click", () => {
    gameBoard.gameSet();
    playerOne.resetPlayer();
    playerTwo.resetPlayer();
    _createBoard();

    if (!playerOne.isHuman) playerOne.pickCPU();
  })

  _createBoard();

  return {playerOne, playerTwo}
})();


