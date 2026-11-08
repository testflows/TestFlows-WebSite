import { isSignedIn } from "./session.js?v=8a14665c48a2";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
