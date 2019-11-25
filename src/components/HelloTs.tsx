import React from 'react';
import styles from './HelloTs.less';

export interface HelloTsProps {
  text: string;
}

function HelloTs(props: HelloTsProps) {
  return (
    <div className={styles['helloTs']}>
      <span>{props.text}</span>
    </div>
  );
}

export default HelloTs;
