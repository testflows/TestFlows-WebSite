import { isSignedIn } from "./session.js?v=dc37029f3963";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
