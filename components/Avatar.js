import React from 'react';
import PropTypes from 'prop-types';
import themeGet from '@styled-system/theme-get';
import styled from 'styled-components';
import { border, color, layout, space } from 'styled-system';

import { CollectiveType, defaultImage } from '../lib/constants/collectives';
import { getAvatarBorderRadius, getCollectiveImage } from '../lib/image-utils';

import { Flex } from './Grid';

const getInitials = name => name.split(' ').reduce((result, value) => (result += value.slice(0, 1).toUpperCase()), '');

const StyledAvatar = styled(Flex).attrs(props => ({
  style: { backgroundImage: props.src ? `url(${props.src})` : null },
}))`
  align-items: center;
  background-color: ${({ theme, type }) => (type === 'USER' ? themeGet('colors.black.100')({ theme }) : 'none')};
  ${color}
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: ${({ type }) => getAvatarBorderRadius(type)};
  ${border}
  color: ${themeGet('colors.black.400')};
  font-weight: bold;
  justify-content: center;
  overflow: hidden;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  ${space}
  ${layout}
`;

const Avatar = ({ collective, src, type = 'USER', radius, name, ...styleProps }) => {
  // Use collective object instead of props
  if (collective) {
    type = collective.type;
    name = collective.name;
    if (collective.isIncognito) {
      src = defaultImage['ANONYMOUS'];
    } else {
      src = getCollectiveImage(collective);
    }
  }
  return (
    <StyledAvatar size={radius} type={type} src={src} {...styleProps}>
      {!src && type === 'USER' && name && <span>{getInitials(name)}</span>}
    </StyledAvatar>
  );
};

Avatar.propTypes = {
  /** Collective object */
  collective: PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
    image: PropTypes.string,
    isIncognito: PropTypes.bool,
  }),
  /** Collective name */
  name: PropTypes.string,
  /** Collective image url */
  src: PropTypes.string,
  /** Collective type */
  type: PropTypes.oneOf(['USER', 'COLLECTIVE', 'FUND', 'ORGANIZATION', 'CHAPTER', 'ANONYMOUS']),
  /** Avatar size */
  radius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Duration to transition size. Disabled if 0, null or undefined */
  animationDuration: PropTypes.number,
};

/**
 * Similar to `Avatar`, but builds from a Contributor instead of a collective
 */
export const ContributorAvatar = ({ contributor, radius, ...styleProps }) => {
  const image = contributor.isIncognito
    ? defaultImage['ANONYMOUS']
    : getCollectiveImage({ slug: contributor.collectiveSlug, imageUrl: contributor.image });

  return <StyledAvatar size={radius} type={contributor.type} src={image} title={contributor.name} {...styleProps} />;
};

ContributorAvatar.propTypes = {
  /** Collective object */
  contributor: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.string,
    collectiveSlug: PropTypes.string,
    isIncognito: PropTypes.bool,
    type: PropTypes.oneOf(['USER', 'COLLECTIVE', 'FUND', 'ORGANIZATION', 'CHAPTER', 'ANONYMOUS']),
  }).isRequired,
  radius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

/** A simple avatar for incognito users */
export const IncognitoAvatar = avatarProps => {
  return <StyledAvatar {...avatarProps} type={CollectiveType.USER} src={defaultImage.ANONYMOUS} />;
};

/** @component */
export default Avatar;
