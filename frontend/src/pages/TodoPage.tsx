import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '../types';
import { useApi, ApiRequestError, UNAUTHORIZED } from '../hooks/useApi';
import TodoHeader from '../components/TodoHeader';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Lỗi đã được apiFetch xử lý (alert + logout) → caller không alert lại.
*/
function isHandledAuthError(err: unknown): boolean {
  return getErrorMessage(err).includes(UNAUTHORIZED) ||
    (err instanceof ApiRequestError && (err.status === 401 || err.status === 403));
}

export default function TodoPage() {
  const { apiFetch } = useApi();

  const [tasks, setTasks] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── GET /todos — bản dịch của loadTasks (app.js:202-220)
  const loadTasks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Todo[]>('/todos');
      setTasks(data);
    } catch (err) {
      console.error('loadTasks error:', err);
      if (!isHandledAuthError(err)) {
        setTasks([]);                      // app.js:216
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  // ── POST /todos
  const handleAdd = useCallback(
    async (title: string): Promise<boolean> => {
      try {
        const created = await apiFetch<Todo>('/todos', {
          method: 'POST',
          body: JSON.stringify({ title }),      // app.js:300
        });
        // task mới lên ĐẦU danh sách
        setTasks(prev => [created, ...prev]);
        return true;
      } catch (err) {
        console.error('addTask error:', err);
        if (!isHandledAuthError(err)) {
          alert('Lỗi khi thêm task: ' + getErrorMessage(err));
        }
        return false;
      }
    },
    [apiFetch],
  );

  // ── PATCH /todos/:id
  const handleToggle = useCallback(
    async (id: number): Promise<void> => {
      //tìm task, tính giá trị mới
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const newCompleted = !task.completed;

      try {
        const updated = await apiFetch<Todo>(`/todos/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ completed: newCompleted }),
        });
        //thay task cũ bằng task từ server
        setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
      } catch (err) {
        console.error('toggleTask error:', err);
        if (!isHandledAuthError(err)) {
          alert('Không thể cập nhật task: ' + getErrorMessage(err));
        }
      }
    },
    [apiFetch, tasks],
  );

  // ── DELETE /todos/:id
  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      if (!window.confirm('Bạn có chắc muốn xóa task này?')) return;

      try {
        await apiFetch<{ message: string }>(`/todos/${id}`, { method: 'DELETE' });
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error('deleteTask error:', err);
        if (isHandledAuthError(err)) return;
        if (err instanceof ApiRequestError && err.status === 404) {
          alert(err.message || 'Todo not found');
          return;
        }
        alert('Không thể xóa task: ' + getErrorMessage(err));
      }
    },
    [apiFetch],
  );

  return (
    <main className="w-full bg-white border-[3px] border-black rounded-lg p-[30px]">
      <TodoHeader />

      <section className="mb-[30px]">
        <TodoForm onSubmit={handleAdd} />
      </section>

      <section>
        {isLoading && (
          <p className="text-center py-5 text-brand-muted">Đang tải...</p>
        )}

        {!isLoading && error && (
          <p className="text-center py-5 text-brand-danger">
            Không thể tải danh sách task: {error}
          </p>
        )}

        {!isLoading && !error && (
          <TodoList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
        )}
      </section>
    </main>
  );
}
