/* This file can be accessed with the alias: Views/Shared/_CookieConsentPartial */

const cookieConsentInput = document.getElementById('cookieconsent');
if (cookieConsentInput != null && cookieConsentInput.value === 'show') {
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
}
