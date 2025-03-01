import React, { Component } from "react";
import {  DraftDecoratorComponentProps, CompositeDecorator, ContentBlock, ContentState, DraftDecorator } from "draft-js";
import { FaCaretDownIcon, FaCaretUpIcon } from "./style/HomeStyled";

// 🟢 클래스형 컴포넌트 사용
class ToggleTextComponent extends Component<DraftDecoratorComponentProps, { isHidden: boolean }> {
  constructor(props: DraftDecoratorComponentProps) {
    super(props);

    const entity = props.entityKey ? props.contentState.getEntity(props.entityKey) : null;
    const hidden = entity ? (entity.getData() as { hidden: boolean }).hidden : false;

    this.state = {
      isHidden: hidden,
    };
  }

  toggleHidden = () => {
    this.setState((prevState) => ({ isHidden: !prevState.isHidden }));
  };

  render() {
    const { children } = this.props;
    return (
      <span
        style={{
          background: this.state.isHidden ?"trasaparent": "black",
          padding: "2px 5px",
          cursor: "pointer",
          display: "inline-block",
          borderRadius: "4px",
        }}
        onClick={this.toggleHidden}
      >
        {this.state.isHidden ? (
            <div>
                <FaCaretDownIcon />
                숨김 텍스트
            </div>
            ): (
        <div>
            <FaCaretUpIcon />
            <p style={{paddingLeft: '3px'}}>
                {children}
            </p>
        </div>
    )
}
      </span>
    );
  }
}

// 🟢 DraftDecorator 정의
export default ToggleTextComponent;