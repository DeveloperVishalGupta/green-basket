import { termsOfService } from "@/utils/constants";
import { FileText } from "lucide-react";
// import { termsOfService } from "./termsOfService";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="rounded-2xl bg-white p-8 shadow-sm border mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3">
              <FileText className="h-7 w-7 text-green-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {termsOfService.title}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Last Updated: {termsOfService.lastUpdated}
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {termsOfService.sections.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {section.id}. {section.title}
              </h2>

              {section.content?.map((paragraph, index) => (
                <p key={index} className="mb-4 leading-7 text-gray-600">
                  {paragraph}
                </p>
              ))}

              {section.list && (
                <ul className="space-y-3">
                  {section.list.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-2 h-2 w-2 rounded-full bg-green-500" />

                      <span className="text-gray-700 leading-7">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
