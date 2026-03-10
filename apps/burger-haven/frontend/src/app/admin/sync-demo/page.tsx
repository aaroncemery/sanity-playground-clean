"use client";

import { useState } from "react";
import Link from "next/link";
import type { JdeRecord, SyncResult } from "@/app/api/jde-sync/route";

// ---------------------------------------------------------------------------
// Fake JDE data generators — realistic BH product catalog shape
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "burgers",
  "chicken",
  "breakfast",
  "sides",
  "drinks",
] as const;
type Category = (typeof CATEGORIES)[number];

const SKU_PREFIXES: Record<Category, string> = {
  burgers: "BH",
  chicken: "CH",
  breakfast: "BK",
  sides: "SD",
  drinks: "DK",
};

const PRODUCT_NAMES: Record<Category, string[]> = {
  burgers: [
    "Classic Smash Burger",
    "Double Stack Deluxe",
    "Bacon BBQ Burger",
    "Mushroom Swiss Melt",
    "Spicy Jalapeño Burger",
    "Avocado Ranch Burger",
    "Triple Patty Monster",
    "Truffle Aioli Burger",
  ],
  chicken: [
    "Crispy Chicken Sandwich",
    "Nashville Hot Tender",
    "Grilled Club Wrap",
    "Honey Mustard Strips",
    "Buffalo Ranch Bites",
    "Southern Fried Thighs",
  ],
  breakfast: [
    "Sunrise Egg Sandwich",
    "Sausage Biscuit Combo",
    "Pancake Stack",
    "Ham & Cheese Croissant",
    "Breakfast Burrito",
  ],
  sides: [
    "Classic Fries",
    "Onion Rings",
    "Sweet Potato Fries",
    "Coleslaw Cup",
    "Side Salad",
    "Mac & Cheese Bites",
  ],
  drinks: [
    "Classic Shake",
    "Fountain Soda",
    "Iced Tea",
    "Lemonade",
    "Bottled Water",
    "Fresh Orange Juice",
  ],
};

const ALL_ALLERGENS = [
  "dairy",
  "wheat",
  "soy",
  "eggs",
  "fish",
  "peanuts",
  "treeNuts",
  "shellfish",
];

