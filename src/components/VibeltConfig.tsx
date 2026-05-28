import { useEffect, useState } from "react";
import {
  Battery,
  Bell,
  Car,
  Dog,
  Leaf,
  Megaphone,
  Siren,
  Volume2,
  Eye,
  Activity,
  LayoutDashboard,
  SlidersHorizontal,
  Radio,
  ListOrdered,
  Menu,
  Pause,
  Play,
  MapPin,
  Share2,
  AlertOctagon,
  Settings,
  X,
} from "lucide-react";

type Severity = "high" | "medium" | "low";
type HazardKind = "car" | "bike" | "siren" | "shout" | "dog" | "alarm";

interface HazardLog {
  id: number;
  time: string;
  type: HazardKind;
  direction: string;
  severity: Severity;
  label: string;
}

const NODES = [
  { id: "FL", label: "Front L", row: 1, col: 1 },
  { id: "FR", label: "Front R", row: 1, col: 3 },
  { id: "ML", label: "Mid L", row: 2, col: 1 },
  { id: "MR", label: "Mid R", row: 2, col: 3 },
  { id: "RL", label: "Rear L", row: 3, col: 1 },
  { id: "RR", label: "Rear R", row: 3, col: 3 },
] as const;

const HAZARD_POOL: Omit<HazardLog, "id" | "time">[] = [
  { type: "car", direction: "Rear Right", severity: "high", label: "Vehicle approaching" },
  { type: "bike", direction: "Rear Left", severity: "medium", label: "Cyclist passing" },
  { type: "siren", direction: "Front", severity: "high", label: "Emergency siren" },
  { type: "shout", direction: "Left", severity: "medium", label: "Voice detected" },
  { type: "dog", direction: "Front Right", severity: "low", label: "Dog barking" },
  { type: "alarm", direction: "Rear", severity: "high", label: "Horn / alarm" },
];

function iconFor(type: HazardKind) {
  switch (type) {
    case "car":
      return Car;
    case "bike":
      return Activity;
    case "siren":
      return Siren;
    case "shout":
      return Megaphone;
    case "dog":
      return Dog;
    case "alarm":
      return Bell;
  }
}

