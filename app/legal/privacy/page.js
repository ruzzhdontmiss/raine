import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — RAINE",
  description: "Privacy practices, data handling, and third-party notices for RAINE.",
};

export default function PrivacyPage() {
  return (
    <div className="legal-container">
      <nav className="legal-back-nav">
        <Link href="/legal" className="legal-back-link">
          ← legal
        </Link>
      </nav>

      <article className="legal-card">
        <span className="legal-eyebrow">Data &amp; Privacy</span>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-meta">Last updated: October 16, 2026</p>

        <div className="legal-content">
          <h2>1. Zero Accounts, Minimal Data Collection</h2>
          <p>
            RAINE is engineered around the principle of data minimization. We do not maintain user accounts,
            sign-in systems, mailing lists, or user profiles. We do not store any personal identification
            information (PII) on our servers, nor do we run server-side databases containing personal user records.
          </p>

          <h2>2. Local Storage Usage</h2>
          <p>
            To provide personal continuity across your visits, RAINE saves your custom watchlist (&ldquo;My List&rdquo;),
            playback time offsets, and continue-watching state exclusively in your browser&rsquo;s local storage
            (<code>localStorage</code>).
          </p>
          <ul>
            <li>This information remains entirely within your local web browser.</li>
            <li>No watchlist or continue-watching records are ever transmitted to or stored on RAINE servers.</li>
            <li>You can instantly reset or erase this data at any time by clearing your browser data or site storage.</li>
          </ul>

          <h2>3. Third-Party Connections &amp; Playback Notice</h2>
          <p>
            When browsing the catalog, movie and show metadata are queried server-side through TMDB route proxies so your
            personal browser never interacts directly with private API keys.
          </p>
          <p>
            However, when you choose to play video content via an embedded player (such as Vidy), your browser opens a
            direct connection to external third-party content servers. When this connection is established, the third-party
            server receives your IP address and standard network headers. RAINE has no custody, control, or visibility over
            how third-party hosts log or treat network traffic. For your security and privacy when interacting with third-party
            media hosts, we recommend using a trusted Virtual Private Network (VPN).
          </p>

          <h2>4. Tracking, Analytics &amp; Cookies</h2>
          <p>
            RAINE does not use advertising cookies, behavior trackers, fingerprinting scripts, or cross-site tracking beacons.
            We do not sell, rent, monetize, or disclose user data to advertisers or third-party brokers.
          </p>

          <h2>5. Contact &amp; Inquiries</h2>
          <p>
            For any questions, concerns, or requests concerning this Privacy Policy, please contact us at{" "}
            <a href="mailto:raine.issues@gmail.com">raine.issues@gmail.com</a>.
          </p>
        </div>
      </article>
    </div>
  );
}
