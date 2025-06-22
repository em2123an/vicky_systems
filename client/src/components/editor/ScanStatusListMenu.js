import {List, ListItemButton, Menu, MenuItem, Button, Typography, Box,Dialog, DialogActions, DialogTitle, CircularProgress} from '@mui/material';
import { useEffect, useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useMutation, useQueryClient} from "@tanstack/react-query"
import axios from "axios"


export default function ScanStatusListMenu({initialSelectedOption='scan_pending', selVisitid, pendingOtherStatus=false}) {
  const options = [
    {val: 'scan_pending', title:'Scan Pending'},
    {val: 'scan_completed', title:'Scan Completed'},
    {val: 'scan_incomplete', title:'Scan Incomplete'},
    {val: 'scan_cancelled', title:'Scan Cancelled'},
  ];

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setselectedOption] = useState(options.filter((option)=>(option.val===initialSelectedOption))[0]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [tempSelectedOption, setTempSelectedOption] = useState()
  const [confirmStatus, setConfirmStatus] = useState(-1)
  const open = Boolean(anchorEl);
  const queryClient = useQueryClient()

  //mutation call to change the status of the scan
  const mutupdatescanstatus = useMutation({
    mutationKey:['update_scan_status', selVisitid],
    mutationFn: (updatedscanstatus)=>(
        axios.post('http://localhost:8080/updatescanstatus',updatedscanstatus,
            {headers:{"Content-Type":"application/x-www-form-urlencoded"}})
        ),
    onSuccess: ()=>{
      setselectedOption({...tempSelectedOption})  
      queryClient.invalidateQueries({queryKey:['get_appointments']}) 
      queryClient.invalidateQueries({queryKey:['patDetail']}) 
    }
  })


  useEffect(()=>{
    if(openConfirmDialog && tempSelectedOption){
      if(confirmStatus===1){
        //if yes is clicked
        handleClose()
        mutupdatescanstatus.mutate({
          visitid: selVisitid,
          scanstatus:tempSelectedOption.val
        })      
      }else if(confirmStatus===0){
        //if no is clicked
        handleClose()
      }
    }
  },[openConfirmDialog,tempSelectedOption,confirmStatus,mutupdatescanstatus,selVisitid])

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
    if(selectedOption.val !== option.val){
      setOpenConfirmDialog(true)
      setTempSelectedOption({...option})
    }
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
      {(mutupdatescanstatus.isPending || pendingOtherStatus)&&<CircularProgress size={'20'}/>}
      <List
        component="nav"
        sx={{ width:'fit-content', bgcolor: 'background.paper'}}
      >
        <ListItemButton
          id="scan-status-button"
          disableRipple
          aria-haspopup="listbox"
          aria-controls="scan-status-menu"
          aria-label="when menu is clicked"
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
            <Typography variant='body1' marginRight={1}>{selectedOption.title}</Typography>
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
            {option.title}
          </MenuItem>
        ))}
      </Menu>
      <Dialog open={openConfirmDialog} onClose={()=>{handleOnCloseConfirmDialog()}}>
            <DialogTitle sx={{padding:4}}>Are you sure you want to continue?</DialogTitle>
            <DialogActions>
                <Button autoFocus variant='contained' color={'success'} onClick={()=>{handleYesNoClick(true)}}>Yes</Button>
                <Button variant='contained' color={'error'} onClick={()=>{handleYesNoClick(false)}}>No</Button>
            </DialogActions>
      </Dialog>
    </Box>
  );
}