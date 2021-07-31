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


const PlayerFactory = (name, marker, isHuman) => {
  const playerProto = {
    pick() {
      if (event.target.textContent) return;

      gameBoard.gameState[event.target.dataset.position] = this.marker;
      event.target.textContent = this.marker;
      this.picks.push(Number(event.target.dataset.position));
      
      this.roundsPlayed++
    },
    
    resetPlayer() {
      this.roundsPlayed = 0;
      this.picks = [];
    },
    
    pickCPU() {
      console.log("cpu")
    },
    
    getPicks() {
      return this.picks
    }
  }
  
  this.roundsPlayed = 0;
  this.picks = [];

  return Object.assign (Object.create(playerProto), {name, marker, isHuman, roundsPlayed, picks})
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

  form.classList.add("visually-hidden")
  }
  
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
      newCell.addEventListener("click", _pickHandler)
  })}
  
  const _pickHandler = function() {
    let whoPicked;
        if (playerOne.roundsPlayed === playerTwo.roundsPlayed) {
          playerOne.pick();
          whoPicked = playerOne;
        } else {
          playerTwo.pick();
          whoPicked = playerTwo;
        }

    const otherPlayer = (whoPicked == playerOne) ? playerTwo : playerOne;

    if (!otherPlayer.isHuman) { otherPlayer.pickCPU();
    }

    _checkEnd(whoPicked);
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


    if (!gameBoard.gameState.includes(null)) {
      console.log("tie");
    }
  }
  
  
  document.querySelector("#reset-btn").addEventListener("click", () => {
    gameBoard.gameSet();
    playerOne.resetPlayer();
    playerTwo.resetPlayer();
    _createBoard();
  })

  _createBoard();

  return {playerOne, playerTwo}
})();


