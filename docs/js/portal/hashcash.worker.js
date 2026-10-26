/**
 * One shard of the Hashcash nonce search. Imports the shared solver so the hash
 * computation stays single-source (mirrors client/api + cloud/api hashcash). The
 * parent (hashcash.js `solve`) fans out disjoint subsequences and takes the first
 * stamp, terminating the rest.
 */
import { solveRange } from "./hashcash.js?v=d79b20080061";

self.onmessage = (e) => {
  const { value, bits, bucket, rand, start, stride } = e.data;
  self.postMessage(solveRange(value, bits, bucket, rand, start, stride));
};
