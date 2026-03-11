import { Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="mx-auto max-w-screen-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">
              CryptoPulse
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </header>
  );
}
