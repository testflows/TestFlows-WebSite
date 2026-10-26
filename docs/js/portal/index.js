import { isSignedIn } from "./session.js?v=de9ac004660c";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