function seededRandom(seed: number) {
  // Simple deterministic PRNG for reproducible fake data
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateJdeRecord(index: number): JdeRecord {
  const r = (offset = 0) => seededRandom(index * 17 + offset);
  const category = CATEGORIES[Math.floor(r(1) * CATEGORIES.length)];
  const names = PRODUCT_NAMES[category];
  const name = names[Math.floor(r(2) * names.length)];
  const skuNum = 1000 + index;
  const sku = `${SKU_PREFIXES[category]}${skuNum}`;
  const basePrice = Math.round((2.99 + r(3) * 12) * 100) / 100;

  // Pick 1–3 allergens deterministically
  const allergenCount = 1 + Math.floor(r(4) * 3);
  const allergens: string[] = [];
  for (let i = 0; i < allergenCount; i++) {
    const a = ALL_ALLERGENS[Math.floor(r(5 + i) * ALL_ALLERGENS.length)];
    if (!allergens.includes(a)) allergens.push(a);
  }

  return {
    jdeId: `JDE-${10000 + index}`,
    sku,
    name,
    category,
    basePrice,
    allergens,
    nutritionFacts: {
      calories: Math.round(200 + r(8) * 900),
      protein: Math.round(5 + r(9) * 45),
      carbs: Math.round(10 + r(10) * 80),
      fat: Math.round(3 + r(11) * 50),
      sodium: Math.round(200 + r(12) * 1600),
    },
  };
}

/** Apply a price/name mutation to a subset of records to simulate "changed in JDE" */
function applyChanges(records: JdeRecord[], changePct: number): JdeRecord[] {
  return records.map((record, i) => {
    const shouldChange = seededRandom(i * 31 + 7) < changePct / 100;
    if (!shouldChange) return record;
    // Bump price slightly to simulate a JDE price update
    return {
      ...record,
      basePrice: Math.round((record.basePrice + 0.5) * 100) / 100,
    };
  });
}

// ---------------------------------------------------------------------------
// Monthly projection helpers
// ---------------------------------------------------------------------------

const SYNCS_PER_DAY = 6;
const DAYS_PER_MONTH = 30;
const MONTHLY_SYNCS = SYNCS_PER_DAY * DAYS_PER_MONTH; // 180

function projectMonthly(perSync: number) {
  return perSync * MONTHLY_SYNCS;
}

/** Rough label for mutation volume at scale */
function mutationVolumeLabel(monthlyMutations: number): {
  label: string;
  color: string;
} {
  if (monthlyMutations < 500_000)
    return { label: "Low — well within any plan", color: "text-green-600" };
  if (monthlyMutations < 5_000_000)
    return { label: "Moderate — monitor usage", color: "text-yellow-600" };
  return {
    label: "High — enterprise discussion needed",
    color: "text-red-600",
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// Two-phase simulator state
type Phase = "idle" | "seeded" | "synced";
type RunningOp = "seed" | "sync" | "reset" | null;

export default function SyncDemoPage() {
  const [recordCount, setRecordCount] = useState(60);
  const [changePct, setChangePct] = useState(20);
  const [mode, setMode] = useState<"diff" | "naive">("diff");
  const [dryRun, setDryRun] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [runningOp, setRunningOp] = useState<RunningOp>(null);
  const [seedResult, setSeedResult] = useState<SyncResult | null>(null);
  const [diffResult, setDiffResult] = useState<SyncResult | null>(null);
  const [naiveResult, setNaiveResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseRecords = Array.from({ length: recordCount }, (_, i) =>
    generateJdeRecord(i),
  );

  async function callApi(body: object): Promise<SyncResult> {
    const res = await fetch("/api/jde-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { error?: string }).error ?? `API error ${res.status}`,
      );
    }
    return res.json();
  }

  async function handleSeed() {
    setRunningOp("seed");
    setSeedResult(null);
    setDiffResult(null);
    setNaiveResult(null);
    setError(null);
    await new Promise((r) => setTimeout(r, 300));
    try {
      // Seed always writes — dry run has no data to diff against otherwise
      const result = await callApi({
        action: "seed",
        records: baseRecords,
        dryRun: false,
      });
      setSeedResult(result);
      setPhase("seeded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunningOp(null);
    }
  }

  async function handleSync() {
    setRunningOp("sync");
    setDiffResult(null);
    setNaiveResult(null);
    setError(null);
    await new Promise((r) => setTimeout(r, 300));
    // Apply changes to a subset of records — simulates JDE updating changePct% of items
    const recordsWithChanges = applyChanges(baseRecords, changePct);
    try {
      if (mode === "diff") {
        const result = await callApi({
          action: "sync",
          records: recordsWithChanges,
          naive: false,
          dryRun,
        });
        setDiffResult(result);
      } else {
        const result = await callApi({
          action: "sync",
          records: recordsWithChanges,
          naive: true,
          dryRun,
        });
        setNaiveResult(result);
      }
      setPhase("synced");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunningOp(null);
    }
  }

  async function handleCompare() {
    setRunningOp("sync");
    setDiffResult(null);
    setNaiveResult(null);
    setError(null);
    await new Promise((r) => setTimeout(r, 300));
    const recordsWithChanges = applyChanges(baseRecords, changePct);
    try {
      const [d, n] = await Promise.all([
        callApi({
          action: "sync",
          records: recordsWithChanges,
          naive: false,
          dryRun,
        }),
        callApi({
          action: "sync",
          records: recordsWithChanges,
          naive: true,
          dryRun,
        }),
      ]);
      setDiffResult(d);
      setNaiveResult(n);
      setPhase("synced");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunningOp(null);
    }
  }

  async function handleReset() {
    setRunningOp("reset");
    setSeedResult(null);
    setDiffResult(null);
    setNaiveResult(null);
    setError(null);
    await new Promise((r) => setTimeout(r, 200));
    try {
      await callApi({ action: "reset", dryRun });
      setPhase("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunningOp(null);
    }
  }

  const isRunning = runningOp !== null;

  // Theoretical naive mutation count for comparison when only diff was run
  // Naive writes every record unconditionally, so mutations = recordCount per sync
  const naiveMonthlyTheoretical = projectMonthly(recordCount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-bh-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-bh-gold">
                🍔 Burger Haven
              </h1>
              <p className="text-gray-400 text-sm">
                🔄 JDE Sync Architecture Demo
              </p>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/admin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Dashboard
              </Link>
              <Link
                href="/admin/validation"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ⚡ Validation Demo
              </Link>
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Menu Board
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Page heading */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            🔄 JDE Sync Architecture Demo
          </h2>
          <p className="text-gray-600 text-lg">
            How do you sync{" "}
            <strong>60,000 JDE product records into Sanity 6×/day</strong>{" "}
            without blowing your API quota?
          </p>
          <p className="text-gray-500 mt-2">
            Three techniques — diff-before-write, transaction batching, and CDN
            reads — combine to keep the call profile dramatically lower than a
            naïve approach.
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Architecture flow diagram */}
        {/* ------------------------------------------------------------------ */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-900 mb-5 text-lg">
            Architecture: Sync Data Flow
          </h3>

          {/* Main horizontal flow */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-stretch gap-0 min-w-max text-sm">
              {/* JDE ERP */}
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center w-32">
                <div className="text-3xl mb-1">🏭</div>
                <div className="font-bold text-gray-700">JDE ERP</div>
                <div className="text-xs text-gray-500 mt-1">~60K products</div>
              </div>

              <div className="flex flex-col items-center justify-center px-2">
                <div className="text-xs text-gray-500 mb-1">webhook / cron</div>
                <div className="text-xl text-gray-400">→</div>
                <div className="text-xs text-gray-400">6×/day</div>
              </div>

              {/* Diff Check */}
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-center w-36">
                <div className="text-3xl mb-1">🔍</div>
                <div className="font-bold text-yellow-700">Diff Check</div>
                <div className="text-xs text-yellow-600 mt-1">
                  Read current state
                </div>
                <div className="mt-2 bg-yellow-100 rounded px-2 py-0.5">
                  <span className="text-xs font-medium text-yellow-700">
                    Skip if unchanged
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center px-2">
                <div className="text-xs text-gray-500 mb-1">only changed</div>
                <div className="text-xl text-gray-400">→</div>
                <div className="text-xs text-gray-400">records</div>
              </div>

              {/* Batch Transaction */}
              <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 text-center w-36">
                <div className="text-3xl mb-1">📦</div>
                <div className="font-bold text-blue-700">Batch Tx</div>
                <div className="text-xs text-blue-600 mt-1">N mutations</div>
                <div className="mt-2 bg-blue-100 rounded px-2 py-0.5">
                  <span className="text-xs font-medium text-blue-700">
                    = 1 API call
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center px-2">
                <div className="text-xs text-gray-500 mb-1">single write</div>
                <div className="text-xl text-gray-400">→</div>
              </div>

              {/* Content Lake */}
              <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 text-center w-36">
                <div className="text-3xl mb-1">🏔️</div>
                <div className="font-bold text-green-700">Content Lake</div>
                <div className="text-xs text-green-600 mt-1">
                  productcatalog
                </div>
                <div className="mt-2 bg-green-100 rounded px-2 py-0.5">
                  <span className="text-xs font-medium text-green-700">
                    Source of truth
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CDN read callout — separate path */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-center">
              <span className="text-xs font-semibold text-purple-700">
                📡 CDN Reads (frontend / kiosk)
              </span>
              <span className="text-xs text-purple-500 ml-2">
                → served from edge,{" "}
                <strong className="text-purple-700">much higher quota</strong>,
                no impact on write quota
              </span>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          </div>

          {/* Three callout boxes */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-yellow-700">
                🔍 Diff reads via CDN
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Reads current state via CDN — much higher quota than the write
                API, and doesn&apos;t touch your mutation quota at all. Syncing
                every few hours? CDN staleness is seconds — completely
                irrelevant.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700">
                📦 Transaction batching
              </p>
              <p className="text-xs text-blue-600 mt-1">
                All mutations for a sync cycle are bundled into one transaction.
                N changed documents = 1 write API call. Atomic commit with
                rollback on error.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-700">
                📡 CDN reads — high quota, no mutation cost
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Customers, kiosks, and mobile apps read from Sanity&apos;s CDN
                edge. CDN reads have a much higher quota than the write API and
                don&apos;t touch your mutation quota at all.
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Live Simulator */}
        {/* ------------------------------------------------------------------ */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            ⚡ Live Sync Simulator
          </h3>
          <p className="text-sm text-gray-500 mb-1">
            Two-phase demo against the{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">jdedemo</span>{" "}
            sandbox dataset.
          </p>

          {/* Phase stepper */}
          <div className="flex items-center gap-2 mb-6 text-xs font-semibold mt-3">
            <div
              className={`px-3 py-1 rounded-full border-2 transition-colors ${phase === "idle" ? "bg-bh-dark text-white border-bh-dark" : "border-gray-300 text-gray-400"}`}
            >
              1 · Seed dataset
            </div>
            <div className="text-gray-300">──</div>
            <div
              className={`px-3 py-1 rounded-full border-2 transition-colors ${phase === "seeded" ? "bg-bh-dark text-white border-bh-dark" : phase === "synced" ? "border-green-400 text-green-600" : "border-gray-300 text-gray-400"}`}
            >
              2 · Run sync cycle
            </div>
            <div className="text-gray-300">──</div>
            <div
              className={`px-3 py-1 rounded-full border-2 transition-colors ${phase === "synced" ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-400"}`}
            >
              3 · See results
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Record count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                JDE records in this batch:{" "}
                <span className="text-bh-gold font-black">{recordCount}</span>
              </label>
              <input
                type="range"
                min={10}
                max={200}
                step={5}
                value={recordCount}
                onChange={(e) => {
                  setRecordCount(Number(e.target.value));
                  setPhase("idle");
                  setSeedResult(null);
                  setDiffResult(null);
                  setNaiveResult(null);
                }}
                disabled={isRunning}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            {/* Change % — only relevant for sync phase */}
            <div
              className={
                phase === "idle" ? "opacity-40 pointer-events-none" : ""
              }
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                % of records changed in JDE since last sync:{" "}
                <span className="text-bh-gold font-black">{changePct}%</span>
                <span className="text-gray-400 font-normal ml-2 text-xs">
                  (~{Math.round((recordCount * changePct) / 100)} mutated)
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={changePct}
                onChange={(e) => setChangePct(Number(e.target.value))}
                disabled={isRunning || phase === "idle"}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0% (nothing changed)</span>
                <span>100% (everything changed)</span>
              </div>
            </div>
          </div>

          {/* Sync mode — only relevant for sync phase */}
          <div
            className={`mb-6 ${phase === "idle" ? "opacity-40 pointer-events-none" : ""}`}
          >
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Sync strategy:
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("diff")}
                disabled={isRunning || phase === "idle"}
                className={`flex-1 md:flex-none px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  mode === "diff"
                    ? "bg-green-600 border-green-600 text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:border-green-400"
                }`}
              >
                ✅ With diff-check
              </button>
              <button
                onClick={() => setMode("naive")}
                disabled={isRunning || phase === "idle"}
                className={`flex-1 md:flex-none px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  mode === "naive"
                    ? "bg-red-500 border-red-500 text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:border-red-400"
                }`}
              >
                ⚠️ Naive sync (write all)
              </button>
            </div>
          </div>

          {/* Dry-run toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  disabled={isRunning}
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${dryRun ? "bg-blue-500" : "bg-gray-300"}`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dryRun ? "translate-x-5" : "translate-x-0"}`}
                />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  {dryRun
                    ? "🔵 Dry run sync — no writes committed"
                    : "🟠 Live sync — writes to jdedemo dataset"}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {dryRun
                    ? "Applies to sync only. Reads & diffs are real; transaction is built but not committed. Seed always writes."
                    : "Sync mutations committed to the jdedemo sandbox dataset."}
                </p>
              </div>
            </label>
          </div>

          {/* Action buttons — phase-aware */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Step 1: Seed */}
            <button
              onClick={handleSeed}
              disabled={isRunning}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-md ${
                phase === "idle"
                  ? "bg-bh-dark hover:bg-gray-800 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              } disabled:opacity-50`}
            >
              {runningOp === "seed" ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Seeding…
                </span>
              ) : phase === "idle" ? (
                `① Seed ${recordCount} records`
              ) : (
                `↺ Re-seed ${recordCount} records`
              )}
            </button>

            {/* Step 2: Sync (enabled after seed) */}
            <button
              onClick={handleSync}
              disabled={isRunning || phase === "idle"}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-400 text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
            >
              {runningOp === "sync" && mode === "diff" ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Syncing…
                </span>
              ) : (
                `② Run ${mode === "diff" ? "Diff-Check" : "Naive"} Sync`
              )}
            </button>

            {/* Compare both (enabled after seed) */}
            <button
              onClick={handleCompare}
              disabled={isRunning || phase === "idle"}
              className="px-6 py-3 bg-bh-gold hover:bg-yellow-500 disabled:bg-gray-300 disabled:text-gray-400 text-bh-dark rounded-xl font-semibold text-sm transition-colors shadow-md"
            >
              {runningOp === "sync" ? "…" : "⚖️ Compare Both"}
            </button>

            {/* Reset */}
            {phase !== "idle" && (
              <button
                onClick={handleReset}
                disabled={isRunning}
                className="px-4 py-3 border border-gray-300 hover:border-red-300 hover:text-red-600 text-gray-500 rounded-xl font-semibold text-sm transition-colors"
              >
                {runningOp === "reset" ? "…" : "🗑 Reset dataset"}
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
              ❌ {error}
            </div>
          )}

          {/* Running indicator */}
          {isRunning && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 animate-pulse mb-4">
              {runningOp === "seed" &&
                `Writing ${recordCount} records to jdedemo…`}
              {runningOp === "sync" &&
                `Reading current state from Sanity, diffing ${recordCount} records, committing transaction…`}
              {runningOp === "reset" && "Deleting all seeded documents…"}
            </div>
          )}

          {/* Step 1 result — seed summary */}
          {seedResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-sm">
              <p className="font-semibold text-gray-700 mb-1">
                ① Seed complete — {seedResult.elapsedMs}ms
              </p>
              <p className="text-gray-500 text-xs">
                {seedResult.mutated} records written to{" "}
                <span className="font-mono">jdedemo</span> in{" "}
                <strong>1 write transaction</strong>. Now adjust the sliders and
                run a sync cycle to see diff-check in action.
              </p>
            </div>
          )}

          {/* Step 2 results */}
          {(diffResult || naiveResult) && (
            <div
              className={`grid gap-4 mt-2 ${diffResult && naiveResult ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
            >
              {diffResult && (
                <ResultCard
                  result={diffResult}
                  label="✅ Diff-Check Mode"
                  borderColor="border-green-400"
                  headerBg="bg-green-50"
                  naiveMonthlyMutations={
                    naiveResult
                      ? projectMonthly(naiveResult.mutated)
                      : naiveMonthlyTheoretical
                  }
                />
              )}
              {naiveResult && (
                <ResultCard
                  result={naiveResult}
                  label="⚠️ Naive Mode"
                  borderColor="border-red-400"
                  headerBg="bg-red-50"
                  naiveMonthlyMutations={projectMonthly(naiveResult.mutated)}
                />
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Talking points */}
        {/* ------------------------------------------------------------------ */}
        <div className="bg-bh-cream border border-bh-gold rounded-xl p-6">
          <h3 className="font-bold text-bh-dark text-lg mb-4">
            🎯 Demo Talking Points
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "🔍",
                title: "Diff-before-write cuts mutation volume dramatically",
                desc: "At 20% change rate, 80% of records are skipped — meaning 80% fewer mutations. With 60K docs at 6×/day, that's millions of avoided API calls per month.",
              },
              {
                icon: "📦",
                title: "Transaction batching: N updates = 1 API call",
                desc: "All changed documents for a sync cycle commit in a single atomic transaction. Whether 1 or 10,000 records changed, you pay 1 write API call. It's also atomic — partial writes don't happen.",
              },
              {
                icon: "📡",
                title:
                  "CDN reads have a much higher quota — and don't touch mutation quota",
                desc: "The diff-check reads via CDN (much higher quota than write API, zero impact on mutation quota). Customer reads from web, kiosk, and mobile also hit CDN. The only calls that count against your write quota are the mutation transactions.",
              },
              {
                icon: "🔑",
                title: "Deterministic IDs make the sync idempotent",
                desc: "Using `product-${jdeId}` as the document ID means any sync cycle can safely re-run. createOrReplace is a no-op if nothing changed, and a correct upsert if something did.",
              },
            ].map((point) => (
              <div key={point.title} className="flex gap-3">
                <span className="text-2xl shrink-0">{point.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-bh-dark">
                    {point.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer quote */}
          <div className="mt-5 border-t border-bh-gold/40 pt-4">
            <blockquote className="border-l-4 border-bh-gold pl-4 italic text-gray-600 text-sm">
              &ldquo;We sync 60K items from JDE 6 times a day. We can&apos;t
              afford to blow our API quota on records that didn&apos;t
              change.&rdquo;
            </blockquote>
            <p className="text-xs text-gray-500 mt-1 ml-5">
              — Head of E-Commerce Architecture, QSR Enterprise Customer
            </p>
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 ml-5">
              <p className="text-sm font-semibold text-green-700">
                Sanity&apos;s answer:
              </p>
              <p className="text-xs text-green-600 mt-1">
                Diff-before-write + transaction batching + CDN reads = a very
                efficient API call profile even at 60K documents syncing 6×/day.
                The simulator above runs this for real.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result card sub-component
// ---------------------------------------------------------------------------

interface ResultCardProps {
  result: SyncResult;
  label: string;
  borderColor: string;
  headerBg: string;
  /** Monthly mutations for the naive (no-diff) baseline — used for savings comparison */
  naiveMonthlyMutations: number;
}

function ResultCard({
  result,
  label,
  borderColor,
  headerBg,
  naiveMonthlyMutations,
}: ResultCardProps) {
  const monthlyMutations = projectMonthly(result.mutated);
  const volumeLabel = mutationVolumeLabel(monthlyMutations);
  const mutationSavings = naiveMonthlyMutations - monthlyMutations;
  const savingsPct =
    naiveMonthlyMutations > 0
      ? Math.round((mutationSavings / naiveMonthlyMutations) * 100)
      : 0;

  return (
    <div
      className={`border-l-4 ${borderColor} bg-white rounded-xl shadow overflow-hidden`}
    >
      <div className={`${headerBg} px-4 py-3 border-b border-gray-100`}>
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-900 text-sm">{label}</p>
          {result.dryRun && (
            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">
              dry run
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{result.elapsedMs}ms elapsed</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Core counts */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat
            value={result.totalRecords}
            label="Records"
            sublabel="processed"
          />
          <Stat
            value={result.mutated}
            label="Mutations"
            sublabel="written"
            highlight={result.mutated > 0}
          />
          <Stat value={result.skipped} label="Skipped" sublabel="no diff" />
        </div>

        {/* PRIMARY: Monthly mutation projection — the number that matters at scale */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-orange-700 mb-1">
            ✍️ Monthly mutations at scale (6×/day × 30 days):
          </p>
          <p className="text-2xl font-black text-orange-900">
            {monthlyMutations.toLocaleString()}
            <span className="text-sm font-normal text-orange-600 ml-1">
              mutations/mo
            </span>
          </p>
          <p className={`text-xs font-semibold mt-0.5 ${volumeLabel.color}`}>
            {volumeLabel.label}
          </p>

          {mutationSavings > 0 && (
            <div className="mt-2 bg-green-100 border border-green-200 rounded p-2">
              <p className="text-xs font-bold text-green-700">
                💰 {mutationSavings.toLocaleString()} fewer mutations/mo vs.
                naive
              </p>
              <p className="text-xs text-green-600">
                {savingsPct}% reduction in write volume
              </p>
            </div>
          )}
        </div>

        {/* SECONDARY: API calls breakdown */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            API calls this sync cycle:
          </p>
          {result.mode === "diff-check" && (
            <ApiCallRow
              icon="📡"
              label="Read (CDN — much higher quota)"
              value={result.readApiCalls}
              note="batch GROQ, doesn't touch mutation quota"
            />
          )}
          {result.mode === "naive" && (
            <ApiCallRow
              icon="📖"
              label="Read calls"
              value={0}
              note="none — naive skips reads"
            />
          )}
          <ApiCallRow
            icon="✍️"
            label="Write transactions (non-CDN)"
            value={result.writeTransactions}
            note={
              result.writeTransactions === 1
                ? `${result.mutated} mutations in 1 atomic tx`
                : result.mutated === 0
                  ? "no changes — tx skipped"
                  : ""
            }
          />
          <div className="border-t border-gray-200 pt-1.5 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500">
              Quota-counted calls:
            </span>
            <span className="text-sm font-black text-gray-700">
              {result.writeTransactions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  sublabel,
  highlight,
}: {
  value: number;
  label: string;
  sublabel: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-2 ${highlight ? "bg-orange-50" : "bg-gray-50"}`}
    >
      <p
        className={`text-2xl font-black ${highlight ? "text-orange-600" : "text-gray-800"}`}
      >
        {value}
      </p>
      <p className="text-xs font-semibold text-gray-600">{label}</p>
      <p className="text-xs text-gray-400">{sublabel}</p>
    </div>
  );
}

function ApiCallRow({
  icon,
  label,
  value,
  note,
}: {
  icon: string;
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-gray-600 truncate">{label}</span>
        {note && (
          <span className="text-xs text-gray-400 hidden sm:inline">
            — {note}
          </span>
        )}
      </div>
      <span className="text-sm font-bold text-gray-800 shrink-0">{value}</span>
    </div>
  );
}
