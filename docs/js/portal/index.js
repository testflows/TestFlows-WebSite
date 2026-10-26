import { isSignedIn } from "./session.js?v=de0520713518";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
