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
    const $buttonAddToCart = dqs('[data-js="button__add-to-cart"]');

    const $cartGames = dqs('[data-js="cart-games"]');
    const $cartGamesTotalPrice = dqs('[data-js="cart-games__total-price"]');

    const ajax = new XMLHttpRequest();

    const classGameTypeSelected = "game-type__selected";
    const classGameNumberSelected = "game-number__selected";

    let games = null;
    let selectedGame = null;
    let selectedNumbers = [];
    let cartGames = [];

    function formatCurrencyToBRL(currency) {
      return Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(currency);
    }

    function deleteCartItemById(id) {
      cartGames = cartGames.filter((cartGame) => cartGame.id !== id);
      renderCart();
    }

    function makeButtonDeleteCartItemById(id) {
      const $buttonDeleteCartItem = doc.createElement("button");
      $buttonDeleteCartItem.classList.add("cart-game__delete-button");
      $buttonDeleteCartItem.setAttribute("type", "button");
      $buttonDeleteCartItem.addEventListener(
        "click",
        () => deleteCartItemById(id),
        false
      );

      const $trashIcon = doc.createElement("img");
      $trashIcon.src = "./src/assets/trash-icon.svg";
      $trashIcon.alt = "Delete game";

      $buttonDeleteCartItem.appendChild($trashIcon);

      return $buttonDeleteCartItem;
    }

    function makeParagraphWithGameNumbers(cartGame) {
      const numbers = cartGame.numbers.sort((a, b) => a - b).join();

      const $paragraphWithGameNumbers = doc.createElement("p");
      $paragraphWithGameNumbers.classList.add("cart-game__game-numbers");
      $paragraphWithGameNumbers.textContent = numbers;

      return $paragraphWithGameNumbers;
    }

    function makeSpanGamePrice(cartGame) {
      const $spanGamePrice = doc.createElement("span");
      $spanGamePrice.classList.add("cart-game__game-price");
      $spanGamePrice.textContent = formatCurrencyToBRL(cartGame.price);

      return $spanGamePrice;
    }

    function makeStrongGameType(cartGame) {
      const $strongGameType = doc.createElement("strong");
      $strongGameType.classList.add("cart-game__game-type");
      $strongGameType.textContent = cartGame.type;
      $strongGameType.style.color = cartGame.color;

      return $strongGameType;
    }

    function makeParagraphWithGameInfo(cartGame) {
      const $paragraphWithGameInfo = doc.createElement("p");
      $paragraphWithGameInfo.classList.add("cart-game__game-info");

      const $strongGameType = makeStrongGameType(cartGame);
      const $spanGamePrice = makeSpanGamePrice(cartGame);

      $paragraphWithGameInfo.appendChild($strongGameType);
      $paragraphWithGameInfo.appendChild($spanGamePrice);

      return $paragraphWithGameInfo;
    }

    function makeDivCartGameData(cartGame) {
      const $divCartGameData = doc.createElement("div");
      $divCartGameData.classList.add("cart-game__game-data");
      $divCartGameData.style.borderColor = cartGame.color;

      const $paragraphWithGameNumbers = makeParagraphWithGameNumbers(cartGame);
      const $paragraphWithGameInfo = makeParagraphWithGameInfo(cartGame);

      $divCartGameData.appendChild($paragraphWithGameNumbers);
      $divCartGameData.appendChild($paragraphWithGameInfo);

      return $divCartGameData;
    }

    function makeListItemCartGame(cartGame) {
      const $listItemCartGame = doc.createElement("li");
      $listItemCartGame.classList.add("cart-game");

      const $buttonDeleteCartItem = makeButtonDeleteCartItemById(cartGame.id);
      const $divCartGameData = makeDivCartGameData(cartGame);

      $listItemCartGame.appendChild($buttonDeleteCartItem);
      $listItemCartGame.appendChild($divCartGameData);

      return $listItemCartGame;
    }

    function updateCartTotalPrice() {
      const totalPrice = cartGames.reduce((acc, game) => acc + game.price, 0);
      $cartGamesTotalPrice.textContent = formatCurrencyToBRL(totalPrice);
    }

    function renderCart() {
      $cartGames.textContent = "";
      cartGames.forEach((cartGame) => {
        const $listItemCartGame = makeListItemCartGame(cartGame);
        $cartGames.appendChild($listItemCartGame);
      });

      updateCartTotalPrice();
    }

    function handleAddGameToCart() {
      if (selectedNumbers.length !== selectedGame["max-number"]) return;

      const newCartItemId = Math.floor(Math.random() * 10000) + 1;
      const newCartItem = {
        id: newCartItemId,
        type: selectedGame.type,
        numbers: selectedNumbers,
        price: selectedGame.price,
        color: selectedGame.color,
      };

      cartGames.push(newCartItem);

      renderCart();
      handleClearGame();
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

          buttonGameType.style.background =
            buttonGameType.getAttribute("data-color");
          buttonGameType.style.color = "#ffffff";

          buttonGameType.classList.add(classGameTypeSelected);
        } else {
          buttonGameType.style.background = "transparent";
          buttonGameType.style.color =
            buttonGameType.getAttribute("data-color");
        }
      });

      initGame();
    }

    function makeGameTypeButton(game) {
      const $button = doc.createElement("button");

      $button.classList.add("game-type");
      $button.setAttribute("type", "button");
      $button.setAttribute("data-js", "game-type");
      $button.setAttribute("data-color", game.color);
      $button.value = game.type;
      $button.textContent = game.type;
      $button.style.color = game.color;
      $button.style.borderColor = game.color;

      $button.addEventListener("click", handleChangeSelectedGameType, false);
      return $button;
    }

    function handleRenderGameType(game, index) {
      const $listItemGameType = doc.createElement("li");
      const $buttonGameType = makeGameTypeButton(game);

      if (index === 0) {
        selectedGame = getSelectedGameDataByType(game.type);
        $buttonGameType.classList.add(classGameTypeSelected);
        $buttonGameType.style.background =
          $buttonGameType.getAttribute("data-color");
        $buttonGameType.style.color = "#ffffff";
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
      $buttonAddToCart.addEventListener("click", handleAddGameToCart, false);
    }

    function init() {
      getGamesData();
      renderCart();
      initEvents();
    }

    init();
  }

  app();
})(document);
