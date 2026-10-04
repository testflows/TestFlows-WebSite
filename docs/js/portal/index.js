import { isSignedIn } from "./session.js?v=dd819d081f9e";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
