import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './Toggle.module.css';

const Toggle = ({ id, checked, onChange, label, description, disabled = false }) => (
  <div className={styles.row}>
    <div className={styles.textGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {description && <div className={styles.description}>{description}</div>}
    </div>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      className={classNames(styles.switch, { [styles.switchOn]: checked })}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    />
  </div>
);

Toggle.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Toggle;
