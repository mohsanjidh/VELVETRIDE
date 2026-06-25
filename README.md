# 🚗 VelvetRide Rentals — Website

Premium luxury car rental website built for VelvetRide Rentals.

## 📁 Files
- `index.html` — Complete single-file website (all CSS + JS included)

## ✅ Features Included

### Design
- Deep Purple (#634072) primary brand color with gold accents
- Cormorant Garamond + Raleway typography pairing
- Dark luxury aesthetic with noise texture overlay
- Fully responsive (mobile, tablet, desktop)

### Animations
- Hero entrance animations (staggered)
- Scroll-triggered reveal animations throughout
- Marquee car strip
- Car card hover effects
- WhatsApp pulse + ring animation
- Scroll indicator animation

### Sections
1. **Navigation** — Fixed with scroll effect, mobile hamburger menu
2. **Hero** — Full-screen with CTA, stats, scroll indicator
3. **Car Marquee Strip** — Animated brand showcase
4. **Booking Widget** — Location, dates, category filter with live results
5. **Featured Cars** — 3 highlight vehicles with modal detail view
6. **Fleet Gallery** — Categorized tabs (Luxury / Modified / Imported / Budget)
7. **Experience Section** — Why VelvetRide with feature highlights
8. **Services** — 6 service cards with hover effects
9. **Why Choose Us** — 4-grid reason layout
10. **Testimonials** — Scrollable customer reviews
11. **Enquiry Form** — Full contact form with validation
12. **About** — Company story + stats
13. **Footer** — Links, newsletter signup, social icons
14. **Legal Modals** — Privacy Policy, Terms & Conditions, Rental Agreement

### Functionality
- 🔍 Smart availability filter (date + location + category)
- 🚗 Car detail modals with specs + pricing
- 📋 Pre-filled enquiry form (from car cards)
- 💬 Floating WhatsApp button (persistent)
- 🔔 Toast notification system
- 📱 Mobile-responsive navigation
- ✅ Form validation

## 🎨 Customization

### Replace Placeholder Images
Images use Unsplash URLs. Replace with actual photos:
```html
<img src="YOUR_ACTUAL_IMAGE_URL" alt="Car Name">
```

### Update Contact Info
Search for and replace:
- `+91 98765 43210` — your phone number
- `hello@velvetride.in` — your email
- `VelvetRide HQ, Bandra West, Mumbai` — your address
- WhatsApp link: `https://wa.me/919876543210` → your number

### Update Pricing
Edit the pricing in the JavaScript `carDetails` object and fleet card HTML sections.

### Add More Cars
Duplicate a `.fleet-item` div block and update the `data-cat` attribute.

## 🚀 Deployment
Just upload `index.html` to any web host. No build process needed.
Works on: GitHub Pages, Netlify, Vercel, cPanel, etc.

---
Built with ❤️ for VelvetRide Rentals
