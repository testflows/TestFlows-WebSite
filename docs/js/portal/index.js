import { isSignedIn } from "./session.js?v=77ffa1a5540b";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
