import { isSignedIn } from "./session.js?v=81f369069bbf";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
