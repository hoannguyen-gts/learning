import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

export default function TodoHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center border-b-[3px] border-black pb-[10px] mb-[25px]">
      <h1 className="text-[2.5rem] font-bold tracking-[1px]">TODOS</h1>
      <div className="flex items-center gap-[15px] text-base">
        <span>User: <strong>{user?.username ?? ''}</strong></span>
        <Button variant="danger" onClick={logout}>Log out</Button>
      </div>
    </header>
  );
}
