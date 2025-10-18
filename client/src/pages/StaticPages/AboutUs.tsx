export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              Smart Health Care System is dedicated to revolutionizing healthcare delivery through 
              innovative technology solutions. We strive to provide accessible, efficient, and 
              patient-centered healthcare services that empower both medical professionals and patients.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Comprehensive Care</h3>
                <p className="text-gray-700">
                  From appointment scheduling to lab results and e-prescriptions, we provide 
                  end-to-end healthcare management in one integrated platform.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-2">Digital Health Cards</h3>
                <p className="text-gray-700">
                  Secure, portable digital health records that put your medical information 
                  at your fingertips whenever you need it.
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-2">24/7 Access</h3>
                <p className="text-gray-700">
                  View your medical records, book appointments, and manage prescriptions 
                  anytime, anywhere, from any device.
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-900 mb-2">Expert Medical Staff</h3>
                <p className="text-gray-700">
                  Our platform connects you with qualified doctors, nurses, lab technicians, 
                  and pharmacists committed to your wellbeing.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-700 mb-4">
              We envision a future where quality healthcare is accessible to everyone, where 
              technology seamlessly integrates with compassionate care, and where patients 
              are active participants in their health journey.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Patient First:</strong> Every decision we make prioritizes patient safety, privacy, and satisfaction</li>
              <li><strong>Innovation:</strong> We continuously improve our platform with cutting-edge healthcare technology</li>
              <li><strong>Integrity:</strong> We maintain the highest standards of data security and ethical practice</li>
              <li><strong>Accessibility:</strong> We believe quality healthcare should be available to everyone</li>
              <li><strong>Collaboration:</strong> We foster teamwork between patients, healthcare providers, and technology</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join Our Healthcare Community</h2>
            <p className="text-gray-700 mb-4">
              Whether you're a patient seeking better health management tools or a healthcare 
              professional looking for efficient practice solutions, Smart Health Care System 
              is here to support your journey.
            </p>
            <p className="text-gray-700">
              Together, we're building a healthier tomorrow.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
