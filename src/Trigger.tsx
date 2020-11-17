import React from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import contains from 'rc-util/lib/Dom/contains';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import Popup from './Popup';
import { getAlignFromPlacement, getPopupClassNameFromAlign } from './utils';
import ITriggerProps from './PropsType';

const IS_REACT_16 = !!(React as any).createPortal;

function noop() {
}

function returnEmptyString() {
  return '';
}

function returnDocument() {
  return window.document;
}

export interface IProptypes {
  visible: boolean;
  onTargetClick: () => void;
  onClose: () => void;
}

export default class Trigger extends React.Component<ITriggerProps & IProptypes, any> {
  static defaultProps = {
    prefixCls: 'rc-trigger-popup',
    getPopupClassNameFromAlign: returnEmptyString,
    getDocument: returnDocument,
    onPopupVisibleChange: noop,
    afterPopupVisibleChange: noop,
    onPopupAlign: noop,
    popupClassName: '',
    popupStyle: {},
    destroyPopupOnHide: false,
    popupAlign: {},
    defaultPopupVisible: false,
    mask: false,
    maskClosable: true,
  };

  touchOutsideHandler: any;
  popupRef: any;
  _component: any;
  _container: any;

  componentDidMount() {
    if (this.props.visible) {
      this.componentDidUpdate();
    }
  }

  componentWillUnmount() {
    if (this.props.visible) {
      if (!IS_REACT_16) {
        this.renderDialog(false);
      }
    }
    this.clearOutsideHandler();
  }

  componentDidUpdate() {
    if (!IS_REACT_16) {
      this.renderDialog(this.props.visible);
    }
    if (this.props.visible) {
      // always hide on mobile
      if (!this.touchOutsideHandler) {
        // add setTimeout for preact
        // prevent in here before setTimeout callback
        this.touchOutsideHandler = setTimeout(() => {
          const currentDocument = this.props.getDocument!();
          this.touchOutsideHandler = addEventListener(currentDocument, 'touchend', this.onDocumentClick);
        });
      }
      return;
    }

    this.clearOutsideHandler();
  }

  clearOutsideHandler() {
    if (this.touchOutsideHandler) {
      if (this.touchOutsideHandler.remove) {
        this.touchOutsideHandler.remove();
      }
      this.touchOutsideHandler = null;
    }
  }

  onDocumentClick = (event) => {
    if (this.props.mask && !this.props.maskClosable) {
      return;
    }
    const target = event.target;
    const root = findDOMNode(this);
    const popupNode = this.getPopupDomNode();
    if (!contains(root, target) && !contains(popupNode, target)) {
      event.preventDefault();
      this.close();
    }
  }

  getPopupDomNode() {
    // for test
    if (this._component && this._component.getPopupDomNode) {
      return this._component.getPopupDomNode();
    }
    return null;
  }

  getPopupAlign = () => {
    const props = this.props;
    const { popupPlacement, popupAlign, builtinPlacements } = props;
    if (popupPlacement && builtinPlacements) {
      return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
    }
    return popupAlign;
  }

  getRootDomNode = () => {
    return findDOMNode(this);
  }

  getPopupClassNameFromAlign = (align) => {
    const className: string[] = [];
    const props = this.props;
    const { popupPlacement, builtinPlacements, prefixCls } = props;
    if (popupPlacement && builtinPlacements) {
      className.push(getPopupClassNameFromAlign(builtinPlacements, prefixCls, align));
    }
    if (props.getPopupClassNameFromAlign) {
      className.push(props.getPopupClassNameFromAlign(align));
    }
    return className.join(' ');
  }

  saveRef(el, visible) {
    this.popupRef = el;
    this._component = el;
    this.props.afterPopupVisibleChange!(visible);
  }

  getComponent(visible) {
    const props = { ...this.props };
    ['visible', 'onAnimateLeave'].forEach(key => {
      if (props.hasOwnProperty(key)) {
        delete props[key];
      }
    });
    return (
      <Popup
        key="popup"
        ref={el => this.saveRef(el, visible)}
        prefixCls={props.prefixCls}
        destroyPopupOnHide={props.destroyPopupOnHide}
        visible={visible}
        className={props.popupClassName}
        align={this.getPopupAlign()}
        onAlign={props.onPopupAlign}
        animation={props.popupAnimation}
        getClassNameFromAlign={this.getPopupClassNameFromAlign}
        getRootDomNode={this.getRootDomNode}
        style={props.popupStyle}
        mask={props.mask}
        zIndex={props.zIndex}
        transitionName={props.popupTransitionName}
        maskAnimation={props.maskAnimation}
        maskTransitionName={props.maskTransitionName}
        onAnimateLeave={this.onAnimateLeave}
      >
        {typeof props.popup === 'function' ? props.popup() : props.popup}
      </Popup>
    );
  }

  close = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  onAnimateLeave = () => {
    if (this.props.destroyPopupOnHide) {
      const container = this._container;
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
        container.parentNode.removeChild(container);
      }
    }
  }

  removeContainer = () => {
    const container = document.querySelector(`#${this.props.prefixCls}-container`);
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      (container as any).parentNode.removeChild(container);
    }
  }

  getContainer() {
    if (!this._container) {
      const props = this.props;
      const popupContainer = document.createElement('div');
      // Make sure default popup container will never cause scrollbar appearing
      // https://github.com/react-component/trigger/issues/41
      popupContainer.style.position = 'absolute';
      popupContainer.style.top = '0';
      popupContainer.style.left = '0';
      popupContainer.style.width = '100%';
      const mountNode = props.getPopupContainer ?
        props.getPopupContainer(findDOMNode(this)) : props.getDocument!().body;
      mountNode.appendChild(popupContainer);
      this._container = popupContainer;
    }
    return this._container;
  }

  renderDialog(visible) {
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      this.getComponent(visible),
      this.getContainer(),
    );
  }

  render() {
    const props = this.props;
    const children = props.children;
    const child = React.Children.only(children);
    const newChildProps: any = {
      onClick: this.props.onTargetClick,
      key: 'trigger',
    };

    const trigger = React.cloneElement(child, newChildProps);

    if (!IS_REACT_16) {
      return trigger;
    }

    let portal;
    // prevent unmounting after it's rendered
    if (props.visible || this._component) {
      portal = (ReactDOM as any).createPortal(
        this.getComponent(props.visible),
        this.getContainer(),
      );
    }

    return [trigger, portal];
  }
}
