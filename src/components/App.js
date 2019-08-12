import React, { Component } from 'react'
import HelloTs from './HelloTs'

function bind(target, key, descriptor) {
  let fn = descriptor.value;
  let definingProperty = false;

  return {
    configurable: true,
    get() {
      if (definingProperty || this === target.prototype || this.hasOwnProperty(key) || typeof fn !== 'function') {
        return fn;
      }

      let boundFn = fn.bind(this);
      definingProperty = true;
      Object.defineProperty(this, key, {
        configurable: true,
        get() {
          return boundFn;
        },
        set(value) {
          fn = value;
          delete this[key];
        }
      });
      definingProperty = false;
      return boundFn;
    },
    set(value) {
      fn = value;
    }
  };
}

export default class App extends Component {
  state = {
    title: 'Webpack React Startup'
  };

  render() {
    return (
      <div>
        <div className="logo"></div>
        <p>{this.state.title}</p>
        <p>
          <button onClick={this.btnClick}>点击我</button>
        </p>
        <HelloTs text="TypeScript" />
      </div>
    )
  }

  @bind
  btnClick = (e) => {
    alert(e.target.innerText);
  }
}