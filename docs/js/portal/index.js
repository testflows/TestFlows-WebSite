import { isSignedIn } from "./session.js?v=937bd93d9ee5";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
