import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    // General Questions
    {
      category: 'general',
      question: 'What is Smart Health Care System?',
      answer: 'Smart Health Care System is a comprehensive digital healthcare platform that enables patients to manage appointments, access lab results, receive e-prescriptions, and maintain their health records online. It connects patients with healthcare providers including doctors, nurses, lab technicians, and pharmacists.'
    },
    {
      category: 'general',
      question: 'How do I create an account?',
      answer: 'Click on the "Register" button on the homepage, fill in your personal information including name, email, and password. You\'ll receive a confirmation email to verify your account. Once verified, you can log in and complete your health profile.'
    },
    {
      category: 'general',
      question: 'Is my personal health information secure?',
      answer: 'Yes, absolutely. We use industry-standard encryption, comply with HIPAA regulations, and implement multiple layers of security to protect your personal and medical information. Your data is stored securely and only accessible to authorized healthcare providers involved in your care.'
    },
    
    // Appointments
    {
      category: 'appointments',
      question: 'How do I book an appointment?',
      answer: 'Log in to your account, navigate to the Appointments page, select your preferred doctor and department, choose an available time slot, and confirm your booking. You\'ll receive a confirmation email and SMS reminder before your appointment.'
    },
    {
      category: 'appointments',
      question: 'Can I cancel or reschedule an appointment?',
      answer: 'Yes, you can cancel or reschedule appointments from your dashboard. Please do so at least 24 hours in advance to avoid cancellation fees and to allow other patients to book the slot.'
    },
    {
      category: 'appointments',
      question: 'What happens if I miss my appointment?',
      answer: 'If you miss an appointment without canceling, it will be marked as a no-show. Multiple no-shows may affect your ability to book future appointments. Please contact us if you have an emergency or unavoidable situation.'
    },
    
    // Digital Health Card
    {
      category: 'health-card',
      question: 'What is a Digital Health Card?',
      answer: 'Your Digital Health Card is a unique identifier that contains your medical information, including medical history, allergies, current medications, and emergency contacts. It can be accessed anytime and shared with healthcare providers for better care coordination.'
    },
    {
      category: 'health-card',
      question: 'How do I access my Digital Health Card?',
      answer: 'Navigate to the Digital Health Card section in your dashboard. You can view, download, or share your card securely. The card contains a QR code that healthcare providers can scan to access your basic health information in emergencies.'
    },
    
    // Lab Results
    {
      category: 'lab',
      question: 'When will my lab results be available?',
      answer: 'Most lab results are available within 24-72 hours, depending on the type of test. You\'ll receive a notification when your results are ready. You can view them in the Lab Results section of your dashboard.'
    },
    {
      category: 'lab',
      question: 'Can I download my lab results?',
      answer: 'Yes, all your lab results can be downloaded as PDF files from your dashboard. You can also share them securely with other healthcare providers if needed.'
    },
    {
      category: 'lab',
      question: 'What if I don\'t understand my lab results?',
      answer: 'Your doctor will review your results with you during your follow-up appointment. If you have urgent questions, you can message your doctor through the platform or contact our support team for assistance.'
    },
    
    // Prescriptions
    {
      category: 'prescriptions',
      question: 'How do e-prescriptions work?',
      answer: 'When your doctor prescribes medication, it\'s sent electronically to our pharmacy system. You\'ll receive a notification, and you can pick up your medication from any affiliated pharmacy. You can also view all your current and past prescriptions in your dashboard.'
    },
    {
      category: 'prescriptions',
      question: 'Can I request a prescription refill?',
      answer: 'Yes, if you have an active prescription with refills available, you can request a refill through the Prescriptions page. The request will be reviewed by your doctor or pharmacist.'
    },
    {
      category: 'prescriptions',
      question: 'What if I have a reaction to my medication?',
      answer: 'If you experience any adverse reactions, contact your doctor immediately or seek emergency care if severe. You can also report medication side effects through your dashboard to update your medical record.'
    },
    
    // Technical Support
    {
      category: 'technical',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and you\'ll receive a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      category: 'technical',
      question: 'Which browsers are supported?',
      answer: 'Our platform works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience and security.'
    },
    {
      category: 'technical',
      question: 'Can I use the platform on my mobile device?',
      answer: 'Yes, our platform is fully responsive and works on smartphones and tablets. You can access all features through your mobile browser. We\'re also developing dedicated mobile apps for iOS and Android.'
    },
    
    // Billing and Insurance
    {
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards, debit cards, and various insurance plans. You can add your payment methods and insurance information in your profile settings.'
    },
    {
      category: 'billing',
      question: 'How do I view my billing history?',
      answer: 'Your billing history is available in the Billing section of your dashboard. You can view detailed invoices, payment receipts, and insurance claims.'
    },
    {
      category: 'billing',
      question: 'Does the platform accept my insurance?',
      answer: 'We work with most major insurance providers. Please check our Insurance page for a complete list or contact our billing department to verify your specific plan.'
    },
    
    // Privacy and Security
    {
      category: 'privacy',
      question: 'Who can see my medical records?',
      answer: 'Only authorized healthcare providers directly involved in your care can access your medical records. You can also grant temporary access to specialists or other providers as needed.'
    },
    {
      category: 'privacy',
      question: 'How long is my data stored?',
      answer: 'We retain your medical records according to healthcare regulations, typically for at least 7 years. You can request a copy of your records or deletion of your account at any time, subject to legal requirements.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'general', name: 'General' },
    { id: 'appointments', name: 'Appointments' },
    { id: 'health-card', name: 'Digital Health Card' },
    { id: 'lab', name: 'Lab Results' },
    { id: 'prescriptions', name: 'Prescriptions' },
    { id: 'technical', name: 'Technical Support' },
    { id: 'billing', name: 'Billing & Insurance' },
    { id: 'privacy', name: 'Privacy & Security' }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-700 mb-8">
          Find answers to common questions about our Smart Health Care System platform.
        </p>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Still have questions?</h2>
          <p className="text-gray-700 mb-4">
            If you couldn't find the answer you're looking for, our support team is here to help.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@smarthealthcare.com"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors font-semibold"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
