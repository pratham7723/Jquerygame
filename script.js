/* NAMESPACE */
const gameApp = {};

gameApp.listOfWords = [...words];
gameApp.score = 0;
gameApp.wordCounter = 1;
gameApp.timerStart = 60;
gameApp.winningScoreThreshold = 100;
gameApp.loseCondition = 10;
gameApp.wordGenerationSpeed = 1500;
gameApp.currentWordsPositions = [];
gameApp.gameOver = false;

gameApp.generateWords = () => {
  gameApp.countDown(gameApp.timerStart);
  const game = setInterval(function () {
    if (gameApp.score >= gameApp.winningScoreThreshold) {
      gameApp.gameOver = true;
      clearInterval(game);
      gameApp.playAgain();
      // Hide main game UI
      $(".score, .timer, .user-input, .words").hide();
      $(".ending, .ending-win").css("display", "flex");
      setTimeout(function () {
        animations.typewriter(".ending-win-title", 50);
        animations.typewriter(".ending-win-msg", 50);
        $(".ending-win .reset").css("display", "block");
        animations.typewriter(".ending-win .reset", 25);
      }, 300);
    }
    const wordsOnScreen = $(".word").length;
    if (wordsOnScreen > gameApp.loseCondition) {
      gameApp.gameOver = true;
      gameApp.playAgain();
      clearInterval(game);
      // Hide main game UI
      $(".score, .timer, .user-input, .words").hide();
      setTimeout(function () {
        animations.typewriter(".ending-lose-title", 50);
        animations.typewriter(".ending-sorry", 25);
        animations.typewriter(".ending-lose .reset", 25);
      }, 300);
      $(".ending, .ending-lose").css("display", "flex");
    }
    const randomWordPosition = utils.getRandomInteger(gameApp.listOfWords.length);
    const randomWord = gameApp.listOfWords[randomWordPosition];
    gameApp.listOfWords.splice(randomWordPosition, 1);
    const wordXPosition = `${utils.getRandomInteger(90)}%`;
    const wordYPosition = `${utils.getRandomInteger(73) + 12}%`;
    const wordId = `word-${gameApp.wordCounter}`;
    $(".words").append(`<h3 class="word" id="${wordId}">${randomWord}</h3>`);
    $(`#${wordId}`).css({
      position: 'absolute',
      left: wordXPosition,
      bottom: wordYPosition,
      visibility: "hidden"
    });
    gameApp.detectCollision($(`#${wordId}`));
    gameApp.wordCounter++;
  }, gameApp.wordGenerationSpeed);
};

gameApp.getInput = function () {
  $("input").on("input", function () {
    const userWord = $("input").val().trim();
    const currentWords = $(".word");
    for (let i = 0; i < currentWords.length; i++) {
      const word = currentWords[i];
      if (word.innerText === userWord) {
        $(".user-input").effect(
          "highlight",
          { color: "#a7efae" },
          300
        );
        animations.removeElement($(`#${word.id}`));
        gameApp.score += utils.getWordScore(word.innerText);
        $(".score").find("span").text(gameApp.score);
        $("input").val("");
      }
    }
  });
};

gameApp.detectCollision = function (word) {
  let collision = false;
  const top = word.position().top;
  const left = word.position().left;
  const width = word.width();
  const height = word.height();
  const right = left + width;
  const bottom = top + height;
  const positions = { top: top, left: left, right: right, bottom: bottom };
  if (gameApp.currentWordsPositions.length === 0) {
    gameApp.currentWordsPositions.push(positions);
    word.css({ visibility: "visible" }).hide().fadeIn();
  } else {
    for (let i = 0; i < gameApp.currentWordsPositions.length; i++) {
      const currentTop = gameApp.currentWordsPositions[i].top;
      const currentBot = gameApp.currentWordsPositions[i].bottom;
      const currentLeft = gameApp.currentWordsPositions[i].left;
      const currentRight = gameApp.currentWordsPositions[i].right;
      if (width <= currentRight - currentLeft) {
        if (
          ((top >= currentTop && top <= currentBot) || (bottom <= currentBot && bottom >= currentTop)) &&
          ((left >= currentLeft && left <= currentRight) || (right <= currentRight && right >= currentLeft))
        ) {
          const newXPosition = `${utils.getRandomInteger(90)}%`;
          const newYPosition = `${utils.getRandomInteger(73) + 12}%`;
          word.css({ bottom: newYPosition, left: newXPosition, visibility: "hidden" });
          collision = true;
          gameApp.detectCollision(word);
        }
      } else if (width > currentRight - currentLeft) {
        if (
          ((top >= currentTop && top <= currentBot) || (bottom <= currentBot && bottom >= currentTop)) &&
          ((left >= currentLeft && left <= currentRight) ||
            (right <= currentRight && right >= currentLeft) ||
            (left <= currentLeft && right >= currentRight))
        ) {
          const newXPosition = `${utils.getRandomInteger(90)}%`;
          const newYPosition = `${utils.getRandomInteger(73) + 12}%`;
          word.css({ bottom: newYPosition, left: newXPosition, visibility: "hidden" });
          collision = true;
          gameApp.detectCollision(word);
        }
      }
    }
    if (collision === false) {
      gameApp.currentWordsPositions.push(positions);
      word.css({ visibility: "visible" }).hide().fadeIn();
    }
  }
};

gameApp.countDown = function (startTime) {
  let remainingTime = startTime;
  const timer = setInterval(function () {
    if (gameApp.gameOver === true) {
      clearInterval(timer);
    }
    remainingTime--;
    $(".timer").find("span").text(remainingTime);
  }, 1000);
};

gameApp.clearWord = function () {
  $("form").on("submit", function (event) {
    event.preventDefault();
    $("input").val("");
  });
};

gameApp.playAgain = function () {
  $(document).on("keypress", function (event) {
    if (event.which === 13 && $(".reset").is(":visible")) {
      window.location.reload();
    }
  });
};

gameApp.init = function () {
  // Set a reasonable win threshold and reset score
  gameApp.score = 0;
  gameApp.winningScoreThreshold = 100; // or your preferred value
  $(".score").find(".metric").text(gameApp.score);
  $(".timer").find(".metric").text(gameApp.timerStart);
  $(".score, .timer, .user-input, .words").show();
  $(".ending, .ending-win, .ending-lose").hide();
  $(".bg-top, .bg-bottom").css("display", "flex").hide().fadeIn();
  $("input").val("");
  $(".user-input").focus();
  setTimeout(function () {
    gameApp.generateWords();
  }, 350);
  gameApp.getInput();
  gameApp.clearWord();
};

$(function () {
  gameApp.init();
});
