import {useRef, useEffect} from 'react';
import {css, cx} from '@emotion/css';

import {Widget} from './components/Widget.jsx';

const styles = {
  console: css({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),
  logsContainer: css({
    flex: '1',
    padding: '24px',
    overflow: 'auto',
  }),
  logs: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontFamily: 'monospace',
  }),
  log: css({
    display: 'flex',
  }),
  isIcon: css({
    flex: '0 0 20px',
    height: '20px',
    color: 'var(--color-grayscale-300)',
  }),
  isCall: css({
    color: 'var(--color-accent)',
  }),
  isResult: css({
    color: 'var(--color-grayscale-350)',
  }),
  isNote: css({
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    color: 'var(--color-grayscale-300)',
  }),
  isDull: css({
    color: '#7f8c8d',
  }),
};

function Console(props) {
  const consoleRef = useRef();
  const logsRef = useRef();

  useEffect(() => {
    if (consoleRef.current && logsRef.current) {
      consoleRef.current.scroll({
        top: logsRef.current.getBoundingClientRect().height,
        behavior: 'smooth',
      });
    }
  }, [props.logs, logsRef.current, consoleRef.current]);

  return (
    <Widget
      title="Console"
      style={{flex: '1'}}
    >
      <div ref={consoleRef} className={cx(styles.logsContainer)}>
        {(!props.logs || props.logs.length === 0) &&
          <div className={cx(styles.isDull)}>
            Logs will appear once you start interacting with the contract.
          </div>
        }
        <div ref={logsRef} className={cx(styles.logs)}>
          {props.logs.map((log, index) => {
            let icon = null;
            switch (log.type) {
              case 'call': {
                icon = '>';
                break;
              }
              case 'result': {
                icon = '<';
                break;
              }
            }

            return (
              <div
                key={index}
                className={cx({
                  [styles.log]: true,
                  [styles.isCall]: log.type === 'call',
                  [styles.isResult]: log.type === 'result',
                  [styles.isNote]: log.type === 'note',
                })}
              >
                <div
                  className={cx(styles.isIcon)}
                  children={icon}
                />
                <div>
                  {log.message}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Widget>
  );
}

export {Console};