import { isSignedIn } from "./session.js?v=13f2c424cbfe";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
