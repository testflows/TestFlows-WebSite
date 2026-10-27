import { isSignedIn } from "./session.js?v=8383360e0c4a";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
