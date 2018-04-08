import React, { Component } from 'react'

const logo = require('@static/img/logo.svg')

export default class App extends Component {
  render() {
    return (
      <div>
        <img src={logo} width="150" height="150" />
        <p>Webpack React Startup</p>
      </div>
    )
  }
}