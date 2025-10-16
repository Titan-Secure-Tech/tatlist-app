import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Tatlist',
  description: 'Privacy policy for Tatlist - Professional tattoo supply platform',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-black mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">Last updated: October 16, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            Tatlist (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Account information (name, email address, password)</li>
            <li>Business details (tattoo shop name, license number, address)</li>
            <li>Order and payment information</li>
            <li>Communication preferences</li>
            <li>Any other information you choose to provide</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your orders and payments</li>
            <li>Send you order confirmations and updates</li>
            <li>Verify your tattoo shop license and business credentials</li>
            <li>Communicate with you about products, services, and promotions</li>
            <li>Respond to your comments and questions</li>
            <li>Detect, prevent, and address fraud and security issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Service providers who assist in our operations (payment processing, shipping)</li>
            <li>Law enforcement when required by law</li>
            <li>Other parties with your consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal
            information. However, no method of transmission over the Internet is 100% secure, and we
            cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to track activity on our platform and
            hold certain information. You can instruct your browser to refuse all cookies or to
            indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot;
            date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700">
            Email: privacy@tatlist.com
            <br />
            Address: Tampa, FL
          </p>
        </section>
      </div>
    </div>
  )
}
