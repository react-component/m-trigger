/* eslint no-console:0 */
/* tslint:disable:no-console */

import React from 'react';
import ReactDOM from 'react-dom';
import Trigger from '../src/index';
import 'rmc-trigger/assets/index.less';

function getPopupAlign(state) {
  return {
    offset: [state.offsetX, state.offsetY],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  };
}

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

function preventDefault(e) {
  e.preventDefault();
}

function getPopupContainer(trigger) {
  return trigger.parentNode;
}

class Test extends React.Component<any, any> {
  state = {
    mask: false,
    maskClosable: false,
    placement: 'right',
    trigger: {
      click: 1,
    },
    offsetX: undefined,
    offsetY: undefined,
    destroyed: false,
    transitionName: '',
    destroyPopupOnHide: false,
  };

  onPlacementChange = (e) => {
    this.setState({
      placement: e.target.value,
    });
  }

  onTransitionChange = (e) => {
    this.setState({
      transitionName: e.target.checked ? e.target.value : '',
    });
  }

  onOffsetXChange = (e) => {
    const targetValue = e.target.value;
    this.setState({
      offsetX: targetValue || undefined,
    });
  }

  onOffsetYChange = (e) => {
    const targetValue = e.target.value;
    this.setState({
      offsetY: targetValue || undefined,
    });
  }

  onVisibleChange = (visible) => {
    console.log('tooltip', visible);
  }

  onMask = (e) => {
    this.setState({
      mask: e.target.checked,
    });
  }

  onMaskClosable = (e) => {
    this.setState({
      maskClosable: e.target.checked,
    });
  }

  destroy = () => {
    this.setState({
      destroyed: true,
    });
  }

  destroyPopupOnHide = (e) => {
    this.setState({
      destroyPopupOnHide: e.target.checked,
    });
  }

  render() {
    const state = this.state;
    if (state.destroyed) {
      return null;
    }
    return (<div >
      <div style={{ margin: '10px 20px' }}>
        <label>
          placement:
          <select value={state.placement} onChange={this.onPlacementChange}>
            <option>right</option>
            <option>left</option>
            <option>top</option>
            <option>bottom</option>
            <option>topLeft</option>
            <option>topRight</option>
            <option>bottomRight</option>
            <option>bottomLeft</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            value="rc-trigger-popup-zoom"
            type="checkbox"
            onChange={this.onTransitionChange}
            checked={state.transitionName === 'rc-trigger-popup-zoom'}
          />
          transitionName
        </label>

        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!this.state.destroyPopupOnHide}
            type="checkbox"
            onChange={this.destroyPopupOnHide}
          />
          destroyPopupOnHide
        </label>

        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!this.state.mask}
            type="checkbox"
            onChange={this.onMask}
          />
          mask
        </label>

        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!this.state.maskClosable}
            type="checkbox"
            onChange={this.onMaskClosable}
          />
          maskClosable
        </label>

        <br />
        <label>
          offsetX:
          <input
            type="text"
            onChange={this.onOffsetXChange}
            style={{ width: 50 }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          offsetY:
          <input
            type="text"
            onChange={this.onOffsetYChange}
            style={{ width: 50 }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.destroy}>destroy</button>
      </div>
      <div style={{ margin: 100, position: 'relative' }}>
        <Trigger
          getPopupContainer={undefined && getPopupContainer}
          popupAlign={getPopupAlign(state)}
          popupPlacement={state.placement}
          destroyPopupOnHide={this.state.destroyPopupOnHide}
          // zIndex={40}
          mask={this.state.mask}
          maskClosable={this.state.maskClosable}
          // maskAnimation="fade"
          builtinPlacements={builtinPlacements}
          popup={
            <div style={{ border: '1px solid red', padding: 10, background: 'white' }}>
              i am a popup
            </div>
          }
          popupTransitionName={state.transitionName}
        >
          <a href="#" style={{ margin: 20 }} onClick={preventDefault}>trigger</a>
        </Trigger>
      </div>
    </div>);
  }
}

ReactDOM.render(<Test />, document.getElementById('__react-content'));
