import { z } from "zod";
export const boundedJSON = z.unknown().refine((value) => {
  const queue: [unknown, number][] = [[value, 0]];
  let nodes = 0;
  while (queue.length) {
    const [item, depth] = queue.pop()!;
    if (++nodes > 12000 || depth > 15) return false;
    if (item === null || typeof item === "boolean") continue;
    if (typeof item === "string") {
      if (item.length > 12000) return false;
      continue;
    }
    if (typeof item === "number") {
      if (!Number.isFinite(item)) return false;
      continue;
    }
    if (Array.isArray(item)) {
      if (item.length > 1500) return false;
      for (const v of item) queue.push([v, depth + 1]);
      continue;
    }
    if (typeof item === "object") {
      const entries = Object.entries(item);
      if (entries.length > 1500) return false;
      for (const [k, v] of entries) {
        if (
          ["__proto__", "constructor", "prototype"].includes(k) ||
          k.length > 150
        )
          return false;
        queue.push([v, depth + 1]);
      }
      continue;
    }
    return false;
  }
  return true;
}, "Invalid or oversized JSON");
