((doc, win) => {
  const dqs = (selector) => doc.querySelector(selector);
  const dqsa = (selector) => [...doc.querySelectorAll(selector)];

  win.selectors = { dqs, dqsa };
})(document, window)