import Header from '@/components/Header';
import RailNav from '@/components/RailNav';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import EcosystemMap from '@/components/EcosystemMap';
import FeaturesSection from '@/components/FeaturesSection';
import { FlowProvider } from '@/components/FlowContext';
import FlowSection from '@/components/FlowSection';
import ResultsSection from '@/components/ResultsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import FeatureDialog from '@/components/FeatureDialog';
import ScrollFx from '@/components/ScrollFx';
import Toast from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <Header />
      <RailNav />
      <main>
        <Hero />
        <StatsBar />
        <EcosystemMap />
        <FeaturesSection />
        <FlowProvider>
          <FlowSection />
          <ResultsSection />
        </FlowProvider>
        <CTASection />
      </main>
      <Footer />
      <FeatureDialog />
      <ScrollFx />
      <Toast />
    </ErrorBoundary>
  );
}
