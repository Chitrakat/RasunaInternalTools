import { DocumentGeneratorPage } from "@/components/DocumentGeneratorPage";
import { quarterlyDocumentConfig } from "@/features/monthly-phone-monitoring/config";

export default function Page() {
  return <DocumentGeneratorPage config={quarterlyDocumentConfig} />;
}
