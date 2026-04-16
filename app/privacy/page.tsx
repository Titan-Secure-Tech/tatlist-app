import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy and Terms of Service | Tatlist',
  description:
    'Privacy policy and terms of service for Tatlist - Professional tattoo supply platform',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy and Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-8">Last updated: October 16, 2025</p>

        {/* Privacy Policy Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 border-b-2 border-foreground pb-2">
            Privacy Policy
          </h2>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Introduction</h3>
            <p className="text-foreground mb-4">
              Tatlist (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h3>
            <p className="text-foreground mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Business details (tattoo shop name, license number, address)</li>
              <li>Order and payment information</li>
              <li>Communication preferences</li>
              <li>Any other information you choose to provide</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h3>
            <p className="text-foreground mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
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
            <h3 className="text-2xl font-bold text-foreground mb-4">Information Sharing</h3>
            <p className="text-foreground mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
              <li>Service providers who assist in our operations (payment processing, shipping)</li>
              <li>Law enforcement when required by law</li>
              <li>Other parties with your consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Data Security</h3>
            <p className="text-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your
              personal information. However, no method of transmission over the Internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Your Rights</h3>
            <p className="text-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Cookies</h3>
            <p className="text-foreground mb-4">
              We use cookies and similar tracking technologies to track activity on our platform and
              hold certain information. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Changes to This Policy</h3>
            <p className="text-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last
              updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Contact Us</h3>
            <p className="text-foreground mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-foreground">
              Email: privacy@tatlist.com
              <br />
              Address: Tampa, FL
            </p>
          </section>
        </div>

        {/* Terms of Service Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 border-b-2 border-foreground pb-2">
            Terms of Service
          </h2>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Agreement to Terms</h3>
            <p className="text-foreground mb-4">
              By accessing or using Tatlist, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are
              prohibited from using this platform.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Use License</h3>
            <p className="text-foreground mb-4">
              Permission is granted to access and use Tatlist for personal, non-commercial purposes.
              This license shall automatically terminate if you violate any of these restrictions.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Professional Use Only</h3>
            <p className="text-foreground mb-4">
              Tatlist is intended for licensed tattoo professionals and registered tattoo shops
              only. By creating an account, you represent that:
            </p>
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
              <li>
                You are a licensed tattoo professional or authorized representative of a tattoo shop
              </li>
              <li>You possess all required licenses and permits to operate a tattoo business</li>
              <li>You will use our products for professional tattooing purposes only</li>
              <li>All information provided during registration is accurate and current</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Account Responsibilities</h3>
            <p className="text-foreground mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your account information remains accurate and up-to-date</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Orders and Payments</h3>
            <p className="text-foreground mb-4">
              All orders are subject to product availability and acceptance. We reserve the right to
              refuse or cancel any order at our discretion. Payment must be made in full before
              orders are processed.
            </p>
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
              <li>Prices are subject to change without notice</li>
              <li>We accept major credit cards and approved payment methods</li>
              <li>All sales are final unless products are defective or damaged</li>
              <li>Delivery fees are calculated based on your location</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Delivery and Service Area</h3>
            <p className="text-foreground mb-4">
              Currently, Tatlist provides delivery services within a 25-mile radius of Tampa, FL. We
              reserve the right to modify our service area at any time.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Product Information</h3>
            <p className="text-foreground mb-4">
              We strive to provide accurate product information, but we do not warrant that product
              descriptions, images, or other content is accurate, complete, or error-free. We
              reserve the right to correct any errors or update product information at any time.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Prohibited Activities</h3>
            <p className="text-foreground mb-4">You may not:</p>
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
              <li>Use the platform for any unlawful purpose</li>
              <li>Resell products without authorization</li>
              <li>Provide false or misleading information</li>
              <li>Interfere with the platform&apos;s operation</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Use automated tools to access the platform without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Intellectual Property</h3>
            <p className="text-foreground mb-4">
              All content on Tatlist, including text, graphics, logos, and software, is the property
              of Tatlist or its content suppliers and is protected by copyright and other
              intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h3>
            <p className="text-foreground mb-4">
              Tatlist shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the platform or
              products.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Indemnification</h3>
            <p className="text-foreground mb-4">
              You agree to indemnify and hold Tatlist harmless from any claims, damages, or expenses
              arising from your use of the platform or violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Modifications</h3>
            <p className="text-foreground mb-4">
              We reserve the right to modify these Terms of Service at any time. Changes will be
              effective immediately upon posting. Your continued use of the platform constitutes
              acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Governing Law</h3>
            <p className="text-foreground mb-4">
              These Terms of Service are governed by the laws of the State of Florida, without
              regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Contact Information</h3>
            <p className="text-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-foreground">
              Email: legal@tatlist.com
              <br />
              Address: Tampa, FL
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
