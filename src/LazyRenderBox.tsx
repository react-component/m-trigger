import React, { Component } from 'react';

export interface ILazyRenderBoxProps {
  style?: any;
  className?: string;
  hiddenClassName?: string;
  visible?: boolean;
}

class LazyRenderBox extends Component<ILazyRenderBoxProps, any> {
  shouldComponentUpdate(nextProps) {
    return nextProps.hiddenClassName || nextProps.visible;
  }
  render() {
    const { hiddenClassName, visible, ...props } = this.props;

    if (hiddenClassName || React.Children.count(props.children) > 1) {
      if (!visible && hiddenClassName) {
        props.className! += ` ${hiddenClassName}`;
      }
      return <div {...props}/>;
    }

    return React.Children.only(props.children);
  }
}

export default LazyRenderBox;
