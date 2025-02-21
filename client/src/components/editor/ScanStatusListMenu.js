import {List, ListItemText, ListItemButton, Menu, MenuItem, MenuList, Button, Typography, Box,Dialog, DialogContent, DialogActions} from '@mui/material';
import { useEffect, useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';


export default function ScanStatusListMenu({handleStatusClick=()=>{return true}}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setselectedOption] = useState('Scan Pending');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [tempSelectedOption, setTempSelectedOption] = useState('')
  const [confirmStatus, setConfirmStatus] = useState(-1)
  const open = Boolean(anchorEl);
  const options = [
    'Scan Pending',
    'Scan Completed',
    'Scan Incomplete',
    'Scan Cancelled'
  ];

  useEffect(()=>{
    if(openConfirmDialog && tempSelectedOption){
      if(confirmStatus===1){
        //if yes is clicked
        setselectedOption(tempSelectedOption)      
        handleClose()
      }else if(confirmStatus===0){
        //if no is clicked
        handleClose()
      }
    }
  },[openConfirmDialog,tempSelectedOption,confirmStatus])

  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  function handleYesNoClick(status){
    setConfirmStatus(status?1:0)
  }

  function handleOnCloseConfirmDialog(){
    setOpenConfirmDialog(false)
  }

  const handleMenuItemClick = (event, index, option) => {
    setOpenConfirmDialog(true)
    setTempSelectedOption(option)
    // if(handleStatusClick(option)){
    //     setselectedOption(option);
    //     setAnchorEl(null);
    // }else{
    //     setAnchorEl(null)
    // }
  };

  const handleClose = () => {
    setOpenConfirmDialog(false)
    setTempSelectedOption('')
    setConfirmStatus(-1)
    setAnchorEl(null)
  };

  return (
    <Box width={1} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
      <List
        component="nav"
        aria-label="Device settings"
        sx={{ width:'fit-content', bgcolor: 'background.paper'}}
      >
        <ListItemButton
          id="lock-button"
          disableRipple
          aria-haspopup="listbox"
          aria-controls="lock-menu"
          aria-label="when device is locked"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClickListItem}
        >
          {/* 
            <ListItemText
              primary={selectedOption}
            />
            {open ? <ExpandLess /> : <ExpandMore />}
          */}
          <Box width={1} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
            <Typography variant='body1' marginRight={1}>{selectedOption}</Typography>
            {open ? <ExpandLess /> : <ExpandMore />}
          </Box>
        </ListItemButton>
      </List>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'lock-button',
          role: 'listbox',
        }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={index}
            selected={option === selectedOption}
            onClick={(event) => handleMenuItemClick(event, index, option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
      <Dialog sx={{}} open={openConfirmDialog} onClose={()=>{handleOnCloseConfirmDialog()}}>
            <DialogContent>Are You Sure?</DialogContent>
            <DialogActions>
                <Button autoFocus color={'success'} onClick={()=>{handleYesNoClick(true)}}>Yes</Button>
                <Button color={'error'} onClick={()=>{handleYesNoClick(false)}}>No</Button>
            </DialogActions>
      </Dialog>
    </Box>
  );
}