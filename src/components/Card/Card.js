import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './Card.module.css';

const Card = ({ children, className, ...rest }) => (
  <div className={classNames(styles.card, className)} {...rest}>
    {children}
  </div>
);

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Card;
