import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter, Space_Grotesk } from 'next/font/google';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';

// Font setup
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Cosmic Journey | Explore the Universe</title>
        <meta name="description" content="Embark on an endless scrolling, fully interactive journey through the universe." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        {loading ? (
          <div className="cosmic-loader" />
        ) : (
          <Component {...pageProps} />
        )}
      </div>
    </React.Fragment>
  );
} 