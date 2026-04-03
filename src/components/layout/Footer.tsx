import Link from 'next/link';
import { Instagram, Twitter, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import styles from './Footer.module.css';

const shopLinks   = ['New Arrivals', 'Men', 'Women', 'Accessories', 'Kente Drops', 'Sale'];
const infoLinks   = ['About Us', 'Sustainability', 'Careers', 'Press Kit', 'Affiliates'];
const supportLinks = ['Help Centre', 'Track Order', 'Returns', 'Size Guide', 'Contact Us'];

const socials = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter,   label: 'Twitter',   href: '#' },
  { icon: Facebook,  label: 'Facebook',  href: '#' },
  { icon: Youtube,   label: 'Youtube',   href: '#' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <div className={styles.logoRow}>
            <div className={styles.logoMark}>AT</div>
            <span className={styles.logoText}>ACCRA THREADS</span>
          </div>
          <p className={styles.tagline}>&ldquo;Wear the City. Own Your Story.&rdquo;</p>
          <p className={styles.desc}>
            Proudly Ghanaian. Accra-born, globally worn.
            Contemporary streetwear rooted in Kente culture.
          </p>
          <div className={styles.socials}>
            {socials.map(s => (
              <a key={s.label} href={s.href} aria-label={s.label} className={styles.socialBtn}>
                <s.icon size={17} />
              </a>
            ))}
          </div>
          <div className={styles.contact}>
            <span><MapPin size={13} /> Osu, Accra, Ghana</span>
            <span><Phone size={13} /> +233 30 277 0000</span>
            <span><Mail size={13} /> hello@accrathreads.com</span>
          </div>
        </div>

        <div className={styles.cols}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Shop</h4>
            <ul className={styles.colLinks}>
              {shopLinks.map(l => (
                <li key={l}><Link href="/shop" className={styles.footLink}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Company</h4>
            <ul className={styles.colLinks}>
              {infoLinks.map(l => (
                <li key={l}><Link href="#" className={styles.footLink}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Support</h4>
            <ul className={styles.colLinks}>
              {supportLinks.map(l => (
                <li key={l}><Link href="/support" className={styles.footLink}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Newsletter</h4>
            <p className={styles.newsletterDesc}>
              Exclusive drops. Style guides. Cowrie Points offers.
            </p>
            <div className={styles.newsletterForm}>
              <input type="email" placeholder="your@email.com" className={styles.newsletterInput} />
              <button className={`btn btn-primary btn-sm ${styles.newsletterBtn}`}>Join</button>
            </div>
            <div className={styles.badges}>
              <div className={styles.payBadge}>🌍 GHS</div>
              <div className={styles.payBadge}>Paystack</div>
              <div className={styles.payBadge}>MoMo</div>
              <div className={styles.payBadge}>Visa</div>
              <div className={styles.payBadge}>Mastercard</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>© 2025 Accra Threads Ltd. All rights reserved. Accra, Ghana.</p>
        <div className={styles.bottomLinks}>
          <Link href="#" className={styles.microLink}>Privacy Policy</Link>
          <Link href="#" className={styles.microLink}>Terms of Service</Link>
          <Link href="#" className={styles.microLink}>Cookie Policy</Link>
        </div>
        <div className={styles.madeIn}>
          <span className={styles.flag}>🇬🇭</span>
          Made in Ghana
        </div>
      </div>
    </footer>
  );
}
