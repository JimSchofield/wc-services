import { useState } from "react";
import { useService } from "../../lib/react";
import { TodoService } from "./todo-service";

export function App() {
  const todoService = useService(TodoService);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    todoService.addTodo(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div
      style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h1>Todo App (React + wc-services)</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a todo..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {todoService.todos.length === 0 ? (
        <p style={{ color: "#888" }}>No todos yet.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {todoService.todos.map((todo, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>{todo}</span>
                <button onClick={() => todoService.removeTodo(i)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => todoService.clearTodos()}
            style={{ marginTop: 8 }}
          >
            Clear All
          </button>
        </>
      )}
    </div>
  );
}
