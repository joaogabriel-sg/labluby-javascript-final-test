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

    const classGameTypeSelected = "game-type__selected";
    const classGameNumberSelected = "game-number__selected";

    let games = null;
    let selectedGame = null;
    let selectedNumbers = [];

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
      $allGameButtons.forEach((button) =>
        selectedNumbers.includes(button.value)
          ? manageButtonNumberEventListeners(button, false)
          : manageButtonNumberEventListeners(button, true)
      );
    }

    function handleClearGame() {
      selectedNumbers = [];

      const $allSelectedButtons = dqsa(`.${classGameNumberSelected}`);
      $allSelectedButtons.forEach((selectedButton) =>
        manageButtonNumberEventListeners(selectedButton, true)
      );
    }

    function handleDeselectGameNumber(event) {
      const $deselectedButtonNumber = event.target;
      selectedNumbers = selectedNumbers.filter(
        (number) => number !== $deselectedButtonNumber.value
      );

      manageButtonNumberEventListeners($deselectedButtonNumber, true);
    }

    function handleSelectGameNumber(event) {
      const selectedNumbersLength = selectedNumbers.length + 1;
      const selectedGameTypeMaxNumber = selectedGame["max-number"];

      if (selectedNumbersLength > selectedGameTypeMaxNumber) return;

      const $selectedButtonNumber = event.target;
      selectedNumbers.push($selectedButtonNumber.value);

      manageButtonNumberEventListeners($selectedButtonNumber, false);
    }

    function removeClassGameNumberSelected(button) {
      button.classList.remove(classGameNumberSelected);
      button.style = `background: #adc0c4;`;
    }

    function addClassGameNumberSelected(button) {
      button.classList.add(classGameNumberSelected);
      button.style = `background: ${selectedGame.color};`;
    }

    function manageButtonNumberEventListeners(button, isItToSelect = true) {
      if (isItToSelect) {
        removeClassGameNumberSelected(button);
        button.removeEventListener("click", handleDeselectGameNumber);
        button.addEventListener("click", handleSelectGameNumber, false);
        return;
      }

      addClassGameNumberSelected(button);
      button.removeEventListener("click", handleSelectGameNumber);
      button.addEventListener("click", handleDeselectGameNumber, false);
    }

    function handleRenderGameNumber(number) {
      const $listItem = doc.createElement("li");

      const $numberButton = doc.createElement("button");
      $numberButton.classList.add("game-number");
      $numberButton.setAttribute("type", "button");
      $numberButton.setAttribute("data-js", "game-number");
      $numberButton.value = number;
      $numberButton.textContent = number;
      manageButtonNumberEventListeners($numberButton, true);

      $listItem.appendChild($numberButton);
      $gameNumbers.appendChild($listItem);
    }

    function renderGameNumbers() {
      $gameNumbers.textContent = "";

      const range = selectedGame.range;
      Array.from({ length: range }, (_, index) =>
        `${index + 1}`.padStart(2, "0")
      ).forEach(handleRenderGameNumber);
    }

    function renderGameDescription() {
      $gameDescription.textContent = selectedGame.description;
    }

    function renderGameName() {
      $gameName.textContent = selectedGame.type;
    }

    function initGame() {
      selectedNumbers = [];

      renderGameName();
      renderGameDescription();
      renderGameNumbers();
    }

    function getSelectedGameDataByType(gameType) {
      return games.find(({ type }) => type === gameType);
    }

    function handleChangeSelectedGameType(event) {
      const gameType = event.target.value;
      const $buttonsTypesOfGames = dqsa('[data-js="game-type"]');

      $buttonsTypesOfGames.forEach((buttonGameType) => {
        if (buttonGameType.classList.contains(classGameTypeSelected))
          buttonGameType.classList.remove(classGameTypeSelected);

        if (buttonGameType.value === gameType) {
          selectedGame = getSelectedGameDataByType(gameType);
          buttonGameType.classList.add(classGameTypeSelected);
        }
      });

      initGame();
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

    function handleRenderGameType(game, index) {
      const $listItemGameType = doc.createElement("li");
      const $buttonGameType = makeGameTypeButton(game.type);

      if (index === 0) {
        selectedGame = getSelectedGameDataByType(game.type);
        $buttonGameType.classList.add(classGameTypeSelected);
      }

      $listItemGameType.appendChild($buttonGameType);
      $gamesType.appendChild($listItemGameType);
    }

    function renderTypesOfGames(typesOfGames) {
      games = typesOfGames;
      games.forEach(handleRenderGameType);
    }

    function isRequestOk() {
      return ajax.readyState === 4 && ajax.status === 200;
    }

    function handleGetGamesData() {
      if (!isRequestOk()) return;

      const data = JSON.parse(ajax.responseText);
      renderTypesOfGames(data.types);
      initGame();
    }

    function getGamesData() {
      ajax.open("GET", "../../games.json");
      ajax.send();
      ajax.addEventListener("readystatechange", handleGetGamesData, false);
    }

    function initEvents() {
      $buttonCompleteGame.addEventListener("click", handleCompleteGame, false);
      $buttonClearGame.addEventListener("click", handleClearGame, false);
    }

    function init() {
      getGamesData();
      initEvents();
    }

    init();
  }

  app();
})(document);
