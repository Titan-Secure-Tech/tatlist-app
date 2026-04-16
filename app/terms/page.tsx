import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Tatlist',
  description: 'Terms of service for Tatlist - Professional tattoo supply platform',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-8">Last updated: October 16, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Agreement to Terms</h2>
          <p className="text-foreground mb-4">
            By accessing or using Tatlist, you agree to be bound by these Terms of Service and all
            applicable laws and regulations. If you do not agree with any of these terms, you are
            prohibited from using this platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Use License</h2>
          <p className="text-foreground mb-4">
            Permission is granted to access and use Tatlist for personal, non-commercial purposes.
            This license shall automatically terminate if you violate any of these restrictions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Professional Use Only</h2>
          <p className="text-foreground mb-4">
            Tatlist is intended for licensed tattoo professionals and registered tattoo shops only.
            By creating an account, you represent that:
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Account Responsibilities</h2>
          <p className="text-foreground mb-4">You are responsible for:</p>
          <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
            <li>Ensuring your account information remains accurate and up-to-date</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Orders and Payments</h2>
          <p className="text-foreground mb-4">
            All orders are subject to product availability and acceptance. We reserve the right to
            refuse or cancel any order at our discretion. Payment must be made in full before orders
            are processed.
          </p>
          <ul className="list-disc pl-6 text-foreground mb-4 space-y-2">
            <li>Prices are subject to change without notice</li>
            <li>We accept major credit cards and approved payment methods</li>
            <li>All sales are final unless products are defective or damaged</li>
            <li>Delivery fees are calculated based on your location</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Delivery and Service Area</h2>
          <p className="text-foreground mb-4">
            Currently, Tatlist provides delivery services within a 25-mile radius of Tampa, FL. We
            reserve the right to modify our service area at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product Information</h2>
          <p className="text-foreground mb-4">
            We strive to provide accurate product information, but we do not warrant that product
            descriptions, images, or other content is accurate, complete, or error-free. We reserve
            the right to correct any errors or update product information at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Prohibited Activities</h2>
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Intellectual Property</h2>
          <p className="text-foreground mb-4">
            All content on Tatlist, including text, graphics, logos, and software, is the property
            of Tatlist or its content suppliers and is protected by copyright and other intellectual
            property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
          <p className="text-foreground mb-4">
            Tatlist shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages resulting from your use of or inability to use the platform or
            products.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Indemnification</h2>
          <p className="text-foreground mb-4">
            You agree to indemnify and hold Tatlist harmless from any claims, damages, or expenses
            arising from your use of the platform or violation of these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Modifications</h2>
          <p className="text-foreground mb-4">
            We reserve the right to modify these Terms of Service at any time. Changes will be
            effective immediately upon posting. Your continued use of the platform constitutes
            acceptance of the modified terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Governing Law</h2>
          <p className="text-foreground mb-4">
            These Terms of Service are governed by the laws of the State of Florida, without regard
            to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
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
  )
}
