import { categories } from '@/data/categories';
import { features } from '@/data/features';
import EcosystemMapClient from './EcosystemMapClient';

export default function EcosystemMap() {
  return <EcosystemMapClient categories={categories} features={features} />;
}