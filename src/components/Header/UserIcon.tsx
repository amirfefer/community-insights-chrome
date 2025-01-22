import React, { useContext, useEffect, useState } from 'react';
import { Avatar } from '@patternfly/react-core/dist/dynamic/components/Avatar';

import ImgAvatar from '../../../static/images/img_avatar.svg';
import ChromeAuthContext from '../../auth/ChromeAuthContext';

const UserIcon = () => {
  return <Avatar  alt="User Avatar" />;
};

export default UserIcon;
