import { isSignedIn } from "./session.js?v=64ff919a2a28";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
