import { isSignedIn } from "./session.js?v=3ad7ff56b862";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
