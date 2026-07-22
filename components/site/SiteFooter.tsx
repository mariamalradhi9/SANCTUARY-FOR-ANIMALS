import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo logo-footer">
              Aamal Almoayyed
              <br />
              <span>Sanctuary for Animals</span>
            </div>
            <p className="footer-about">We are Bahrain&apos;s biggest sanctuary, always looking for loving homes and creative ways to help animals in need.</p>
            <Link href="/search" className="footer-accent-link">Meet Our Animals</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <div className="footer-contact-row"><span className="footer-contact-icon">📍</span><span>Manama, Bahrain</span></div>
            <div className="footer-contact-row"><span className="footer-contact-icon">📞</span><span>+973 1234 5678</span></div>
            <div className="footer-contact-row"><span className="footer-contact-icon">✉️</span><span><a href="mailto:hello@aamalalmoayyed.bh" className="footer-accent-link">hello@aamalalmoayyed.bh</a></span></div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/search">Adopt a Pet</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/dashboard">My Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><Link href="/adopt">Adoption Application</Link></li>
              <li><Link href="/#how-it-works">How It Works</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} Aamal Almoayyed Sanctuary. All rights reserved.</span>
          <span>Made with 🧡 for animals in need.</span>
        </div>
      </div>
    </footer>
  );
}
