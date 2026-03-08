import { reactive, Service } from "../../lib/index";

export class TodoService extends Service {
  @reactive todos: string[] = [];

  addTodo(text: string) {
    this.todos = [...this.todos, text];
  }

  removeTodo(index: number) {
    this.todos = this.todos.filter((_, i) => i !== index);
  }

  clearTodos() {
    this.todos = [];
  }
}
