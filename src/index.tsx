import React from 'react';
import { findDOMNode } from 'react-dom';
import createReactClass from 'create-react-class';
import contains from 'rc-util/lib/Dom/contains';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import Popup from './Popup';
import { getAlignFromPlacement, getPopupClassNameFromAlign } from './utils';
import getContainerRenderMixin from 'rc-util/lib/getContainerRenderMixin';

function noop() {
}

function returnEmptyString() {
  return '';
}

function returnDocument() {
  return window.document;
}

export interface ITriggerProps {
  prefixCls?: string;
  showAction?: any;
  hideAction?: any;
  getPopupClassNameFromAlign?: any;
  onPopupVisibleChange?: Function;
  afterPopupVisibleChange?: Function;
  popup: React.ReactNode | Function;
  popupStyle?: any;
  popupClassName?: string;
  popupPlacement?: string;
  builtinPlacements?: any;
  popupTransitionName?: string | {};
  popupAnimation?: any;
  zIndex?: number;
  getPopupContainer?: Function;
  getDocument?: Function;
  destroyPopupOnHide?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  onPopupAlign?: Function;
  popupAlign?: any;
  popupVisible?: boolean;
  maskTransitionName?: string | {};
  maskAnimation?: string;
}

const Trigger = createReactClass<ITriggerProps, any>({
  displayName: 'Trigger',

  mixins: [
    getContainerRenderMixin({
      autoMount: false,

      isVisible(instance) {
        return instance.state.popupVisible;
      },

      getContainer(instance) {
        const { props } = instance;
        const popupContainer = document.createElement('div');
        // Make sure default popup container will never cause scrollbar appearing
        // https://github.com/react-component/trigger/issues/41
        popupContainer.style.position = 'absolute';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';
        const mountNode = props.getPopupContainer ?
          props.getPopupContainer(findDOMNode(instance)) : props.getDocument().body;
        mountNode.appendChild(popupContainer);
        return popupContainer;
      },
    }),
  ],

  getDefaultProps() {
    return {
      prefixCls: 'rc-trigger-popup',
      getPopupClassNameFromAlign: returnEmptyString,
      getDocument: returnDocument,
      onPopupVisibleChange: noop,
      afterPopupVisibleChange: noop,
      onPopupAlign: noop,
      popupClassName: '',
      mouseEnterDelay: 0,
      mouseLeaveDelay: 0.1,
      focusDelay: 0,
      blurDelay: 0.15,
      popupStyle: {},
      destroyPopupOnHide: false,
      popupAlign: {},
      defaultPopupVisible: false,
      mask: false,
      maskClosable: true,
      action: [],
      showAction: [],
      hideAction: [],
    };
  },

  getInitialState() {
    const props = this.props;
    let popupVisible;
    if ('popupVisible' in props) {
      popupVisible = !!props.popupVisible;
    } else {
      popupVisible = !!props.defaultPopupVisible;
    }
    return {
      popupVisible,
    };
  },

  componentDidMount() {
    this.componentDidUpdate({}, {
      popupVisible: this.state.popupVisible,
    });
  },

  componentWillReceiveProps({ popupVisible }) {
    if (popupVisible !== undefined) {
      this.setState({
        popupVisible,
      });
    }
  },

  componentDidUpdate(_, prevState) {
    const props = this.props;
    const state = this.state;
    this.renderComponent(null, () => {
      if (prevState.popupVisible !== state.popupVisible) {
        props.afterPopupVisibleChange(state.popupVisible);
      }
    });

    // We must listen to `mousedown` or `touchstart`, edge case:
    // https://github.com/ant-design/ant-design/issues/5804
    // https://github.com/react-component/calendar/issues/250
    // https://github.com/react-component/trigger/issues/50
    if (state.popupVisible) {
      let currentDocument;
      // always hide on mobile
      if (!this.touchOutsideHandler) {
        currentDocument = currentDocument || props.getDocument();
        this.touchOutsideHandler = addEventListener(currentDocument,
          'touchstart', this.onDocumentClick);
      }
      return;
    }

    this.clearOutsideHandler();
  },

  componentWillUnmount() {
    this.clearOutsideHandler();
  },

  onClick(event) {
    this.fireEvents('onClick', event);
    event.preventDefault();
    const nextVisible = !this.state.popupVisible;
    if (!nextVisible || nextVisible) {
      this.setPopupVisible(!this.state.popupVisible);
    }
  },

  onDocumentClick(event) {
    if (this.props.mask && !this.props.maskClosable) {
      return;
    }
    const target = event.target;
    const root = findDOMNode(this);
    const popupNode = this.getPopupDomNode();
    if (!contains(root, target) && !contains(popupNode, target)) {
      this.close();
    }
  },

  getPopupDomNode() {
    // for test
    if (this._component && this._component.getPopupDomNode) {
      return this._component.getPopupDomNode();
    }
    return null;
  },

  getRootDomNode() {
    return findDOMNode(this);
  },

  getPopupClassNameFromAlign(align) {
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
  },

  getPopupAlign() {
    const props = this.props;
    const { popupPlacement, popupAlign, builtinPlacements } = props;
    if (popupPlacement && builtinPlacements) {
      return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
    }
    return popupAlign;
  },

  getComponent() {
    const { props, state } = this;
    return (
      <Popup
        prefixCls={props.prefixCls}
        destroyPopupOnHide={props.destroyPopupOnHide}
        visible={state.popupVisible}
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
      >
        {typeof props.popup === 'function' ? props.popup() : props.popup}
      </Popup>
    );
  },

  setPopupVisible(popupVisible) {
    if (this.state.popupVisible !== popupVisible) {
      if (!('popupVisible' in this.props)) {
        this.setState({
          popupVisible,
        });
      }
      this.props.onPopupVisibleChange(popupVisible);
    }
  },

  clearOutsideHandler() {
    if (this.touchOutsideHandler) {
      this.touchOutsideHandler.remove();
      this.touchOutsideHandler = null;
    }
  },

  forcePopupAlign() {
    if (this.state.popupVisible && this._component && this._component.alignInstance) {
      this._component.alignInstance.forceAlign();
    }
  },

  fireEvents(type, e) {
    const childCallback = this.props.children.props[type];
    if (childCallback) {
      childCallback(e);
    }
    const callback = this.props[type];
    if (callback) {
      callback(e);
    }
  },

  close() {
    this.setPopupVisible(false);
  },

  render() {
    const props = this.props;
    const children = props.children;
    const child = React.Children.only(children);
    const newChildProps: any = {
      onClick: this.onClick,
    };

    return React.cloneElement(child, newChildProps);
  },
});

export default Trigger;
