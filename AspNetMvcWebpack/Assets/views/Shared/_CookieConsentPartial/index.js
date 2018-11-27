/* This file can be accessed with the alias: Views/Shared/_CookieConsentPartial */

import { getValue } from 'Scripts/utilities';

if (getValue('#showCookieBanner').asBool()) {
  import('Scripts/cookie-consent');
}
