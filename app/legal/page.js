import Link from "next/link";

export const metadata = {
  title: "Legal — RAINE",
  description: "Legal policies, terms of service, privacy practices, and DMCA guidelines for RAINE.",
};

export default function LegalIndex() {
  return (
    <div className="legal-container">
      <nav className="legal-back-nav">
        <Link href="/" className="legal-back-link">
          ← lake
        </Link>
      </nav>

      <div className="legal-card">
        <span className="legal-eyebrow">Documentation</span>
        <h1 className="legal-title">Legal & Policies</h1>
        <p className="legal-meta">Last updated: October 16, 2026</p>

        <div className="legal-content">
          <p>
            RAINE is an editorial, rainy-lake movie and television metadata browser.
            We prioritize transparency, user privacy, and strict adherence to intellectual property standards.
          </p>

          <div className="legal-index-grid">
            <Link href="/legal/terms" className="legal-index-item">
              <h3>Terms of Service</h3>
              <p>
                Platform nature, user responsibilities, third-party media disclaimer, and service boundaries.
              </p>
            </Link>

            <Link href="/legal/privacy" className="legal-index-item">
              <h3>Privacy Policy</h3>
              <p>
                Zero-account design, local device storage details, third-party connection notices, and VPN guidance.
              </p>
            </Link>

            <Link href="/legal/dmca" className="legal-index-item">
              <h3>DMCA Notice</h3>
              <p>
                Non-hosting statement, copyright compliance, and expedited takedown submission procedures.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
