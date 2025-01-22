/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { memo, useContext, useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Divider } from '@patternfly/react-core/dist/dynamic/components/Divider';
import { DropdownItem } from '@patternfly/react-core/dist/dynamic/components/Dropdown';
import { Switch } from '@patternfly/react-core/dist/dynamic/components/Switch';
import { ToolbarItem } from '@patternfly/react-core/dist/dynamic/components/Toolbar';
import { Tooltip } from '@patternfly/react-core/dist/dynamic/components/Tooltip';
import QuestionCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/question-circle-icon';

import UserToggle from './UserToggle';
import ToolbarToggle from './ToolbarToggle';

import { ITLess } from '../../utils/common';
import { useIntl } from 'react-intl';
import messages from '../../locales/Messages';
import { createSupportCase } from '../../utils/createCase';
import ChromeAuthContext from '../../auth/ChromeAuthContext';
import { isPreviewAtom, togglePreviewWithCheckAtom } from '../../state/atoms/releaseAtom';
import useSupportCaseData from '../../hooks/useSupportCaseData';

const isITLessEnv = ITLess();

const Tools = () => {
  const [{ isRhosakEntitled }, setState] = useState({
    isInternal: true,
    isRhosakEntitled: false,
    isDemoAcc: false,
  });
  const isPreview = useAtomValue(isPreviewAtom);
  const togglePreviewWithCheck = useSetAtom(togglePreviewWithCheckAtom);
  const { user, token } = useContext(ChromeAuthContext);
  const intl = useIntl();

  const betaSwitcherTitle = `${isPreview ? intl.formatMessage(messages.stopUsing) : intl.formatMessage(messages.use)} ${intl.formatMessage(
    messages.betaRelease
  )}`;

  useEffect(() => {
    if (user) {
      setState({
        isInternal: !!user?.identity?.user?.is_internal,
        isRhosakEntitled: !!user?.entitlements?.rhosak?.is_entitled,
        isDemoAcc: user?.identity?.user?.username === 'insights-demo-2021',
      });
    }
  }, [user]);
  const supportCaseData = useSupportCaseData();

  const supportOptionsUrl = () => {
    return isITLessEnv ? 'https://redhatgov.servicenowservices.com/css' : 'https://access.redhat.com/support';
  };

  /* list out the items for the about menu */
  const aboutMenuDropdownItems = [
    {
      title: intl.formatMessage(messages.apiDocumentation),
      onClick: () => window.open('https://developers.redhat.com/api-catalog/', '_blank'),
      isHidden: isITLessEnv,
    },
    {
      title: intl.formatMessage(messages.openSupportCase),
      onClick: () => createSupportCase(user.identity, token, isPreview, { supportCaseData }),
      isDisabled: window.location.href.includes('/application-services') && !isRhosakEntitled,
      isHidden: isITLessEnv,
    },
    {
      title: intl.formatMessage(messages.statusPage),
      onClick: () => window.open('https://status.redhat.com/', '_blank'),
      isHidden: isITLessEnv,
    },
    {
      title: intl.formatMessage(messages.supportOptions),
      onClick: () => (window.location.href = supportOptionsUrl()),
    },
  ];

  /* Combine aboutMenuItems with a settings link on mobile */
  const mobileDropdownItems = [
    { title: 'separator' },
    {
      title: betaSwitcherTitle,
      onClick: () => togglePreviewWithCheck(),
    },
    { title: 'separator' },
    ...aboutMenuDropdownItems,
  ];

  /* QuestionMark icon that should be used for "help/support" things */
  const AboutButton = () => (
    <Tooltip aria="none" aria-live="polite" content={'Help'} flipBehavior={['bottom']} className="tooltip-inner-help-cy">
      <ToolbarToggle
        key="Help menu"
        icon={QuestionCircleIcon}
        id="HelpMenu"
        ouiaId="chrome-help"
        ariaLabel="Help menu"
        hasToggleIndicator={null}
        dropdownItems={aboutMenuDropdownItems}
        className="tooltip-button-help-cy"
      />
    </Tooltip>
  );

  const ThemeToggle = () => {
    const [darkmode, setDarkmode] = useState(false);
    return (
      <Switch
        id="no-label-switch-on"
        isChecked={darkmode || false}
        aria-label="Dark mode switch"
        onChange={() => {
          setDarkmode(!darkmode);
          document.body.classList.contains('pf-theme-dark')
            ? document.body.classList.remove('pf-theme-dark')
            : document.body.classList.add('pf-theme-dark');
        }}
      />
    );
  };

  return (
    <>
      {localStorage.getItem('chrome:darkmode') === 'true' && (
        <ToolbarItem>
          <ThemeToggle />
        </ToolbarItem>
      )}
      <ToolbarItem className="pf-v5-u-mr-0" visibility={{ default: 'hidden', md: 'visible' }}>
        <AboutButton />
      </ToolbarItem>
      <ToolbarItem className="pf-v5-u-mr-0" visibility={{ default: 'hidden', lg: 'visible' }}>
        <UserToggle />
      </ToolbarItem>
      {/* Collapse tools and user dropdown to kebab on small screens  */}

      <ToolbarItem visibility={{ lg: 'hidden' }}>
        <Tooltip aria="none" aria-live="polite" content={'More options'} flipBehavior={['bottom']}>
          <UserToggle
            isSmall
            extraItems={mobileDropdownItems.map((action, key) => (
              <React.Fragment key={key}>
                {action.title === 'separator' ? (
                  <Divider component="li" />
                ) : (
                  <DropdownItem
                    {...(action.onClick && {
                      component: 'button',
                      onClick: action.onClick,
                    })}
                  >
                    {action.title}
                  </DropdownItem>
                )}
              </React.Fragment>
            ))}
          />
        </Tooltip>
      </ToolbarItem>
    </>
  );
};

export default memo(Tools);
