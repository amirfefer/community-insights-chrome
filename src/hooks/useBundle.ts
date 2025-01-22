export const isAnsible = (sections: string[]) => (sections.includes('ansible') && sections.includes('insights') ? 1 : 0);

export function getUrl(type?: string) {
  if (['/'].includes(window.location.pathname)) {
    return 'landing';
  }

  const sections = window.location.pathname.split('/');

  return type === 'bundle' ? sections[1] : sections[2 + isAnsible(sections)];
}

export const bundleMapping: {
  [bundleId: string]: string;
} = {
  insights: 'Fedora',
  edge: 'Edge management',
  landing: 'Home',
  allservices: 'Home',
  quay: 'Quay.io',
};

const useBundle = () => {
  const bundleId = getUrl('bundle');
  return { bundleId, bundleTitle: bundleMapping[bundleId] || bundleId };
};

export default useBundle;
