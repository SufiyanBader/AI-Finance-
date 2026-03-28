import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function DashboardLayout({ children }) {
  return (
    <div>
      <h1 className="text-6xl font-bold tracking-tight mb-5 gradient-title">
        Dashboard
      </h1>
      <Suspense fallback={<BarLoader width="100%" color="#6366f1" />}>
        {children}
      </Suspense>
    </div>
  );
}
