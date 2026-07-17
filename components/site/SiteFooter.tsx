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
            <p style={{ color: "#a9b8b5", marginTop: 12 }}>Bahrain&apos;s biggest sanctuary — giving animals a loving home.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
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
          <div>
            <h4>Contact</h4>
            <ul>
              <li>hello@aamalalmoayyed.bh</li>
              <li>+973 1234 5678</li>
              <li>Manama, Bahrain</li>
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
