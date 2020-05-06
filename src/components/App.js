import React, { Component } from 'react';
import HelloTs from './HelloTs';
import styles from './App.less';

export default class App extends Component {
  state = {
    title: 'Webpack React Startup',
  };

  render() {
    return (
      <div>
        <div className={styles['logo']} />
        <p>{this.state.title}</p>
        <p>
          <button onClick={this.btnClick}>点击我</button>
        </p>
        <HelloTs text="TypeScript" />
      </div>
    );
  }

  btnClick = (e) => {
    alert(e.target.innerText);
  };
}
