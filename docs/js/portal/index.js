import { isSignedIn } from "./session.js?v=73bd5f649db8";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
