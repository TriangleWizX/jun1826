import re

css_path = "/home/twizss/Documents/ssbjjweb/tmb/sensei-sandy-logo-global.css"
with open(css_path, "r") as f:
    css = f.read()

# Remove old VIP footer styles
css = re.sub(r'/\* =========================================================\n   VIP Footer Styles[\s\S]*', '', css)

# Add new styles
new_css = """/* =========================================================
   Image-To-Code VIP Footer & CTA Styles
   ========================================================= */

/* --- CTA Card --- */
.ss-cta-footer-section {
  padding: 4rem 1rem;
  background-color: var(--ss-bg, #FBFAF8);
  display: flex;
  justify-content: center;
}

.ss-cta-card-vip {
  background: #f8f6f0; /* parchment-like */
  background-image: radial-gradient(circle at 100% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(54, 43, 36, 0.08), inset 0 0 0 1px rgba(255,255,255,0.5);
  max-width: 1100px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(54, 43, 36, 0.05);
}

.ss-cta-card-left {
  flex: 1 1 600px;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ss-cta-eyebrow {
  color: #B58453;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.ss-cta-headline {
  font-family: "Playfair Display", Lora, Georgia, serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: var(--ss-ink, #1F1712);
  line-height: 1.05;
  margin-bottom: 1.5rem;
  font-weight: 400;
  letter-spacing: -0.02em;
}

.ss-cta-copy {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--ss-muted, #4F433C);
  max-width: 540px;
  margin-bottom: 2.5rem;
}

.ss-cta-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ss-cta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ss-ink, #1F1712);
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
}

.ss-cta-badge svg {
  width: 16px;
  height: 16px;
  color: #6d7570;
}

.ss-cta-card-divider {
  width: 1px;
  background: linear-gradient(to bottom, rgba(54, 43, 36, 0) 0%, rgba(54, 43, 36, 0.1) 20%, rgba(54, 43, 36, 0.1) 80%, rgba(54, 43, 36, 0) 100%);
  margin: 3rem 0;
}

.ss-cta-card-right {
  flex: 0 0 380px;
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
  position: relative;
}

/* Speed lines effect behind button */
.ss-cta-card-right::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  width: 40px;
  height: 80px;
  background: 
    linear-gradient(to right, transparent, rgba(181, 132, 83, 0.2)) 0 10px / 100% 2px no-repeat,
    linear-gradient(to right, transparent, rgba(181, 132, 83, 0.2)) 10px 30px / 80% 2px no-repeat,
    linear-gradient(to right, transparent, rgba(181, 132, 83, 0.2)) 5px 50px / 90% 2px no-repeat,
    linear-gradient(to right, transparent, rgba(181, 132, 83, 0.2)) 15px 70px / 70% 2px no-repeat;
  z-index: 0;
}

.ss-btn-cta-primary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #2C3A32;
  color: #fff;
  padding: 1.1rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.05rem;
  box-shadow: 0 8px 24px rgba(44, 58, 50, 0.3), inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 0 4px rgba(181, 132, 83, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  z-index: 1;
}

.ss-btn-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(44, 58, 50, 0.4), inset 0 0 0 1px rgba(255,255,255,0.15), 0 0 0 4px rgba(181, 132, 83, 0.25);
  color: #fff;
}

.ss-btn-cta-primary-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ss-btn-cta-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  background: transparent;
  color: #B58453;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.05rem;
  border: 1px solid rgba(181, 132, 83, 0.3);
  transition: background 0.2s, color 0.2s;
  position: relative;
  z-index: 1;
}

.ss-btn-cta-secondary:hover {
  background: rgba(181, 132, 83, 0.05);
  color: #9A6D42;
}

.ss-btn-cta-link {
  color: var(--ss-ink, #1F1712);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  position: relative;
  z-index: 1;
}

.ss-btn-cta-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: calc(100% - 20px);
  height: 1px;
  border-bottom: 2px dotted rgba(54, 43, 36, 0.4);
}

.ss-btn-cta-link:hover {
  color: var(--ss-orange, #E05500);
}

@media (max-width: 991.98px) {
  .ss-cta-card-divider {
    width: 100%;
    height: 1px;
    margin: 0;
    background: linear-gradient(to right, rgba(54, 43, 36, 0) 0%, rgba(54, 43, 36, 0.1) 20%, rgba(54, 43, 36, 0.1) 80%, rgba(54, 43, 36, 0) 100%);
  }
  .ss-cta-card-right {
    flex: 1 1 100%;
    padding: 3rem;
  }
}

@media (max-width: 767.98px) {
  .ss-cta-card-left {
    padding: 2.5rem 1.5rem;
  }
  .ss-cta-card-right {
    padding: 2.5rem 1.5rem;
  }
  .ss-cta-headline {
    font-size: 2.2rem;
  }
}

/* --- New Image-to-Code Footer --- */
.ss-new-site-footer {
  background-color: var(--ss-bg, #FBFAF8);
  padding: 4rem 1rem 2rem;
  font-family: inherit;
  color: var(--ss-ink, #1F1712);
}

.ss-new-footer-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.ss-new-footer-top {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  margin-bottom: 4rem;
}

.ss-new-footer-brand {
  flex: 1 1 300px;
  padding-right: 2rem;
}

.ss-new-brand-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ss-new-brand-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid var(--ss-ink, #1F1712);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ss-ink, #1F1712);
}

.ss-new-brand-logo svg {
  width: 40px;
  height: 40px;
}

.ss-new-brand-title {
  font-family: "Playfair Display", Lora, Georgia, serif;
  font-size: 1.8rem;
  font-weight: 500;
  color: var(--ss-ink, #1F1712);
}

.ss-new-brand-desc {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--ss-muted, #4F433C);
  margin-bottom: 2rem;
  max-width: 320px;
}

.ss-new-contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ss-new-contact-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--ss-muted, #4F433C);
  line-height: 1.4;
}

.ss-new-contact-row svg {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}

.ss-new-footer-nav {
  flex: 2 1 600px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.ss-new-nav-col h3 {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ss-ink, #1F1712);
  margin-bottom: 1.5rem;
}

.ss-new-nav-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ss-new-nav-col a {
  color: var(--ss-muted, #4F433C);
  font-size: 0.95rem;
  text-decoration: none;
  border-bottom: 1px solid rgba(54, 43, 36, 0.1);
  padding-bottom: 4px;
  transition: color 0.2s, border-color 0.2s;
  display: inline-block;
}

.ss-new-nav-col a:hover {
  color: var(--ss-orange, #E05500);
  border-color: var(--ss-orange, #E05500);
}

.ss-new-footer-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding-top: 2rem;
  border-top: 1px solid rgba(54, 43, 36, 0.1);
  font-size: 0.9rem;
  color: var(--ss-muted, #4F433C);
  gap: 1.5rem;
}

.ss-new-footer-contacts {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.ss-new-footer-contact-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ss-ink, #1F1712);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.ss-new-footer-contact-link:hover {
  color: var(--ss-orange, #E05500);
}

.ss-new-footer-contact-link svg {
  width: 18px;
  height: 18px;
}

.ss-new-divider {
  width: 1px;
  height: 16px;
  background: rgba(54, 43, 36, 0.2);
}

@media (max-width: 991.98px) {
  .ss-new-footer-nav {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767.98px) {
  .ss-new-footer-top {
    flex-direction: column;
  }
  .ss-new-footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
"""

with open(css_path, "w") as f:
    f.write(css + "\n" + new_css)
