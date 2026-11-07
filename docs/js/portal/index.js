import { isSignedIn } from "./session.js?v=4957902679e8";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
