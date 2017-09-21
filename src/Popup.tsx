import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Align from 'rmc-align';
import Animate from 'rc-animate';
import PopupInner from './PopupInner';
import LazyRenderBox from './LazyRenderBox';
import { saveRef } from './utils';

export interface IPopupProps {
  visible?: boolean;
  style?: any;
  getClassNameFromAlign?: Function;
  onAlign?: Function;
  getRootDomNode?: Function;
  align?: any;
  destroyPopupOnHide?: boolean;
  className?: string;
  prefixCls?: string;
  maskTransitionName?: string | {};
  maskAnimation?: string;
  transitionName?: string | {};
  animation?: string;
  zIndex?: number;
  mask?: boolean;
  onAnimateLeave?: Function;
}

class Popup extends Component<IPopupProps, any> {
  savePopupRef: any;
  saveAlignRef: any;
  currentAlignClassName: string | null;
  rootNode: any;
  popupInstance: any;

  constructor(props) {
    super(props);

    this.savePopupRef = saveRef.bind(this, 'popupInstance');
    this.saveAlignRef = saveRef.bind(this, 'alignInstance');
  }

  componentDidMount() {
    this.rootNode = this.getPopupDomNode();
  }

  onAlign = (popupDomNode, align) => {
    const props = this.props;
    const currentAlignClassName = props.getClassNameFromAlign!(align);
    // FIX: https://github.com/react-component/trigger/issues/56
    // FIX: https://github.com/react-component/tooltip/issues/79
    if (this.currentAlignClassName !== currentAlignClassName) {
      this.currentAlignClassName = currentAlignClassName;
      popupDomNode.className = this.getClassName(currentAlignClassName);
    }
    props.onAlign!(popupDomNode, align);
  }

  getPopupDomNode() {
    return ReactDOM.findDOMNode(this.popupInstance);
  }

  getTarget = () => {
    return this.props.getRootDomNode!();
  }

  getMaskTransitionName() {
    const props = this.props;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getTransitionName() {
    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  }

  getClassName(currentAlignClassName) {
    return `${this.props.prefixCls} ${this.props.className} ${currentAlignClassName}`;
  }

  getPopupElement() {
    const { savePopupRef, props } = this;
    const { align, style, visible, prefixCls, destroyPopupOnHide } = props;
    const className = this.getClassName(
      this.currentAlignClassName || props.getClassNameFromAlign!(align),
    );
    const hiddenClassName = `${prefixCls}-hidden`;
    if (!visible) {
      this.currentAlignClassName = null;
    }
    const newStyle = { ...style, ...this.getZIndexStyle() };
    const popupInnerProps = {
      className,
      prefixCls,
      ref: savePopupRef,
      style: newStyle,
    };
    if (destroyPopupOnHide) {
      return (<Animate
        component=""
        exclusive
        transitionAppear
        onAnimateLeave={props.onAnimateLeave}
        transitionName={this.getTransitionName()}
      >
        {visible ? (<Align
          target={this.getTarget}
          key="popup"
          ref={this.saveAlignRef}
          monitorWindowResize
          align={align}
          onAlign={this.onAlign}
        >
          <PopupInner
            visible
            {...popupInnerProps}
          >
            {props.children}
          </PopupInner>
        </Align>) : null}
      </Animate>);
    }

    const alignOtherProps = {
      xVisible: visible,
    };

    return (<Animate
      component=""
      exclusive
      transitionAppear
      transitionName={this.getTransitionName()}
      onAnimateLeave={props.onAnimateLeave}
      showProp="xVisible"
    >
      <Align
        target={this.getTarget}
        key="popup"
        ref={this.saveAlignRef}
        monitorWindowResize
        {...alignOtherProps}
        childrenProps={{ visible: 'xVisible' }}
        disabled={!visible}
        align={align}
        onAlign={this.onAlign}
      >
        <PopupInner
          hiddenClassName={hiddenClassName}
          {...popupInnerProps}
        >
          {props.children}
        </PopupInner>
      </Align>
    </Animate>);
  }

  getZIndexStyle() {
    const style: any = {};
    const props = this.props;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  }

  getMaskElement() {
    const props = this.props;
    let maskElement;
    if (props.mask) {
      const maskTransition = this.getMaskTransitionName();
      maskElement = (
        <LazyRenderBox
          style={this.getZIndexStyle()}
          key="mask"
          className={`${props.prefixCls}-mask`}
          hiddenClassName={`${props.prefixCls}-mask-hidden`}
          visible={props.visible}
        />
      );
      if (maskTransition) {
        maskElement = (
          <Animate
            key="mask"
            showProp="visible"
            transitionAppear
            component=""
            transitionName={maskTransition}
          >
            {maskElement}
          </Animate>
        );
      }
    }
    return maskElement;
  }

  render() {
    return (
      <div>
        {this.getMaskElement()}
        {this.getPopupElement()}
      </div>
    );
  }
}

export default Popup;
