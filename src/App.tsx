import Tiptap from "./components/tiptap/tiptap";
import Nav from "./components/ui/nav";

function App() {
  return (
    <>
      <Nav />
      <div className="p-6 max-w-4xl mx-auto mt-24 border-2 rounded-lg shadow-lg">
        <Tiptap />
      </div>
    </>
  );
}
export default App;
