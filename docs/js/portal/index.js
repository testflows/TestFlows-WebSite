import { isSignedIn } from "./session.js?v=4c80ba13c4ed";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
