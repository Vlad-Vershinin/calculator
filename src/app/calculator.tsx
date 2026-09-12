"use client";

import { useActionState, useState } from "react";
import { calculate } from "./actions";
import styles from "./page.module.css";

const initialState = { result: "", equation: "", error: "", angleUnit: "degrees" };
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
  const [angleUnit, setAngleUnit] = useState("degrees");
  const [state, formAction, pending] = useActionState(calculate, initialState);
  const calculationIsCurrent = state.equation === expression && state.angleUnit === angleUnit;
  const display = calculationIsCurrent ? state.error || state.result : showExpression(expression);

  function enter(command: string) {
    if (command === "clear") return setExpression("");
    if (command === "backspace") return setExpression((current) => current.slice(0, -1));
    setExpression((current) => `${current}${command}`.slice(0, 100));
  }

  return (
    <section className={styles.calculator} aria-label="Калькулятор">
      <header><h1>Калькулятор</h1></header>
      <form action={formAction} className={styles.form}>
        <input type="hidden" name="expression" value={expression} />
        <output className={`${styles.display} ${calculationIsCurrent && state.error ? styles.error : ""}`} aria-live="polite">
          <small>{calculationIsCurrent && state.result ? `${showExpression(state.equation)} =` : "\u00a0"}</small>
          <strong>{pending ? "Вычисление…" : display || "0"}</strong>
        </output>
        <div className={styles.scientific}>
          <select name="angleUnit" value={angleUnit} onChange={(event) => setAngleUnit(event.target.value)} aria-label="Единица угла">
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
          <button className={`${styles.key} ${styles.equals}`} type="submit" disabled={pending}>=</button>
        </div>
      </form>
    </section>
  );
}
