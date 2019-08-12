import React from 'react'

export interface HelloTsProps {
  text: string
};

function HelloTs(props: HelloTsProps) {
  return (
    <div className={'helloTs'}>
      <span>{props.text}</span>
    </div>
  )
}

export default HelloTs;