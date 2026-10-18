import { isSignedIn } from "./session.js?v=b6a043dd1a69";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
