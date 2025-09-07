"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const OAuthCallback = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      window.opener?.postMessage({
        type: 'OAUTH_ERROR',
        error: error
      }, '*');
      window.close();
      return;
    }

    if (code) {
      // Extract source from URL or state
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('source') || 'google-drive'; // Default fallback
      
      // Send success message to parent window
      window.opener?.postMessage({
        type: 'OAUTH_SUCCESS',
        code: code,
        state: state,
        source: source
      }, '*');
      
      // Close popup
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Completing Authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your connection.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback; 