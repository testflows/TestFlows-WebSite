import { isSignedIn } from "./session.js?v=0ba1376a01b1";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
