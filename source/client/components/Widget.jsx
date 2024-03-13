import {css, cx} from '@emotion/css';

const styles = {
  widget: css({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    backgroundColor: 'var(--color-grayscale-025)',
    color: 'var(--color-grayscale-350)',
  }),
  title: css({
    flex: '0 0 60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0 16px',
    color: 'var(--color-grayscale-350)',
  }),
};

function Widget(props) {
  return (
    <div className={cx(styles.widget)} style={props.style}>
      <div className={cx(styles.title)}>
        {props.title}
      </div>
      {props.children}
    </div>
  );
}

export {Widget};