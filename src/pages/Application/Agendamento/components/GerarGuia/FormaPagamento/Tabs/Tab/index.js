import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../styles.css';

class Tab extends Component {
  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  }

  render() {
    const {
      onClick,
      props: {
        activeTab,
        label,
        icon,
      },
    } = this;

    let className = 'tab-list-item';

    if (activeTab === label) {
      className += ' tab-list-active';
    }

    return (
      <span style={{
        // display: 'flex',
        justifyContent: 'center',
      }}
      >
        <li
          className={className}
          onClick={onClick}
        >
          <div>
            <div
              style={{
                width: '100%',
                paddingLeft: '35%',
                justifyContent: 'center',
                alignItems: 'stretch',
                alignSelf: 'center',
              }}
            >
              {icon}
            </div>
            {label}
          </div>
        </li>
      </span>
    );
  }
}


export default Tab;
