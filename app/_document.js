import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fix for Next.js 15.3.2 CSS loading as script bug */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove any CSS files that are incorrectly loaded as scripts
              (function() {
                function removeCSSScripts() {
                  const scripts = document.querySelectorAll('script[src*=".css"]');
                  scripts.forEach(script => {
                    console.warn('Removing CSS file incorrectly loaded as script:', script.src);
                    script.remove();
                  });
                }
                
                // Run immediately and on DOM ready
                removeCSSScripts();
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeCSSScripts);
                }
                
                // Also run after a short delay to catch dynamically added scripts
                setTimeout(removeCSSScripts, 100);
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
