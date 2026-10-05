import type { Todo } from '../types';
import TodoItem from './TodoItem';

interface TodoListProps {
  tasks: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ tasks, onToggle, onDelete }: TodoListProps) {
  // Legacy empty state: app.js:228-237.
  // Inline style của legacy (textAlign center, padding 20px, color #64748b)
  // → utility class tương ứng.
  if (tasks.length === 0) {
    return (
      <p className="text-center py-5 text-brand-muted">
        Chưa có task nào. Hãy thêm task đầu tiên!
      </p>
    );
  }

  return (
    // style.css:99-104 — #task-list
    <ul className="list-none flex flex-col gap-[15px]">
      {tasks.map((task, index) => (
        <TodoItem
          key={task.id}
          task={task}
          index={index}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
