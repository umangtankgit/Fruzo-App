import React from 'react'

const Contact = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-12 mb-24 px-6 sm:px-10 w-full">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-xl border border-gray-100 p-8 sm:p-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-500 mb-8">Have questions about wholesale orders, daily Mandi pricing, or fresh stock? Get in touch directly.</p>
        
        <div className="flex flex-col gap-5 text-left bg-primary/5 p-6 sm:p-8 rounded-lg border border-primary/20">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="font-bold text-gray-800 w-24">Business:</span>
            <span className="text-gray-700">Jaiswal Fruits</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="font-bold text-gray-800 w-24">Owner:</span>
            <span className="text-gray-700">Subhash Jaiswal</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="font-bold text-gray-800 w-24">Phone:</span>
            <span className="text-primary font-bold text-lg">+91 93242 31624</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-2 pt-4 border-t border-gray-300">
            <span className="font-bold text-gray-800 w-24">Location:</span>
            <span className="text-gray-700">Prabhadevi Circle, Opposite Sumer Trinity, Mumbai, Maharashtra, India</span>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Contact