function formatPace(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function nowTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function VibeltConfig() {
  const [distance, setDistance] = useState(3.42);
  const [paceSeconds, setPaceSeconds] = useState(6 * 60 + 15);
  const [calories] = useState(284);

  const [audioThreat, setAudioThreat] = useState(70);
  const [visualThreat, setVisualThreat] = useState(45);

  const [sensitivityMode, setSensitivityMode] = useState<"city" | "park">("city");
  const [ecoMode, setEcoMode] = useState(false);

  const [hazardLogs, setHazardLogs] = useState<HazardLog[]>([]);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());

  type Tab = "overview" | "haptics" | "diagnostics" | "alerts";
  const [tab, setTab] = useState<Tab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [running, setRunning] = useState(true);

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "haptics", label: "Haptics", icon: SlidersHorizontal },
    { id: "diagnostics", label: "Belt", icon: Radio },
    { id: "alerts", label: "Alerts", icon: ListOrdered },
  ];

  // Distance + pace ticker
  useEffect(() => {
    const t = setInterval(() => {
      setDistance((d) => +(d + 0.01).toFixed(2));
      setPaceSeconds(() => {
        const base = 6 * 60 + 15;
        const jitter = Math.floor(Math.random() * 11) - 5; // -5..+5 s
        return base + jitter;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Hazard generator
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 8000 + Math.random() * 4000;
      timer = setTimeout(() => {
        const pick = HAZARD_POOL[Math.floor(Math.random() * HAZARD_POOL.length)];
        setHazardLogs((logs) => {
          const next: HazardLog = { ...pick, id: Date.now(), time: nowTime() };
          const updated = [next, ...logs];
          return updated.slice(0, 4);
        });
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const pulseNodes = (ids: string[]) => {
    setActiveNodes((prev) => {
      const n = new Set(prev);
      ids.forEach((i) => n.add(i));
      return n;
    });
    setTimeout(() => {
      setActiveNodes((prev) => {
        const n = new Set(prev);
        ids.forEach((i) => n.delete(i));
        return n;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-900 text-slate-300"
            aria-label="Open menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <h1 className="text-sm font-semibold tracking-tight">Vibelt</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Battery className="w-4 h-4 text-slate-400" />
            <span className="font-semibold tabular-nums">82%</span>
          </div>
        </div>

        {/* Tab menu */}
        <nav className="max-w-md mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                  active
                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Slide-down menu */}
      {menuOpen && (
        <div className="border-b border-slate-800 bg-slate-900">
          <div className="max-w-md mx-auto px-4 py-3 flex flex-col gap-1 text-sm">
            <MenuItem icon={<Settings className="w-4 h-4" />} label="Belt Settings" />
            <MenuItem icon={<Share2 className="w-4 h-4" />} label="Share Live Location" />
            <MenuItem icon={<MapPin className="w-4 h-4" />} label="Route History" />
            <div className="flex items-center justify-between px-2 py-2 rounded-lg">
              <div className="flex items-center gap-2 text-slate-200">
                <Leaf className={`w-4 h-4 ${ecoMode ? "text-cyan-400" : "text-slate-500"}`} />
                Eco Mode
              </div>
              <button
                onClick={() => setEcoMode((v) => !v)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  ecoMode ? "bg-cyan-500" : "bg-slate-700"
                }`}
                aria-label="Toggle Eco Mode"
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-slate-100 transform transition-transform ${
                    ecoMode ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto flex flex-col gap-4 px-4 pt-4">
        {/* Session header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                {running ? "Active Session" : "Paused"}
              </div>
              <div className="text-lg font-bold mt-0.5 capitalize">{tab}</div>
            </div>
            <div className="text-xs text-cyan-400 font-medium">
              {sensitivityMode === "city" ? "City Mode" : "Park Mode"}
            </div>
          </div>
        </div>

        {/* Overview: live stats */}
        {(tab === "overview" || tab === "haptics") && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Distance", value: distance.toFixed(2), unit: "km" },
            { label: "Pace", value: formatPace(paceSeconds), unit: "/km" },
            { label: "Calories", value: calories.toString(), unit: "kcal" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center"
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                {s.label}
              </div>
              <div className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">
                {s.value}
              </div>
              <div className="text-[10px] text-slate-500">{s.unit}</div>
            </div>
          ))}
        </div>
        )}

        {/* Haptics tab */}
        {(tab === "overview" || tab === "haptics") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
              Sensitivity Mode
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["city", "park"] as const).map((mode) => {
                const active = sensitivityMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setSensitivityMode(mode)}
                    className={`rounded-xl py-2.5 text-sm font-medium border transition-colors ${
                      active
                        ? "bg-cyan-500 border-cyan-400 text-slate-950"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {mode === "city" ? "City (High)" : "Park (Low)"}
                  </button>
                );
              })}
            </div>
          </div>

          <SliderRow
            icon={<Volume2 className="w-4 h-4" />}
            label="Audio Threat"
            value={audioThreat}
            onChange={setAudioThreat}
          />
          <SliderRow
            icon={<Eye className="w-4 h-4" />}
            label="Visual Threat"
            value={visualThreat}
            onChange={setVisualThreat}
          />
        </div>
        )}

        {/* Belt Diagnostics */}
        {(tab === "overview" || tab === "diagnostics") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-slate-400">
              Haptic Motor Diagnostics
            </div>
            <span className="text-[10px] text-slate-500">6 nodes</span>
          </div>

          <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-y-4 place-items-center">
              {[1, 2, 3].map((row) => (
                <Row key={row} row={row} activeNodes={activeNodes} />
              ))}
            </div>
            <div className="text-center text-[10px] text-slate-500 mt-3">
              Belt schematic — front · mid · rear
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <TestButton label="Test Left" onClick={() => pulseNodes(["FL", "ML", "RL"])} />
            <TestButton label="Test Right" onClick={() => pulseNodes(["FR", "MR", "RR"])} />
            <TestButton label="Test Rear" onClick={() => pulseNodes(["RL", "RR"])} />
          </div>
        </div>
        )}

        {/* Hazard Log */}
        {(tab === "overview" || tab === "alerts") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-slate-400">
              Real-time Hazard Log
            </div>
            <span className="text-[10px] text-slate-500">Live</span>
          </div>
          {hazardLogs.length === 0 ? (
            <div className="text-sm text-slate-500 py-6 text-center">
              Listening for hazards…
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {hazardLogs.map((h) => {
                const Icon = iconFor(h.type);
                const danger = h.severity === "high";
                return (
                  <li
                    key={h.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      danger
                        ? "border-rose-500/40 bg-rose-500/5"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        danger ? "bg-rose-500/15 text-rose-500" : "bg-slate-800 text-cyan-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">
                        {h.label}
                      </div>
                      <div className="text-xs text-slate-400">
                        {h.direction} · {h.time}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold ${
                        danger ? "text-rose-500" : "text-slate-400"
                      }`}
                    >
                      {h.severity}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-slate-950/90 backdrop-blur border-t border-slate-800">
        <div className="max-w-md mx-auto px-4 py-2 grid grid-cols-4 gap-2">
          <ToolbarButton
            icon={running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            label={running ? "Pause" : "Resume"}
            onClick={() => setRunning((v) => !v)}
            accent
          />
          <ToolbarButton
            icon={<MapPin className="w-5 h-5" />}
            label="Mark"
            onClick={() => pulseNodes(["FL", "FR"])}
          />
          <ToolbarButton
            icon={<Share2 className="w-5 h-5" />}
            label="Share"
            onClick={() => {}}
          />
          <ToolbarButton
            icon={<AlertOctagon className="w-5 h-5" />}
            label="SOS"
            onClick={() => pulseNodes(["FL", "FR", "ML", "MR", "RL", "RR"])}
            danger
          />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-200 hover:bg-slate-800/60 text-left">
      <span className="text-cyan-400">{icon}</span>
      {label}
    </button>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  accent,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
  danger?: boolean;
}) {
  const tone = danger
    ? "text-rose-400 hover:bg-rose-500/10"
    : accent
      ? "text-cyan-300 hover:bg-cyan-500/10"
      : "text-slate-300 hover:bg-slate-900";
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${tone}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function Row({ row, activeNodes }: { row: number; activeNodes: Set<string> }) {
  const cells = [1, 2, 3].map((col) => {
    const node = NODES.find((n) => n.row === row && n.col === col);
    if (!node) {
      // middle column = belt strap line
      return (
        <div key={col} className="w-full h-px bg-slate-800 relative">
          <div className="h-8 w-px bg-slate-800 mx-auto" />
        </div>
      );
    }
    const active = activeNodes.has(node.id);
    return (
      <div key={col} className="flex flex-col items-center gap-1">
        <div
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            active
              ? "bg-cyan-500 border-cyan-300 shadow-[0_0_18px_2px_rgba(34,211,238,0.6)]"
              : "bg-slate-900 border-slate-700"
          }`}
        />
        <span className="text-[9px] text-slate-500">{node.label}</span>
      </div>
    );
  });
  return <>{cells}</>;
}

function TestButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl py-2 text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200 hover:border-cyan-500/60 hover:text-cyan-400 transition-colors"
    >
      {label}
    </button>
  );
}

function SliderRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="text-cyan-400">{icon}</span>
          {label}
        </div>
        <span className="text-xs font-semibold text-cyan-400 tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-cyan-500"
      />
    </div>
  );
}