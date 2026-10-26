import { isSignedIn } from "./session.js?v=79d480955619";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
