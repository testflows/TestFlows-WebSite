import { isSignedIn } from "./session.js?v=06a817398efd";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
