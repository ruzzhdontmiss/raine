import Link from "next/link";

export const metadata = {
  title: "Terms of Service — RAINE",
  description: "Terms and conditions governing the use of the RAINE metadata browser.",
};

export default function TermsPage() {
  return (
    <div className="legal-container">
      <nav className="legal-back-nav">
        <Link href="/legal" className="legal-back-link">
          ← legal
        </Link>
      </nav>

      <article className="legal-card">
        <span className="legal-eyebrow">Legal Agreement</span>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-meta">Last updated: October 16, 2026</p>

        <div className="legal-content">
          <h2>1. Nature of the Service</h2>
          <p>
            RAINE operates exclusively as an open-web metadata aggregator and user interface.
            RAINE does not host, upload, store, control, or transmit any video, audio, or media streams.
            All film and television metadata, titles, artwork, posters, and plot descriptions are retrieved
            dynamically from The Movie Database (TMDB). Video playback is handled entirely through embedded
            third-party media players (including Vidy), which connect directly to external servers outside
            of our control.
          </p>

          <h2>2. User Responsibility & Compliance</h2>
          <p>
            RAINE is provided solely for personal, non-commercial informational and study purposes.
            By accessing or using RAINE, you agree that you are solely responsible for ensuring that your
            browsing and viewing habits comply with all applicable local, regional, and national laws in your
            jurisdiction. You agree not to misuse, scrape, probe, or disrupt the platform infrastructure.
          </p>

          <h2>3. Intellectual Property Rights</h2>
          <p>
            The RAINE custom software code, interface design, aesthetic tokens, layouts, and typography
            styling are the intellectual property of RAINE. All third-party media titles, imagery, posters,
            trademarks, and logos displayed on the site remain the property of their respective copyright
            holders and content producers. Third-party metadata is consumed via TMDB APIs in compliance with
            their respective terms.
          </p>

          <h2>4. Disclaimer of Warranties & Limitation of Liability</h2>
          <p>
            The service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without
            warranties of any kind, whether express or implied. RAINE makes no warranties regarding the accuracy,
            uptime, or safety of external third-party links or media players. In no event shall RAINE or its
            contributors be held liable for any damages arising from your access to third-party services.
          </p>

          <h2>5. Modifications to Terms</h2>
          <p>
            We reserve the right to revise or modify these Terms of Service at any time. Any changes will be
            reflected on this page with an updated &ldquo;Last updated&rdquo; timestamp. Continued use of the
            service following any modification constitutes your acceptance of the revised terms.
          </p>

          <h2>6. Contact</h2>
          <p>
            If you have questions or inquiries regarding these Terms of Service, please reach out via email
            to{" "}
            <a href="mailto:raine.issues@gmail.com">raine.issues@gmail.com</a>.
          </p>
        </div>
      </article>
    </div>
  );
}
