'use client';

import { useState, useEffect } from 'react';
import "../../globals.css"; // Assuming globals.css with Tailwind

export default function ExitSurvey() {
  const [memberId, setMemberId] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setMemberId(urlParams.get('memberId') || '');
    setBusinessId(urlParams.get('businessId') || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          businessId,
          reason: selectedReason,
          feedback
        })
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Survey submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '600px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#28a745' }}>✅ Thank You!</h1>
        <p>Your feedback has been submitted and will help us improve.</p>
        <p>We appreciate you taking the time to share your thoughts.</p>
      </div>
    );
  }

  return (
    <div className="font-sans max-w-xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-200 text-center mb-6">
        📝 Exit Survey
      </h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-md">
        <p className="text-base text-gray-300">
          We&apos;re sorry to see you go! Your feedback helps us improve for everyone.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold text-gray-200">
            Why are you canceling? *
          </label>
          
          <div className="space-y-2">
            {[
              'Too expensive',
              "Didn't use it enough",
              'Found a better alternative',
              'Technical issues',
              'Not what I expected',
              'Poor customer support',
              'Product not working as advertised',
              'Other'
            ].map((reason) => (
              <label key={reason} className="flex items-center p-3 bg-gray-800 border border-gray-600 rounded-md cursor-pointer hover:bg-gray-700 transition">
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-3 text-blue-500 focus:ring-blue-400"
                />
                <span className="text-gray-200">{reason}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-200">
            Any additional feedback? (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more about your experience..."
            className="w-full h-24 p-3 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-200 resize-vertical"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedReason || loading}
          className="w-full py-4 bg-blue-600 text-white rounded-md font-medium text-base disabled:bg-gray-600 hover:bg-blue-700 transition cursor-pointer shadow-md"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
