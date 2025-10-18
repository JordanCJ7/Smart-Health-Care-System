# Static Pages

This folder contains generic static pages for the Smart Health Care System.

## Pages

### 1. About Us (`AboutUs.tsx`)
- Mission statement and vision
- Services offered (Comprehensive Care, Digital Health Cards, 24/7 Access, Expert Medical Staff)
- Core values
- Call to action to join the healthcare community

### 2. Contact Us (`ContactUs.tsx`)
- Contact information (phone, email, address)
- Business hours
- Emergency hotline (24/7)
- Technical support information
- Interactive contact form with validation
- Links to FAQ section

### 3. Privacy Policy (`PrivacyPolicy.tsx`)
- HIPAA compliance statement
- Information collection (personal, medical, technical)
- Data usage and sharing policies
- Security measures
- User rights (access, correction, deletion, etc.)
- Data retention policies
- Cookie and tracking information
- Contact information for privacy concerns

### 4. FAQ (`FAQ.tsx`)
- Searchable/filterable FAQ categories:
  - General Questions
  - Appointments
  - Digital Health Card
  - Lab Results
  - Prescriptions
  - Technical Support
  - Billing & Insurance
  - Privacy & Security
- Expandable accordion interface
- Links to contact support

### 5. Terms of Service (`TermsOfService.tsx`)
- Account registration terms
- Permitted and prohibited use
- Medical disclaimer and emergency notice
- Appointment and cancellation policies
- Privacy and data protection
- Payment and billing terms
- Intellectual property rights
- Limitation of liability
- Dispute resolution and governing law
- Termination policies

## Routes

All static pages are accessible via the following routes:
- `/about` - About Us
- `/contact` - Contact Us
- `/privacy` - Privacy Policy
- `/faq` - Frequently Asked Questions
- `/terms` - Terms of Service

## Footer Integration

The footer component (`Footer.tsx`) has been updated to include:
- Four-column layout with Smart Health Care System info
- Quick Links section
- Support section with emergency hotline and email
- Legal section with links to Privacy Policy and Terms of Service
- HIPAA compliance badge
- Social media links (placeholders)
- Copyright information

## Styling

All pages use Tailwind CSS for styling and maintain consistent design with:
- Responsive layouts
- Accessible color schemes
- Clear typography hierarchy
- Interactive elements (forms, accordions, buttons)
- Professional healthcare-appropriate design

## Usage

Import and use in React components:
```tsx
import { AboutUs, ContactUs, PrivacyPolicy, FAQ, TermsOfService } from './pages/StaticPages';
```

Or import individually:
```tsx
import AboutUs from './pages/StaticPages/AboutUs';
```
