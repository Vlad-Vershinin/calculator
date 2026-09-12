"use server";

type CalculationState = { result: string; equation: string; error: string; angleUnit: string };

class ExpressionParser {
  private position = 0;

  constructor(private readonly source: string, private readonly useDegrees: boolean) {}

  parse() {
    const value = this.parseExpression();
    if (this.position !== this.source.length) throw new Error("Проверьте выражение");
    if (!Number.isFinite(value)) throw new Error("Результат не определён");
    return value;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (this.peek() === "+" || this.peek() === "-") {
      const operator = this.take();
      const next = this.parseTerm();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    while (this.peek() === "*" || this.peek() === "/") {
      const operator = this.take();
      const next = this.parseFactor();
      if (operator === "/" && next === 0) throw new Error("Делить на ноль нельзя");
      value = operator === "*" ? value * next : value / next;
    }
    return value;
  }

  private parseFactor(): number {
    if (this.peek() === "+") { this.take(); return this.parseFactor(); }
    if (this.peek() === "-") { this.take(); return -this.parseFactor(); }

    const functionName = ["sin", "cos", "tan", "cot"].find((name) =>
      this.source.startsWith(name, this.position),
    );
    if (functionName) {
      this.position += functionName.length;
      if (this.take() !== "(") throw new Error("После функции нужна скобка");
      const argument = this.parseExpression();
      if (this.take() !== ")") throw new Error("Не хватает закрывающей скобки");
      const angle = this.useDegrees ? argument * Math.PI / 180 : argument;
      if (functionName === "tan" && Math.abs(Math.cos(angle)) < 1e-12) throw new Error("Тангенс не определён");
      if (functionName === "cot" && Math.abs(Math.sin(angle)) < 1e-12) throw new Error("Котангенс не определён");
      if (functionName === "sin") return Math.sin(angle);
      if (functionName === "cos") return Math.cos(angle);
      if (functionName === "tan") return Math.tan(angle);
      return Math.cos(angle) / Math.sin(angle);
    }

    if (this.peek() === "(") {
      this.take();
      const value = this.parseExpression();
      if (this.take() !== ")") throw new Error("Не хватает закрывающей скобки");
      return value;
    }

    const start = this.position;
    while (/\d|\./.test(this.peek())) this.position++;
    const token = this.source.slice(start, this.position);
    if (!token || (token.match(/\./g)?.length ?? 0) > 1) throw new Error("Проверьте выражение");
    return Number(token);
  }

  private peek() { return this.source[this.position] ?? ""; }
  private take() { return this.source[this.position++] ?? ""; }
}

function formatResult(value: number) {
  const normalized = Math.abs(value) < 1e-12 ? 0 : value;
  return new Intl.NumberFormat("ru-RU", { maximumSignificantDigits: 12 }).format(normalized);
}

export async function calculate(_previousState: CalculationState, formData: FormData): Promise<CalculationState> {
  const value = String(formData.get("expression") ?? "");
  const angleUnit = formData.get("angleUnit") === "radians" ? "radians" : "degrees";
  const expression = /^[0-9+\-*/().a-z]{1,100}$/.test(value) ? value : "";
  if (!expression) return { result: "", equation: "", error: "Введите выражение", angleUnit };

  try {
    const result = new ExpressionParser(expression, angleUnit === "degrees").parse();
    return { result: formatResult(result), equation: expression, error: "", angleUnit };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось вычислить";
    return { result: "", equation: expression, error: message, angleUnit };
  }
}
