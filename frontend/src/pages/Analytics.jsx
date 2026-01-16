import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Construction } from "lucide-react";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
          <Construction className="w-8 h-8 text-[#6B7280]" />
        </div>
        <h1 className="text-[24px] font-bold text-[#1F2937] mb-2">Analytics</h1>
        <p className="text-[14px] text-[#6B7280] max-w-md">
          This feature is coming soon. You'll be able to view your scheduling analytics here.
        </p>
      </div>
    </DashboardLayout>
  );
}
