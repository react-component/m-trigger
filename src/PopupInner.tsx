import React, { Component } from 'react';
import LazyRenderBox from './LazyRenderBox';

export interface IPopupInnerProps {
  prefixCls?: string;
  style?: any;
  className?: string;
  hiddenClassName?: string;
  visible?: boolean;
}

class PopupInner extends Component<IPopupInnerProps, any> {
  render() {
    const props = this.props;
    let className = props.className;
    if (!props.visible) {
      className += ` ${props.hiddenClassName}`;
    }
    return (
      <div className={className} style={props.style}>
        <LazyRenderBox className={`${props.prefixCls}-content`} visible={props.visible}>
          {props.children}
        </LazyRenderBox>
      </div>
    );
  }
}

export default PopupInner;
