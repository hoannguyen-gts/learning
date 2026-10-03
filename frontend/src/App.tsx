import AuthLayout from './components/AuthLayout';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import FormGroup from './components/ui/FormGroup';

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-5">
      <AuthLayout switchLabel="Sign up" onSwitch={() => alert('switch!')}>
        <form onSubmit={e => { e.preventDefault(); alert('submit!'); }}>
          <FormGroup label="Username:" htmlFor="u">
            <Input id="u" type="text" placeholder="Enter username..." autoComplete="off" />
          </FormGroup>
          <FormGroup label="Password:" htmlFor="p">
            <Input id="p" type="password" placeholder="Enter password..." />
          </FormGroup>
          <Button type="submit" variant="primary">Login</Button>
        </form>
      </AuthLayout>

      <div className="max-w-[700px] mx-auto flex gap-4 flex-wrap">
        <Button variant="submit">Submit</Button>
        <Button variant="submit" disabled>Submit disabled</Button>
        <Button variant="danger">Xóa</Button>
        <Button variant="nav">Log in</Button>
      </div>
    </div>
  );
}
