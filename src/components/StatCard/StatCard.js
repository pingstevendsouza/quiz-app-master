import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatCard.module.css';

// Simplest approach per spec: accept bg/fg directly, falling back to a
// light tint derived from accentColor when only accentColor is given.
const hexToRgba = (hex, alpha) => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const StatCard = ({ label, value, icon: Icon, accentColor, bg, fg }) => {
  const iconFg = fg || accentColor || 'var(--color-primary)';
  const iconBg = bg || (accentColor ? hexToRgba(accentColor, 0.12) : 'var(--color-primary-light)');

  return (
    <div className={styles.statCard}>
      <div className={styles.icon} style={{ background: iconBg, color: iconFg }}>
        {Icon && <Icon size={22} color={iconFg} />}
      </div>
      <div>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  icon: PropTypes.elementType,
  accentColor: PropTypes.string,
  bg: PropTypes.string,
  fg: PropTypes.string,
};

export default StatCard;
