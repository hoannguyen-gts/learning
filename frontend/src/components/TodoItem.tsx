import type { Todo } from '../types';
import { formatCreatedAt } from '../utils/dateUtils';
import Button from './ui/Button';

interface TodoItemProps {
  task: Todo;
  index: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ task, index, onToggle, onDelete }: TodoItemProps) {
  return (
    <li
      className={
        'flex items-center justify-between gap-[15px] p-[15px] ' +
        'border-2 transition-all hover:-translate-y-[2px] hover:shadow-[1px_1px_0px_#000] ' +
        (task.completed
          ? 'bg-brand-bg border-brand-disabled'
          : 'bg-white border-black')
      }
    >
      <div className="flex-1 min-w-0 flex flex-col gap-[5px]">
        <span
          className={
            task.completed
              ? 'line-through text-brand-muted font-normal'
              : ''
          }
        >
          {index + 1}. {task.title}
        </span>
        <span
          className={
            'text-[0.8rem] ' +
            (task.completed ? 'text-brand-disabled' : 'text-brand-time')
          }
        >
          {formatCreatedAt(task.created_at)}
        </span>
      </div>
      <div className="flex items-center gap-[15px]">
        <input
          type="checkbox"
          className="w-[22px] h-[22px] cursor-pointer border-2 border-black accent-brand-text"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Đánh dấu hoàn thành: ${task.title}`}
        />
        <Button variant="danger" onClick={() => onDelete(task.id)}>
          Xóa
        </Button>
      </div>
    </li>
  );
}
