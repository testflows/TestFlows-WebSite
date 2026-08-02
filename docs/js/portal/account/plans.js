/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Shared subscription tier order — paid tiers, low → high. Free is never a
 * switch target; a higher rank is an upgrade, a lower rank a downgrade. */
export const TIER_RANK = ["starter", "pro", "enterprise"];

/**
 * Rank of a paid tier (0 = lowest), or -1 for Free / unknown.
 * @param {string} tier
 * @returns {number}
 */
export function tierRank(tier) {
  const i = TIER_RANK.indexOf(String(tier || "").toLowerCase());
  return i < 0 ? -1 : i;
}
