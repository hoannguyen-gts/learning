import { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

interface TodoFormProps {
  onSubmit: (title: string) => Promise<boolean>;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived: thay thế handleInputValidation() + 5 lần gọi nó =)))
  const isEmpty = title.trim() === '';

  async function handleSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = title.trim();
    if (text === '') return;     

    setIsSubmitting(true);        
    try {
      const ok = await onSubmit(text);
      if (ok) {
        setTitle('');             
      }
    } finally {
      setIsSubmitting(false);      
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-[15px]">
      <Input
        id="task-input"
        type="text"
        placeholder="Enter your task..."
        autoComplete="off"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Button type="submit" variant="submit" disabled={isEmpty || isSubmitting}>
        {isSubmitting ? '...' : 'Submit'}
      </Button>
    </form>
  );
}
