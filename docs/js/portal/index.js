import { isSignedIn } from "./session.js?v=d79b20080061";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
