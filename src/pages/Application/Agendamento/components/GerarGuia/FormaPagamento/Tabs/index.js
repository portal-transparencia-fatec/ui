import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Tab from './Tab';
import './styles.css';

class Tabs extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
  }


  onClickTabItem = (tab) => {
    const { onActiveTabItem } = this.props;
    onActiveTabItem(tab);
  }

  render() {
    const {
      onClickTabItem,
      props: {
        children,
        activeTab,
      },
    } = this;

    return (
      <div className="tabs">
        <ol className="tab-list">
          {children.map((child, index) => {
            const { label, icon } = child.props;
            return (
              <Tab
                icon={icon}
                activeTab={activeTab}
                key={label}
                label={label}
                onClick={onClickTabItem}
              />
            );
          })}
        </ol>
        <div className="tab-content">
          {children.map((child) => {
            if (child.props.label !== activeTab) return undefined;
            return child.props.children;
          })}
        </div>
      </div>
    );
  }
}

export default Tabs;
