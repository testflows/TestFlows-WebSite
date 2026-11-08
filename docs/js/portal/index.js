import { isSignedIn } from "./session.js?v=a9576b2a6baa";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
