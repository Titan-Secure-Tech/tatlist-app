import { ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-black mb-8">About Tatlist</h1>
      
      <div className="prose prose-gray max-w-none mb-12">
        <p className="text-lg text-gray-700 leading-relaxed">
          Welcome to Tatlist, your premier destination for professional tattoo supplies and equipment. 
          We're dedicated to providing artists with the highest quality tools and materials to bring 
          their creative visions to life.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ShoppingBag className="h-10 w-10 text-black mb-4" />
          <h2 className="text-xl font-semibold text-black mb-2">Quality Products</h2>
          <p className="text-gray-600">
            We source only the finest tattoo supplies from trusted manufacturers, 
            ensuring every product meets professional standards.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <Truck className="h-10 w-10 text-black mb-4" />
          <h2 className="text-xl font-semibold text-black mb-2">Fast Shipping</h2>
          <p className="text-gray-600">
            Get your supplies quickly with our reliable shipping partners. 
            Most orders ship within 24 hours.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <Shield className="h-10 w-10 text-black mb-4" />
          <h2 className="text-xl font-semibold text-black mb-2">Secure & Safe</h2>
          <p className="text-gray-600">
            Shop with confidence knowing your information is protected 
            with industry-leading security measures.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <CreditCard className="h-10 w-10 text-black mb-4" />
          <h2 className="text-xl font-semibold text-black mb-2">Easy Payment</h2>
          <p className="text-gray-600">
            Multiple payment options available for your convenience, 
            including all major credit cards.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-black mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          At Tatlist, we believe every tattoo artist deserves access to professional-grade 
          supplies without the hassle. We're committed to making the procurement process 
          simple, reliable, and affordable, so you can focus on what you do best - creating art.
        </p>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold text-black mb-4">Have Questions?</h3>
        <p className="text-gray-600 mb-6">
          We're here to help. Reach out to our support team anytime.
        </p>
        <a 
          href="mailto:support@tatlist.com" 
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}