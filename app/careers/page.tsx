import Link from 'next/link'
import BackButton from '@/components/BackButton'

export default function CareersPage() {
  const jobs = [
    {
      title: "Software Engineer",
      type: "Full-time",
      location: "Abuja Office",
      description: "Join our engineering team to build and maintain Hotelsaver.ng's platform. You'll work on our Next.js application, API integrations, and help scale our negotiation algorithms. We're looking for developers passionate about creating user-friendly hotel booking experiences.",
      requirements: [
        "3+ years experience with JavaScript/TypeScript",
        "Experience with React, Next.js, or similar frameworks",
        "Knowledge of REST APIs and database design",
        "Problem-solving mindset and attention to detail",
        "Must work from our Abuja office location"
      ]
    },
    {
      title: "Software Tester (QA Engineer)",
      type: "Full-time", 
      location: "Abuja Office",
      description: "Ensure the quality and reliability of our platform by designing and executing comprehensive test plans. You'll work closely with our development team to identify bugs, test new features, and maintain our high standards of user experience.",
      requirements: [
        "2+ years experience in software testing/QA",
        "Knowledge of manual and automated testing",
        "Experience with web application testing",
        "Strong analytical and communication skills",
        "Must work from our Abuja office location"
      ]
    },
    {
      title: "Sales Representative",
      type: "Full-time",
      location: "Abuja Office",
      description: "Drive business growth by building relationships with hotels and accommodation providers across Nigeria. You'll be responsible for onboarding new partners, negotiating commission structures, and expanding our hotel inventory in key Nigerian cities.",
      requirements: [
        "2+ years sales experience, preferably in hospitality",
        "Strong communication and negotiation skills",
        "Knowledge of Nigerian hotel market is a plus",
        "Self-motivated with proven track record",
        "Must work from our Abuja office location"
      ]
    },
    {
      title: "Customer Service Agent",
      type: "Full-time",
      location: "Abuja Office", 
      description: "Be the voice of Hotelsaver.ng by providing exceptional customer support via WhatsApp, phone, and email. You'll help customers with bookings, resolve issues, and ensure every interaction reflects our commitment to excellent service.",
      requirements: [
        "1+ years customer service experience",
        "Excellent English communication skills",
        "Experience with WhatsApp Business and phone support",
        "Patient, empathetic, and solution-oriented",
        "Must work from our Abuja office location"
      ]
    }
  ]

  return (
    <div className="py-8">
      <BackButton />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us revolutionize hotel bookings in Nigeria. We're building the future of travel and need talented individuals to join our mission.
          </p>
        </div>

        <div className="grid gap-8">
          {jobs.map((job, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-brand-green/10 text-brand-green rounded-full font-medium">
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                  </div>
                </div>
                <a 
                  href="mailto:admin@hotelsaver.ng?subject=Application for Software Engineer Position&body=Hello HotelSaver Team,%0D%0A%0D%0AI am interested in applying for the Software Engineer position. Please find my details below:%0D%0A%0D%0AName:%0D%0APhone:%0D%0AExperience:%0D%0A%0D%0AThank you for your consideration."
                  className="mt-4 md:mt-0 bg-brand-green text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Apply Now
                </a>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements:</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="flex items-start gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join Us?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            All positions require dedicated staff to work from our agreed office location in Abuja. 
            We offer competitive salaries, growth opportunities, and the chance to be part of Nigeria's 
            leading hotel negotiation platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:admin@hotelsaver.ng?subject=General Career Inquiry&body=Hello HotelSaver Team,%0D%0A%0D%0AI am interested in career opportunities at HotelSaver.ng. Please find my details below:%0D%0A%0D%0AName:%0D%0APhone:%0D%0APosition of Interest:%0D%0AExperience:%0D%0A%0D%0AThank you for your consideration."
              className="bg-brand-green text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us About Careers
            </a>
            <a 
              href="https://wa.me/2347077775545?text=Hello, I'm interested in career opportunities at Hotelsaver.ng"
              target="_blank"
              className="bg-white text-brand-green border-2 border-brand-green px-8 py-3 rounded-lg font-medium hover:bg-brand-green hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.003 9.003 0 01-5.026-1.511L3 21l2.489-4.026A8.951 8.951 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}