/* This file can be accessed with the alias: Scripts/cookie-consent */

document
  .querySelector('#cookieConsent button[data-cookie-string]')
  .addEventListener(
    'click',
    el => {
      document.cookie = el.target.dataset.cookieString;
      document.querySelector('#cookieConsent').classList.add('hidden');
    },
    false,
  );
