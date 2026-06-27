'use client';

import { useEffect } from 'react';
import { Languages } from 'lucide-react';

export default function GoogleTranslate() {
  useEffect(() => {
    // Add Google Translate Script if it doesn't exist
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      // Define the callback function globally
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
      <Languages size={20} className="text-white" />
      <div id="google_translate_element" className="translate-widget-container overflow-hidden rounded-lg"></div>
    </div>
  );
}
