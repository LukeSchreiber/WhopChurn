'use client';

import { useState, useEffect } from 'react';

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
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px' 
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        📝 Exit Survey
      </h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: 0, fontSize: '16px' }}>
          We&apos;re sorry to see you go! Your feedback helps us improve for everyone.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Why are you canceling? *
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              <label key={reason} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                {reason}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Any additional feedback? (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more about your experience..."
            style={{
              width: '100%',
              height: '100px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedReason || loading}
          style={{
            width: '100%',
            padding: '15px',
            background: selectedReason ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: selectedReason ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
