/**
 * Condition rule evaluator for Forma AI
 * Supports single condition rules, compound rules (AND / OR),
 * and backend formats ({ all: [...] }, { any: [...] }).
 */

export function evaluateConditionRule(cond, values = {}) {
  if (!cond) return true;

  // Multi-rule compound: ALL (AND)
  const allList = cond.all || (cond.operator === "and" && cond.conditions);
  if (Array.isArray(allList) && allList.length > 0) {
    return allList.every((subCond) => evaluateConditionRule(subCond, values));
  }

  // Multi-rule compound: ANY (OR)
  const anyList = cond.any || (cond.operator === "or" && cond.conditions);
  if (Array.isArray(anyList) && anyList.length > 0) {
    return anyList.some((subCond) => evaluateConditionRule(subCond, values));
  }

  const depField = cond.field || cond.dependentField;
  if (!depField) return true;

  const actual = values[depField];

  const op =
    cond.operator ||
    ("equals" in cond
      ? "equals"
      : "notEquals" in cond
      ? "notEquals"
      : "in" in cond
      ? "in"
      : "notIn" in cond
      ? "notIn"
      : "gt" in cond
      ? "gt"
      : "lt" in cond
      ? "lt"
      : "exists" in cond
      ? "exists"
      : "equals");

  const target = cond.value !== undefined ? cond.value : cond[op];

  const normalizeStr = (v) => String(v ?? "").trim().toLowerCase();

  switch (op) {
    case "equals":
      return normalizeStr(actual) === normalizeStr(target);

    case "notEquals":
      return normalizeStr(actual) !== normalizeStr(target);

    case "in":
    case "contains": {
      const targetArr = Array.isArray(target)
        ? target.map(normalizeStr)
        : String(target || "")
            .split(",")
            .map((s) => s.trim().toLowerCase());
      return targetArr.includes(normalizeStr(actual));
    }

    case "notIn": {
      const targetArr = Array.isArray(target)
        ? target.map(normalizeStr)
        : String(target || "")
            .split(",")
            .map((s) => s.trim().toLowerCase());
      return !targetArr.includes(normalizeStr(actual));
    }

    case "gt":
      return Number(actual) > Number(target);

    case "lt":
      return Number(actual) < Number(target);

    case "notEmpty":
    case "exists":
      return (
        actual !== undefined &&
        actual !== null &&
        actual !== "" &&
        actual !== false
      );

    case "empty":
      return (
        actual === undefined ||
        actual === null ||
        actual === "" ||
        actual === false
      );

    default:
      return true;
  }
}
