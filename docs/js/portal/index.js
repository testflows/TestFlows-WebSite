import { isSignedIn } from "./session.js?v=6334304a5ef5";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
