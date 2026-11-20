import { isSignedIn } from "./session.js?v=c0fd7310d7d1";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
