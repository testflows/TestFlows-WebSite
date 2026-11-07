import { isSignedIn } from "./session.js?v=9d190d59ed94";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
