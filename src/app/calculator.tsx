"use client";

import { useActionState, useState } from "react";
import { calculate } from "./actions";
import { evaluateExpression, type AngleUnit } from "./calculator-core";
import styles from "./page.module.css";

type ResultState = { result: string; equation: string; error: string; angleUnit: AngleUnit };
const initialState: ResultState = { result: "", equation: "", error: "", angleUnit: "degrees" };
const trigKeys = [["sin(", "sin"], ["cos(", "cos"], ["tan(", "tan"], ["cot(", "cot"]] as const;
const keys = [
  ["clear", "C", "utility"], ["(", "(", "utility"], [")", ")", "utility"], ["backspace", "⌫", "utility"],
  ["7", "7", "number"], ["8", "8", "number"], ["9", "9", "number"], ["/", "÷", "operator"],
  ["4", "4", "number"], ["5", "5", "number"], ["6", "6", "number"], ["*", "×", "operator"],
  ["1", "1", "number"], ["2", "2", "number"], ["3", "3", "number"], ["-", "−", "operator"],
  ["0", "0", "number"], [".", ",", "number"], ["+", "+", "operator"],
] as const;

function showExpression(value: string) {
  return value.replaceAll("*", "×").replaceAll("/", "÷").replaceAll(".", ",");
}

export function Calculator() {
  const [expression, setExpression] = useState("");
  const [angleUnit, setAngleUnit] = useState<AngleUnit>("degrees");
  const [mode, setMode] = useState<"client" | "server">("client");
  const [clientResult, setClientResult] = useState<ResultState>(initialState);
  const [state, formAction, pending] = useActionState(calculate, initialState);
  const activeResult = mode === "client" ? clientResult : state;
  const calculationIsCurrent = activeResult.equation === expression && activeResult.angleUnit === angleUnit;
  const display = calculationIsCurrent ? activeResult.error || activeResult.result : showExpression(expression);

  function enter(command: string) {
    if (command === "clear") return setExpression("");
    if (command === "backspace") return setExpression((current) => current.slice(0, -1));
    setExpression((current) => `${current}${command}`.slice(0, 100));
  }

  function calculateOnClient() {
    try {
      setClientResult({ result: evaluateExpression(expression, angleUnit), equation: expression, error: "", angleUnit });
    } catch (error) {
      setClientResult({
        result: "",
        equation: expression,
        error: error instanceof Error ? error.message : "Не удалось вычислить",
        angleUnit,
      });
    }
  }

  return (
    <section className={styles.calculator} aria-label="Калькулятор">
      <header><h1>Калькулятор</h1></header>
      <div className={styles.modes} role="group" aria-label="Режим вычисления">
        <button type="button" className={mode === "client" ? styles.selectedMode : ""} aria-pressed={mode === "client"} onClick={() => setMode("client")}>Клиентский</button>
        <button type="button" className={mode === "server" ? styles.selectedMode : ""} aria-pressed={mode === "server"} onClick={() => setMode("server")}>Серверный</button>
      </div>
      <form action={mode === "server" ? formAction : undefined} className={styles.form} onReset={(event) => event.preventDefault()}>
        <input type="hidden" name="expression" value={expression} />
        <input type="hidden" name="angleUnit" value={angleUnit} />
        <output className={`${styles.display} ${calculationIsCurrent && activeResult.error ? styles.error : ""}`} aria-live="polite">
          <small>{calculationIsCurrent && activeResult.result ? `${showExpression(activeResult.equation)} =` : "\u00a0"}</small>
          <strong>{mode === "server" && pending ? "Вычисление…" : display || "0"}</strong>
        </output>
        <div className={styles.scientific}>
          <select name="angleUnit" value={angleUnit} onChange={(event) => setAngleUnit(event.target.value as AngleUnit)} aria-label="Единица угла">
            <option value="degrees">DEG</option>
            <option value="radians">RAD</option>
          </select>
          {trigKeys.map(([command, label]) => (
            <button type="button" className={`${styles.key} ${styles.utility}`} onClick={() => enter(command)} key={command}>{label}</button>
          ))}
        </div>
        <div className={styles.keypad}>
          {keys.map(([command, label, kind]) => (
            <button type="button" className={`${styles.key} ${styles[kind]}`} onClick={() => enter(command)} key={command}>{label}</button>
          ))}
          <button
            className={`${styles.key} ${styles.equals}`}
            type={mode === "server" ? "submit" : "button"}
            onClick={mode === "client" ? calculateOnClient : undefined}
            disabled={mode === "server" && pending}
          >=</button>
        </div>
      </form>
    </section>
  );
}
