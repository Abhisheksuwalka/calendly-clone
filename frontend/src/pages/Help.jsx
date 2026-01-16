import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Book, FileQuestion, MessageCircle } from "lucide-react";

export default function Help() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-[28px] font-bold text-[#1F2937] mb-2">Help Center</h1>
        <p className="text-[14px] text-[#6B7280] mb-8">
          Find answers to common questions and get support.
        </p>

        <div className="grid gap-4">
          <div className="p-6 bg-white rounded-lg border border-[#E5E7EB] hover:border-[#0069FF] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#E6F2FF] flex items-center justify-center">
                <Book className="w-6 h-6 text-[#0069FF]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#1F2937]">Documentation</h3>
                <p className="text-[13px] text-[#6B7280]">Learn how to use all features</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#E5E7EB] hover:border-[#0069FF] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#E6F2FF] flex items-center justify-center">
                <FileQuestion className="w-6 h-6 text-[#0069FF]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#1F2937]">FAQs</h3>
                <p className="text-[13px] text-[#6B7280]">Common questions answered</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#E5E7EB] hover:border-[#0069FF] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#E6F2FF] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#0069FF]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#1F2937]">Contact Support</h3>
                <p className="text-[13px] text-[#6B7280]">Get help from our team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
