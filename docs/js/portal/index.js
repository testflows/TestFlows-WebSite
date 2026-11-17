import { isSignedIn } from "./session.js?v=b294e7e09f77";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
