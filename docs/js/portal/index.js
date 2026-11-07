import { isSignedIn } from "./session.js?v=49e8a8ff6f78";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
