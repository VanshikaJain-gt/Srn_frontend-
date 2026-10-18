import LegalPage from "@/components/layout/LegalPage";
import { SITE_NAME } from "@/lib/site-config";

export const metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" />;
}
