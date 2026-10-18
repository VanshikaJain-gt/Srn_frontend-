import LegalPage from "@/components/layout/LegalPage";
import { SITE_NAME } from "@/lib/site-config";

export const metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
};

export default function TermsPage() {
  return <LegalPage title="Terms of Service" />;
}
