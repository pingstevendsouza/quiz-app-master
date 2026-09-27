import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './Select.module.css';
import { IconChevronDown, IconCheck, IconX } from '../../icons';

// Native <select> popups can't be restyled — the moment they open, the OS/
// browser takes over with its own chrome, breaking any custom design
// language. This renders a fully custom trigger + searchable listbox
// instead, so the open state matches the app's own visual language, not
// the OS's, and long option lists (exam providers, etc.) are filterable
// by typing instead of only scrolling.
const Select = ({ id, value, onChange, options, disabled = false, className }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const triggerButtonRef = useRef(null);
  const optionRefs = useRef([]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions =
    query.trim() === ''
      ? options
      : options.filter((opt) => String(opt.text).toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      const selectedIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      // Trigger swaps from a <button> to a <input> when opening — focus it
      // on the next tick, once the input has actually mounted.
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      triggerButtonRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    // Query changed (or panel just opened) — the previous highlighted index
    // may no longer exist in the filtered list, so keep it in range.
    setHighlightedIndex((i) => Math.min(Math.max(i, 0), Math.max(filteredOptions.length - 1, 0)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (open && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlightedIndex]);

  const selectAt = (index) => {
    const opt = filteredOptions[index];
    if (opt) onChange(opt.value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectAt(highlightedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={classNames(styles.container, className)} ref={containerRef}>
      {open ? (
        <div className={classNames(styles.trigger, styles.triggerOpen)}>
          <input
            ref={inputRef}
            id={id}
            type="text"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedOption ? String(selectedOption.text) : 'Search…'}
            disabled={disabled}
            role="combobox"
            aria-haspopup="listbox"
            aria-controls={`${id}-listbox`}
            aria-expanded="true"
            aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <IconX size={16} />
            </button>
          )}
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setOpen(false)}
            aria-label="Close options"
          >
            <IconChevronDown size={18} className={styles.chevronUp} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          id={id}
          ref={triggerButtonRef}
          className={styles.trigger}
          onClick={() => !disabled && setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
          aria-expanded="false"
        >
          <span className={styles.triggerText}>{selectedOption ? selectedOption.text : ''}</span>
          <IconChevronDown size={18} className={styles.chevron} />
        </button>
      )}

      {open && (
        <ul className={styles.panel} role="listbox" id={`${id}-listbox`} aria-labelledby={id}>
          {filteredOptions.length === 0 && <li className={styles.emptyState}>No matches</li>}
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.key ?? opt.value}
              id={`${id}-option-${index}`}
              ref={(el) => (optionRefs.current[index] = el)}
              role="option"
              aria-selected={opt.value === value}
              className={classNames(styles.option, {
                [styles.optionHighlighted]: index === highlightedIndex,
              })}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectAt(index)}
            >
              <span>{opt.text}</span>
              {opt.value === value && <IconCheck size={16} className={styles.checkIcon} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

Select.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Select;
