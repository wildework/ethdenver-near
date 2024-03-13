import {css, cx} from '@emotion/css';

const styles = {
  button: css({
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40px',
    margin: '0',
    padding: '0 16px',
    border: 'none',
    borderRadius: '10px',
    background: 'transparent',
    color: 'var(--color-grayscale-350)',
    fontFamily: `'Inter', sans-serif`,
    fontSize: '14px',
    lineHeight: '20px',
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      backgroundColor: 'var(--color-grayscale-100)',
    },
  }),
  isPrimary: css({
    color: 'var(--color-grayscale-100)',
    backgroundColor: 'var(--color-grayscale-350)',
    '&:hover': {
      backgroundColor: 'var(--color-grayscale-350)',
    }
  }),
  isSecondary: css({
    backgroundColor: 'var(--color-grayscale-100)',
    '&:hover': {
      backgroundColor: 'var(--color-grayscale-200)',
    }
  }),
  isDisabled: css({
    opacity: '0.4',
    cursor: 'default',
  }),
  isCode: css({
    fontFamily: `'DM Mono', monospace`,
    fontSize: '14px',
  }),
};

function Button(props) {
  return (
    <button
      className={cx({
        [styles.button]: true,
        [styles.isPrimary]: props.isPrimary || props.type === 'primary',
        [styles.isSecondary]: props.isSecondary || props.type === 'secondary',
        [styles.isDisabled]: props.isDisabled ||  props.type === 'disabled',
        [styles.isCode]: props.isCode
      })}
      children={props.title}
      onClick={props.onClick}
    />
  );
}

export {Button};