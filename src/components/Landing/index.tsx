import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateHeader,
  EmptyStateFooter,
  EmptyStateIcon,
  Bullseye,
} from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';

const LandingPage: React.FunctionComponent = () => (
  <Bullseye>
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader titleText="Fedora Open Services" headingLevel="h4" icon={<EmptyStateIcon icon={CubesIcon} />} />
      <EmptyStateBody>
        Welcome to Fedora Open Services, a full open source platform designed to empower you with innovative tools and services. Start by creating custom
        Fedora and CentOS images using our Image Builder service, tailored to your unique needs. And this is just the beginning—more services are on
        the horizon to enhance your experience and expand your possibilities.
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="primary">Image builder</Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  </Bullseye>
);

export default LandingPage;
