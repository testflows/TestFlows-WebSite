import { isSignedIn } from "./session.js?v=7858d03edde0";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
