import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <div className="flex justify-between items-center p-6 border-b sticky top-0 dark:border-gray-400 backdrop-blur-xs bg-background/20 z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Cadmus Challenge</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
