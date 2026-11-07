import { isSignedIn } from "./session.js?v=3db2b42d8ab0";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
