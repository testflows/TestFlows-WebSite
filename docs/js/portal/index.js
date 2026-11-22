import { isSignedIn } from "./session.js?v=30a30ecf6934";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
