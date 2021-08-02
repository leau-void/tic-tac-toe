const gameBoard = (function () {
  let gameState = [];
  
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
      let currentPick;
      
      
     if (this.aiLevel == "easy") {

        let pickFunc = () => Math.floor(Math.random() * 9)
      

        currentPick = pickFunc();

        while(gameBoard.gameState[currentPick]) {
          currentPick = pickFunc();
        }
      } else if (this.aiLevel == "unbeatable") {
        currentPick = this.findBestPick(gameBoard.gameState, this.picks);
      }
      
      document.querySelector(`[data-position="${currentPick}"]`).click();
      
    },
    
    findBestPick(state, picks) {

      const otherPlayer = (this.marker == "O") ? game.playerOne : game.playerTwo;
      let currentPick;
      
      if ((picks.length + otherPlayer.picks.length) == 8) {
       return state.findIndex(position => position == null)
      }
      
      const winOptions = [[0,1,2], [0,3,6], [0,4,8], [3,4,5], [1,4,7], [2,4,6], [6,7,8], [2,5,8]]
 
      let closestWin = Array.from(winOptions).map(option => option.filter(position => !picks.includes(position))).sort((lastOption, nextOption) => {
        return (lastOption.length < nextOption.length) ? -1 : 1
      })
        
      closestWin = closestWin.filter(option => option.every(position => {
        return (otherPlayer.picks.includes(position)) ? false : true;           
      })).filter(option => option.length < 3)
      if (closestWin.length && closestWin[0].length == 1) { 
        return closestWin[0][0]
      } else {
        let closestOppWin = Array.from(winOptions).map(option => option.filter(position => !otherPlayer.picks.includes(position))).sort((lastOption, nextOption) => {
          return (lastOption.length < nextOption.length) ? -1 : 1
        })
            
      closestOppWin = closestOppWin.filter(option => option.every(position => {
        return (picks.includes(position)) ? false : true;           
      }))
      if (closestOppWin[0] && closestOppWin[0].length == 1) { 
        return closestOppWin[0][0]
      }}

      if (this.marker == "X") { 
            if (this.roundsPlayed == 0) {
            return 0;
              
            } else if (this.roundsPlayed == 1) {
              return (state[4]) ? 8 : (game.playerTwo.picks.includes(1) || game.playerTwo.picks.includes(2)) ? 6 : 2;
            } 
            } else {
            if (this.roundsPlayed== 0) {
            return (state[4]) ? 0 : 4;
            } else if (this.roundsPlayed == 3) {
              return state.findIndex(position => position == null)
            }
      }

      if (closestWin.length > 1) {
        let output;
        closestWin.forEach((option, i) => {
          for (let j = 0; j < closestWin.length; j++) {
            if (j == i) continue;
            if (closestWin[j].includes(option[0])) {
              output = option[0];
              break;
            } else if (closestWin[j].includes(option[1])) {
              output = option[1];
              break;
            } else {
              continue;
            }
          }
        })
        if (output) return output;
      }

      let stateCopy = Array.from(state);
      let picksCopy = Array.from(picks);
      let picksOppCopy = Array.from(otherPlayer.picks);
      let bestOption = {}
      for (i = 0; i < stateCopy.length; i++) {
  
        if (stateCopy[i]) continue;

        stateCopy[i] = this.marker;
        picksCopy.push(i);
        let currentBest = this.findBestPick(stateCopy, picksCopy);
        bestOption[currentBest] = ([currentBest] in bestOption) ? ++bestOption[currentBest] : 1;
        stateCopy[i] = null;
        picksCopy.pop();
      }

      let bestOptionArray = Array.from(Object.keys(bestOption)).sort((lastOption, nextOption) => (bestOption[lastOption] < bestOption[nextOption]) ? 1 : -1)
      return bestOptionArray[0]
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

  const playerOne = PlayerFactory("Player One", "X", true);
  const playerTwo = PlayerFactory("Player Two", "O", true);
  
  
  (function() {
    const form = document.forms[0]
  
  
    const getForm = function() {
    const whichPlayer = (form.marker.value === "X") ? playerOne : playerTwo;
    const otherPlayer = (whichPlayer == playerOne) ? playerTwo : playerOne;

    whichPlayer.name = form.name1.value;
    otherPlayer.name = form.name2.value;
  
    otherPlayer.isHuman = JSON.parse(form.humanorai.value);
    if (!otherPlayer.isHuman) otherPlayer.aiLevel = form.ailevel.value;
    if (!otherPlayer.isHuman) otherPlayer.name = "The Computer"

    form.classList.add("visually-hidden")

    gameBoard.gameSet();
    playerOne.resetPlayer();
    playerTwo.resetPlayer();
    _createBoard();
    document.querySelector("#win-text").classList.add("visually-hidden");
    
    if (!playerOne.isHuman) playerOne.pickCPU();
    }

    const toggleAIRadio = function() {
      document.querySelector("#ai-form-label").classList.toggle("visually-hidden");
      document.querySelector("#player-two-name").classList.toggle("visually-hidden");
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
      if (!otherPlayer.isHuman) {otherPlayer.pickCPU()}
    }
  };
  
  
  const _checkEnd = function(whoPicked) {

    const winOptions = [[0,1,2], [0,3,6], [0,4,8], [3,4,5], [1,4,7], [2,4,6], [6,7,8], [2,5,8]]

    let didWin = winOptions.some(option => {
      if (option.every(position => whoPicked.getPicks().includes(position))) {
        return (function(whoPicked) {
          
          document.querySelectorAll(".cell").forEach(cell => cell.removeEventListener("click", _pickHandler))
          
          let winText = document.querySelector("#win-text");
          winText.textContent = `${whoPicked.name} wins!`;
          winText.classList.remove("visually-hidden");

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
    document.querySelector("#win-text").classList.add("visually-hidden");

    if (!playerOne.isHuman) playerOne.pickCPU();
  })

  _createBoard();

  return {playerOne, playerTwo}
})();


