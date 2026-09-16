import { DocumentGeneratorPage } from "@/components/DocumentGeneratorPage";
import { monthlyDocumentConfig } from "@/features/monthly-phone-monitoring/config";

export default function Page() {
  return <DocumentGeneratorPage config={monthlyDocumentConfig} />;
}
