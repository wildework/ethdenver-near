import {css, cx} from '@emotion/css';

import {Button} from './Button.jsx';

import {brand} from '../utilities/colors/brand.js';

const styles = {
  veil: css({
    zIndex: '10',
    position: 'fixed',
    top: '0',
    left: '0',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '64px',
    backgroundColor: brand.grayscale.dark['veil'],
  }),
  container: css({
    boxSizing: 'border-box',
    width: '600px',
    maxWidth: '100%',
    borderRadius: '24px',
    backgroundColor: 'var(--color-grayscale-050)',
    color: 'var(--color-grayscale-350)',
    opacity: '1',
    overflow: 'auto',
  }),
  modal: css({
    
  }),
  header: css({
    boxSizing: 'border-box',
    padding: '16px',
    textAlign: 'center',
  }),
  body: css({
    boxSizing: 'border-box',
    padding: '16px',
  }),
  footer: css({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: '8px',
    width: '100%',
    padding: '16px',
  }),
  param: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),
  input: css({
    boxSizing: 'border-box',
    width: '100%',
    padding: '8px',
    border: '1px solid var(--color-grayscale-100)',
    borderRadius: '10px',
    backgroundColor: 'var(--color-grayscale-100)',
    color: 'var(--color-grayscale-350)',
    outline: 'none',
  }),
};

function Modal(props) {
  return (
    <div className={cx(styles.veil)}>
      <div className={cx(styles.container)}>
        <div className={cx(styles.modal)}>
          <div className={cx(styles.header)}>
            {props.name}
          </div>
          <div className={cx(styles.body)}>
            {props.params.args.map((input, index) => {
              return (
                <div key={index} className={cx(styles.param)}>
                  <div>{input.name}</div>
                  <input
                    className={cx(styles.input)}
                    type="text"
                    placeholder="..."
                    value={props.inputs[input.name] ?? ''}
                    onChange={(event) => props.onChange(input.name, event.target.value)}
                  />
                </div>
              );
            })}
          </div>
          <div className={cx(styles.footer)}>
            <Button
              title="Cancel"
              isSecondary
              onClick={props.onClose}
            />
            <Button
              title="Call"
              isPrimary
              onClick={props.onCall}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export {Modal};