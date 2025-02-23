import { Drawer, List, ListItemButton, ListItemText, Toolbar, ListItem, Box, ToggleButton } from "@mui/material"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ScheduleCal from './ScheduleCal'
import ScheduleFlow from './ScheduleFlow'
import CustomAppbarDrawer from "./CustomAppbarDrawer"
import { useEffect, useState } from "react"

export default function SchedulerFront({selInv, setSelInv, setSelCurOnView, setIsRegistering, setIsDetailViewing, appts, setCurEvents}){
    const invlist = ['MRI','CT', 'X-RAY','ULTRASOUND','ECHO']
    const invSchedTypeList = [
        {title:'MRI', type:'cal'},
        {title:'CT', type:'flow'},
        {title:'X-RAY', type:'flow'},
        {title:'ULTRASOUND', type:'flow'},
        {title:'ECHO', type:'flow'},
    ]

    useEffect(()=>{
        if(!(selInv.title))setSelInv(invSchedTypeList[1])
    },[selInv, selInv.title, invSchedTypeList])

    return <CustomAppbarDrawer setSelCurOnView={setSelCurOnView}>
                <Drawer variant="permanent" aria-label="permanent-nav-inv-list" 
                        sx={{width:240, flexGrow:0}}>
                    <Toolbar/>
                    <List sx={{width:240}}>
                        {invSchedTypeList.map((inv, index)=>{
                            return <ListItem key={index} disablePadding>
                                <ToggleButton selected={selInv.title===inv.title} value={inv.title} color="primary" fullWidth
                                    sx={{borderRadius:0, border:0, boxShadow:1}}
                                    onClick={()=>{
                                        setSelInv(inv)
                                    }}>
                                    {selInv.title===inv.title&&<KeyboardArrowRightIcon/>}
                                    <ListItemText primary={inv.title} />    
                                </ToggleButton>
                                
                            </ListItem>
                        })}
                    </List>
                </Drawer>
                <Box sx={{flexGrow:2}} component={'main'}>
                    <Toolbar/>
                    {
                        selInv.type==='flow'? 
                            <ScheduleFlow appts_unfiltered={appts} setIsDetailViewing={setIsDetailViewing} setIsRegistering={setIsRegistering} setCurEvents={setCurEvents} /> :
                        selInv.type==='cal'&& 
                            <ScheduleCal setIsDetailViewing={setIsDetailViewing} setIsRegistering={setIsRegistering} events={appts} setCurEvents={setCurEvents}/>
                    }
                    {/* 
                        <ScheduleFlow appts_unfiltered={appts} setIsDetailViewing={setIsDetailViewing} setIsRegistering={setIsRegistering} setCurEvents={setCurEvents} />
                    */}
                    {/*
                    <ScheduleCal setIsDetailViewing={setIsDetailViewing} setIsRegistering={setIsRegistering} events={appts} setCurEvents={setCurEvents}/>
                     */}
                </Box>
            </CustomAppbarDrawer>
}