/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { isSignedIn } from "./session.js?v=93e847ddf11c";

window.location.replace(
  isSignedIn() ? "/machine/portal/account/" : "/machine/portal/login/"
);
