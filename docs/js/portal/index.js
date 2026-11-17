import { isSignedIn } from "./session.js?v=14abd82cd3c7";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
