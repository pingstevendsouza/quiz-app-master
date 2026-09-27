import React, { useState } from 'react';
import styles from './ShareButton.module.css';
import Button from '../Button/Button';
import { IconUpload } from '../../icons';

// Restyled/relocated from the old classic ShareButton. Preserves the exact
// original behavior: native Web Share API when available, otherwise a
// small fallback panel with Facebook/Twitter/LinkedIn share links.
const ShareButton = ({ shareText }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          text: shareText || 'Check out this quiz app — it rocks!',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      setOpen((prev) => !prev);
    }
  };

  const shareUrl = encodeURIComponent(window.location.href);

  return (
    <div className={styles.wrapper}>
      <Button variant="secondary" icon={IconUpload} onClick={handleClick} type="button">
        Share
      </Button>
      {open && !navigator.share && (
        <div className={styles.panel}>
          <a
            className={styles.panelLink}
            href={`https://www.facebook.com/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            className={styles.panelLink}
            href={`https://twitter.com/intent/tweet?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <a
            className={styles.panelLink}
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
