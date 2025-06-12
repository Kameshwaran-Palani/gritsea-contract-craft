'use client';

import { FileText, PenLine, Upload } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section className="bg-[#f9fbfe] py-16 px-4 text-center relative">
      <h2 className="text-4xl font-bold text-[#346C9C]">How It Works</h2>
      <p className="text-gray-600 text-lg mt-2 mb-16 max-w-xl mx-auto">
        Create professional contracts in three simple steps. No legal expertise required.
      </p>

      {/* Timeline Line */}
      <div className="absolute left-0 right-0 top-[50%] h-[2px] bg-gradient-to-r from-blue-600 via-cyan-500 to-red-400 w-4/5 mx-auto z-0" />

      {/* Steps Container */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-6xl mx-auto items-start">
        {/* Step 1 */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="rounded-xl bg-[#eef2ff] p-4 shadow-md">
              <FileText size={32} className="text-blue-700" />
            </div>
            <span className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-white font-bold bg-blue-700 border-4 border-white w-10 h-10 flex items-center justify-center rounded-full shadow-md">
              1
            </span>
          </div>
          <h3 className="text-xl font-semibold mt-6">Select Template</h3>
          <p className="text-gray-600 text-sm max-w-xs">
            Choose from 10+ professional templates or start from scratch
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="rounded-xl bg-[#e6f9f7] p-4 shadow-md">
              <PenLine size={32} className="text-teal-700" />
            </div>
            <span className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-white font-bold bg-teal-700 border-4 border-white w-10 h-10 flex items-center justify-center rounded-full shadow-md">
              2
            </span>
          </div>
          <h3 className="text-xl font-semibold mt-6">Edit Easily</h3>
          <p className="text-gray-600 text-sm max-w-xs">
            Customize your contract with our intuitive editor and AI assistance
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="rounded-xl bg-[#ffecec] p-4 shadow-md">
              <Upload size={32} className="text-red-600" />
            </div>
            <span className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-white font-bold bg-red-600 border-4 border-white w-10 h-10 flex items-center justify-center rounded-full shadow-md">
              3
            </span>
          </div>
          <h3 className="text-xl font-semibold mt-6">Share & Sign</h3>
          <p className="text-gray-600 text-sm max-w-xs">
            Send to clients for digital signatures and track status in real-time
          </p>
        </div>
      </div>
    </section>
  );
}
