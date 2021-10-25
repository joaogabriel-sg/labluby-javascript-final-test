((doc) => {
  "use strict";

  function app() {
    const dqs = (selector) => doc.querySelector(selector);
    const dqsa = (selector) => [...doc.querySelectorAll(selector)];

    const $gameName = dqs('[data-js="game-name"]');
    const $gameDescription = dqs('[data-js="game-description"]');
    const $gamesType = dqs('[data-js="games-type"]');
    const $gameNumbers = dqs('[data-js="game-numbers"]');

    const $buttonCompleteGame = dqs('[data-js="button__complete-game"]');
    const $buttonClearGame = dqs('[data-js="button__clear-game"]');

    const ajax = new XMLHttpRequest();

    let allGames = null;
    let selectedGame = null;

    let selectedNumbers = [];

    function getSelectedGameTypeData(gameType) {
      return allGames.find((game) => game.type === gameType);
    }

    function handleCompleteGame() {
      while (selectedNumbers.length < selectedGame["max-number"]) {
        const number = Math.floor(Math.random() * selectedGame.range) + 1;
        const stringifiedNumber = `${number}`.padStart(2, "0");

        const wasFound = selectedNumbers.find(
          (selectedNumber) => selectedNumber === stringifiedNumber
        );

        if (!wasFound) selectedNumbers.push(stringifiedNumber);
      }

      const $allGameButtons = dqsa('[data-js="game-number"]');

      $allGameButtons.forEach((button) => {
        if (selectedNumbers.includes(button.value)) {
          button.style = `background: ${selectedGame.color};`;
          button.classList.add("game-number__selected");

          button.removeEventListener("click", handleSelectNumber);
          button.addEventListener("click", handleDeselectNumber, false);
          return;
        }

        button.style = `background: #adc0c4;`;
        button.classList.remove("game-number__selected");

        button.removeEventListener("click", handleDeselectNumber);
        button.addEventListener("click", handleSelectNumber, false);
      });
    }

    function handleClearGame() {
      selectedNumbers = [];

      const $allSelectedButtons = dqsa(".game-number__selected");

      $allSelectedButtons.forEach((selectedButton) => {
        selectedButton.style = `background: #adc0c4;`;
        selectedButton.classList.remove("game-number__selected");

        selectedButton.removeEventListener("click", handleDeselectNumber);
        selectedButton.addEventListener("click", handleSelectNumber, false);
      });
    }

    function handleDeselectNumber(event) {
      const $deselectedButtonNumber = event.target;
      const deselectedNumber = $deselectedButtonNumber.value;

      $deselectedButtonNumber.classList.remove("game-number__selected");
      $deselectedButtonNumber.style = `background: #adc0c4;`;

      selectedNumbers = selectedNumbers.filter(
        (number) => number !== deselectedNumber
      );

      $deselectedButtonNumber.removeEventListener(
        "click",
        handleDeselectNumber
      );
      $deselectedButtonNumber.addEventListener(
        "click",
        handleSelectNumber,
        false
      );
    }

    function handleSelectNumber(event) {
      if (selectedNumbers.length + 1 <= selectedGame["max-number"]) {
        const $selectedButtonNumber = event.target;
        const selectedNumber = $selectedButtonNumber.value;

        $selectedButtonNumber.classList.add("game-number__selected");
        $selectedButtonNumber.style = `background: ${selectedGame.color};`;

        selectedNumbers.push(selectedNumber);

        $selectedButtonNumber.removeEventListener("click", handleSelectNumber);
        $selectedButtonNumber.addEventListener(
          "click",
          handleDeselectNumber,
          false
        );
      }
    }

    function renderGameNumbers() {
      $gameNumbers.textContent = "";

      Array.from({ length: selectedGame.range }).forEach((_, index) => {
        const number = `${index + 1}`.padStart(2, "0");

        const $listItem = doc.createElement("li");

        const $numberButton = doc.createElement("button");
        $numberButton.setAttribute("type", "button");
        $numberButton.setAttribute("data-js", "game-number");
        $numberButton.classList.add("game-number");
        $numberButton.value = number;
        $numberButton.textContent = number;
        $numberButton.addEventListener("click", handleSelectNumber, false);

        $listItem.appendChild($numberButton);
        $gameNumbers.appendChild($listItem);
      });
    }

    function renderGameDescription() {
      $gameDescription.textContent = selectedGame.description;
    }

    function renderGameName() {
      $gameName.textContent = selectedGame.type;
    }

    function handleChangeSelectedGameType(event) {
      const clickedGameType = event.target.value;
      const $buttonsGamesType = dqsa('[data-js="game-type"]');
      const selectedClassName = "game-type__selected";

      $buttonsGamesType.forEach((button) => {
        if (button.classList.contains(selectedClassName))
          button.classList.remove(selectedClassName);

        if (button.value === clickedGameType) {
          selectedGame = getSelectedGameTypeData(clickedGameType);
          button.classList.add(selectedClassName);
        }
      });

      selectedNumbers = [];

      renderGameName();
      renderGameDescription();
      renderGameNumbers();
    }

    function makeGameTypeButton(type) {
      const $button = doc.createElement("button");

      $button.classList.add("game-type");
      $button.setAttribute("type", "button");
      $button.setAttribute("data-js", "game-type");
      $button.value = type;
      $button.textContent = type;
      $button.addEventListener("click", handleChangeSelectedGameType, false);

      return $button;
    }

    function renderGamesType(gamesTypes) {
      allGames = gamesTypes;

      gamesTypes.forEach((gameType, index) => {
        const $listItem = doc.createElement("li");
        const $buttonGameType = makeGameTypeButton(gameType.type);

        if (index === 0) {
          selectedGame = getSelectedGameTypeData(gameType.type);
          $buttonGameType.classList.add("game-type__selected");
        }

        $listItem.appendChild($buttonGameType);
        $gamesType.appendChild($listItem);
      });
    }

    function isRequestOk() {
      return ajax.readyState === 4 && ajax.status === 200;
    }

    function handleGetGamesData() {
      if (isRequestOk()) {
        const data = JSON.parse(ajax.responseText);

        renderGamesType(data.types);
        renderGameName();
        renderGameDescription();
        renderGameNumbers();
        return;
      }
    }

    function getGamesData() {
      ajax.open("GET", "../../games.json");
      ajax.send();

      ajax.addEventListener("readystatechange", handleGetGamesData, false);
    }

    function init() {
      getGamesData();

      $buttonCompleteGame.addEventListener("click", handleCompleteGame, false);
      $buttonClearGame.addEventListener("click", handleClearGame, false);
    }

    init();
  }

  app();
})(document);
