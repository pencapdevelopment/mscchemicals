import React, { useState } from 'react';
import onClickOutside from 'react-onclickoutside';
import { Button, ButtonGroup } from '@material-ui/core';
function Dropdown({ title, items, multiSelect = false }) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState([]);
  const toggle = () => setOpen(!open);
  Dropdown.handleClickOutside = () => setOpen(false);

  function handleOnClick(item) {
    if (!selection.some(current => current.id === item.id)) {
      if (!multiSelect) {
        setSelection([item]);
      } else if (multiSelect) {
        setSelection([...selection, item]);
      }
    } else {
      let selectionAfterRemoval = selection;
      selectionAfterRemoval = selectionAfterRemoval.filter(
        current => current.id !== item.id
      );
      setSelection([...selectionAfterRemoval]);
    }
  }

  function isItemInSelection(item) {
    if (selection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

  return (
    <div className="dd-wrapper">
      <div
        tabIndex={0}
        className="dd-header"
        role="button"
        onKeyPress={() => toggle(!open)}
        onClick={() => toggle(!open)}
      >
        {/* <div className="dd-header__title">
          <p className="dd-header__title--bold">{title}</p>
        </div> */}
        <div className="row">
        <div className="dd-header__action col-sm-2" >
           <ButtonGroup size="small" aria-label="small outlined button group" >
                            <Button>Export </Button>     
                                                                                                          
            </ButtonGroup>
        </div>
        {/* <div className="col-sm-2">
        <Button ><img src="img/refresh.png"/></Button>
        </div> */}
        </div>
       
      </div>
      {open && (
        <ul className="list-unstyled" >
          {items.map(item => (
            <li className="" key={item.id}>
              <Button varient="contained" size="large" onClick={() => handleOnClick(item)}>
                <span>{item.value}</span>
                <span>{isItemInSelection(item) }</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
       {/* <Button style={{}}><img src="img/refresh.png"/></Button> */}
    </div>
    
  );
}

const clickOutsideConfig = {
  handleClickOutside: () => Dropdown.handleClickOutside,
};

export default onClickOutside(Dropdown, clickOutsideConfig);