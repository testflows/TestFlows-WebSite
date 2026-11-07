import { isSignedIn } from "./session.js?v=d9a2c1eacc6d";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
