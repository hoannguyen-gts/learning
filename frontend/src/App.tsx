import './App.css'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg p-5 text-brand-text">
      <div className="bg-white border-[3px] border-black rounded-lg p-[30px]">
        <h1 className="text-[2.5rem] font-bold tracking-[1px] border-b-[3px] border-black pb-[10px] mb-[25px]">
          TODOS
        </h1>
        <button className="px-6 py-3 font-bold text-white bg-blue-600 border-2 border-black cursor-pointer transition-all hover:bg-[#0f172a] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[2px_2px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:bg-brand-disabled-bg disabled:text-brand-disabled disabled:border-brand-disabled disabled:cursor-not-allowed">
          Submit
        </button>
      </div>
    </div>
  );
}