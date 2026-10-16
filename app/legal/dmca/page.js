import Link from "next/link";

export const metadata = {
  title: "DMCA Notice — RAINE",
  description: "DMCA copyright notice, non-hosting policy, and takedown submission instructions for RAINE.",
};

export default function DmcaPage() {
  return (
    <div className="legal-container">
      <nav className="legal-back-nav">
        <Link href="/legal" className="legal-back-link">
          ← legal
        </Link>
      </nav>

      <article className="legal-card">
        <span className="legal-eyebrow">Copyright &amp; Compliance</span>
        <h1 className="legal-title">DMCA Notice &amp; Takedown Policy</h1>
        <p className="legal-meta">Last updated: October 16, 2026</p>

        <div className="legal-content">
          <h2>1. Statement of Non-Hosting</h2>
          <p>
            RAINE does not host, upload, store, reproduce, or distribute any copyrighted media files, video streams, or
            proprietary content on any server in its custody or control. RAINE functions solely as an indexing catalog and
            editorial interface displaying publicly accessible metadata sourced from TMDB and referencing embedded media players
            operated by external third parties (including Vidy).
          </p>

          <h2>2. Notice and Takedown Procedure</h2>
          <p>
            RAINE respects the intellectual property rights of creators and complies with the Digital Millennium Copyright Act
            (17 U.S.C. § 512) and applicable international copyright treaties. If you believe that content accessible through
            our interface infringes your copyright, please send a formal written notification containing the following elements
            to our designated contact email:
          </p>
          <ul>
            <li>
              <strong>Exact Location:</strong> The precise RAINE URL(s) or web page(s) where the disputed link or reference appears.
            </li>
            <li>
              <strong>Work Description:</strong> Specific identification and description of the copyrighted work claimed to have been infringed.
            </li>
            <li>
              <strong>Authorization:</strong> Proof of copyright ownership or legal authorization to act on behalf of the exclusive copyright owner.
            </li>
            <li>
              <strong>Contact Details:</strong> Your full legal name, physical address, telephone number, and official email address.
            </li>
            <li>
              <strong>Good Faith Statement:</strong> A declaration that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
            </li>
            <li>
              <strong>Perjury Statement:</strong> A statement made under penalty of perjury that the information in your notification is accurate and that you are the copyright owner or authorized to act on behalf of the owner.
            </li>
          </ul>

          <h2>3. Blacklisting &amp; Expedited Processing</h2>
          <p>
            Upon receipt of a complete and valid notification, RAINE will promptly review the submission and blacklist or remove
            the referenced links and embed entry points from our catalog.
          </p>
          <p>
            <strong>Important Note:</strong> Because RAINE does not host or store any media files, removing a link from our interface
            prevents it from appearing on RAINE, but does not remove the underlying file from the third-party web host or streaming server.
            To completely expunge the file from the Internet, copyright owners must also contact the hosting server or embed provider directly.
          </p>

          <h2>4. Designated Contact</h2>
          <p>
            All copyright notices and inquiries must be submitted directly to our designated email address:
          </p>
          <p>
            <a href="mailto:raine.issues@gmail.com">raine.issues@gmail.com</a>
          </p>
        </div>
      </article>
    </div>
  );
}
