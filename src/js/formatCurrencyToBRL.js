((win) => {
  function formatCurrencyToBRL(currency) {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(currency);
  }
  
  win.formatCurrencyToBRL = formatCurrencyToBRL;
})(window);
