// @ts-expect-error Hero is a JavaScript component without TypeScript declarations.
import Hero from '../components/Hero';
// @ts-expect-error HowItWorks is a JavaScript component without TypeScript declarations.
import HowItWorks from '../components/HowItWorks';
import HotListings from '../components/HotListings';

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <HotListings />
    </>
  );
}