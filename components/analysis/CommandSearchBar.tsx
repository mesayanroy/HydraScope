"use client";

import { useEffect, useRef } from "react";

type SearchState = "idle" | "loading" | "success" | "error";

type CommandSearchBarProps = {
  queryInput: string;
  setQueryInput: (val: string) => void;
  onSearch: (overrideQuery?: string) => void;
  searchState: SearchState;
  activePackageName?: string;
  activeVersion?: string;
  errorMessage?: string | null;
  ecosystem: "npm" | "pypi";
};

export function CommandSearchBar({
  queryInput,
  setQueryInput,
  onSearch,
  searchState,
  activePackageName,
  activeVersion,
  errorMessage,
  ecosystem,
}: CommandSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus shortcut Ctrl/Cmd + K
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const exampleChips =
    ecosystem === "pypi"
      ? ["requests@2.28.1", "urllib3@1.26.5"]
      : ["lodash@4.17.20", "express@4.18.2", "react@18.2.0", "evil-lib@2.0.0"];

  return (
    <div className="space-y-2.5">
      {/* Command-Style Input Box */}
      <div className="relative flex items-center rounded-lg border border-zinc-800 bg-zinc-900/90 shadow-2xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all overflow-hidden font-mono">
        <div className="pl-4 pr-2 text-emerald-400 font-bold text-sm select-none">
          &gt;
        </div>

        <input
          ref={inputRef}
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
          placeholder={
            searchState === "loading"
              ? "traversing dependency graph..."
              : "Enter package@version"
          }
          disabled={searchState === "loading"}
          className="w-full bg-transparent py-3.5 pr-28 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-60"
        />

        <div className="absolute right-3 flex items-center space-x-2">
          {searchState === "loading" && (
            <span className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="hidden sm:inline">TRAVERSING...</span>
            </span>
          )}

          <span className="hidden sm:inline-block rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] text-zinc-400 font-mono">
            Ctrl + Enter
          </span>

          <button
            onClick={() => onSearch()}
            disabled={searchState === "loading"}
            className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-500 disabled:opacity-50 transition-all"
          >
            ANALYZE
          </button>
        </div>
      </div>

      {/* State Indicator & Small Example Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono gap-2 px-1">
        {/* Status Line */}
        <div className="flex items-center space-x-2">
          {searchState === "idle" && (
            <span className="text-zinc-500">&gt; Enter package@version</span>
          )}

          {searchState === "loading" && (
            <span className="text-amber-400 font-bold">&gt; traversing dependency graph...</span>
          )}

          {searchState === "success" && (
            <span className="text-emerald-400 font-bold">
              &gt; {activePackageName}@{activeVersion}
            </span>
          )}

          {searchState === "error" && (
            <span className="text-rose-400 font-bold">
              &gt; {errorMessage || "package not found"}
            </span>
          )}
        </div>

        {/* Small Example Chips */}
        <div className="flex items-center flex-wrap gap-1.5 text-zinc-400">
          <span className="text-[10px] text-zinc-500 uppercase">Examples:</span>
          {exampleChips.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setQueryInput(chip);
                onSearch(chip);
              }}
              className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-emerald-400 text-[11px] transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
