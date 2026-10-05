import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '../types';
import { useApi, UNAUTHORIZED } from '../hooks/useApi';
import TodoHeader from '../components/TodoHeader';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export default function TodoPage() {
  const { apiFetch } = useApi();

  const [tasks, setTasks] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Todo[]>('/todos');
      setTasks(data);
    } catch (err) {
      console.error('loadTasks error:', err);
      const msg = getErrorMessage(err);

      if (!msg.includes(UNAUTHORIZED)) {
        setTasks([]);
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadTasks();
      if (cancelled) return;   // tránh ghi đè nếu effect đã bị cleanup
    })();
    return () => { cancelled = true; };
  }, [loadTasks]);

  return (
    <main className="w-full bg-white border-[3px] border-black rounded-lg p-[30px]">
      <TodoHeader />

      <section className="mb-[30px]">[TodoForm — Phase 11]</section>

      <section>
        {/* thứ tự check: loading -> error -> empty -> list */}
        {isLoading && (
          <p className="text-center py-5 text-brand-muted">Đang tải...</p>
        )}

        {!isLoading && error && (
          <p className="text-center py-5 text-brand-danger">
            Không thể tải danh sách task: {error}
          </p>
        )}

        {!isLoading && !error && (
          <p className="text-center py-5">
            [TodoList — Phase 10] — {tasks.length} task
          </p>
        )}
      </section>
    </main>
  );
}
