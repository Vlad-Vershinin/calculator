"use server";

import { evaluateExpression, type AngleUnit } from "./calculator-core";

type CalculationState = { result: string; equation: string; error: string; angleUnit: string };

export async function calculate(_previousState: CalculationState, formData: FormData): Promise<CalculationState> {
  const value = String(formData.get("expression") ?? "");
  const angleUnit: AngleUnit = formData.get("angleUnit") === "radians" ? "radians" : "degrees";
  const expression = value;
  if (!expression) return { result: "", equation: "", error: "Введите выражение", angleUnit };

  try {
    const result = evaluateExpression(expression, angleUnit);
    return { result, equation: expression, error: "", angleUnit };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось вычислить";
    return { result: "", equation: expression, error: message, angleUnit };
  }
}
