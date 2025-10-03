import { ContactForm } from '@/components/contact/contact-form'
import { Card } from '@/components/ui/card'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question about our products or services? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">info@tatlist.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">Contact us via email for fastest response</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Service Area</p>
                      <p className="text-muted-foreground">Tampa Bay Area, Florida</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-2">Business Hours</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
                <ContactForm />
              </Card>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 text-center">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">
                Need Immediate Assistance?
              </h3>
              <p className="text-muted-foreground mb-4">
                For urgent inquiries or existing order support, please email us directly at{' '}
                <a 
                  href="mailto:info@tatlist.com" 
                  className="text-primary hover:underline font-medium"
                >
                  info@tatlist.com
                </a>
                {' '}and we'll get back to you as soon as possible.
              </p>
              <p className="text-sm text-muted-foreground">
                We typically respond to all inquiries within 24 hours during business days.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}