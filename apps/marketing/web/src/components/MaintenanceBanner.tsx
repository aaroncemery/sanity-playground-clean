import { AlertTriangle, Info, XCircle } from "lucide-react";

type Severity = "info" | "warning" | "error";

type MaintenanceBannerData = {
  enabled: boolean | null;
  message: string | null;
  severity: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
} | null;

const SEVERITY_STYLES: Record<Severity, string> = {
  info: "bg-blue-600 text-white",
  warning: "bg-yellow-400 text-yellow-900",
  error: "bg-red-600 text-white",
};

const SEVERITY_ICONS: Record<Severity, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

export function MaintenanceBanner({ data }: { data: MaintenanceBannerData }) {
  if (!data || !data.enabled || !data.message) return null;

  const now = new Date();
  if (data.scheduledStart && now < new Date(data.scheduledStart)) return null;
  if (data.scheduledEnd && now > new Date(data.scheduledEnd)) return null;

  const severity = (data.severity as Severity) ?? "info";
  const Icon = SEVERITY_ICONS[severity] ?? Info;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`w-full px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium ${SEVERITY_STYLES[severity]}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p>{data.message}</p>
    </div>
  );
}
