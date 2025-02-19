import { Drawer, List, ListItemButton, ListItemText, Toolbar, ListItem, Box, ToggleButton } from "@mui/material"
import ScheduleCal from './ScheduleCal'
import ScheduleFlow from './ScheduleFlow'
import CustomAppbarDrawer from "./CustomAppbarDrawer"
import { useState } from "react"

export default function SchedulerFront({selInv, setSelInv, setSelCurOnView, setIsRegistering, setIsDetailViewing, appts, setCurEvents}){
    const invlist = ['CT', 'MRI', 'X-RAY','ULTRASOUND','ECHO']

    return <CustomAppbarDrawer setSelCurOnView={setSelCurOnView}>
                <Drawer variant="permanent" aria-label="permanent-nav-inv-list" 
                        sx={{width:240, flexGrow:0}}>
                    <Toolbar/>
                    <List sx={{width:240}}>
                        {invlist.map((inv, index)=>{
                            return <ListItem key={index} disablePadding>
                                <ToggleButton selected={selInv===inv} value={inv} color="primary" fullWidth
                                    sx={{borderRadius:0, border:0, boxShadow:1}}
                                    onClick={()=>{
                                        setSelInv(inv)
                                    }}>
                                    <ListItemText primary={inv} />    
                                </ToggleButton>
                                
                            </ListItem>
                        })}
                    </List>
                </Drawer>
                <Box sx={{flexGrow:2}} component={'main'}>
                    <Toolbar/>
                    {/* 
                        <ScheduleFlow appts_unfiltered={appts}/>
                    */}
                    <ScheduleFlow appts_unfiltered={appts}/>
                    {/*
                    <ScheduleCal setIsDetailViewing={setIsDetailViewing} setIsRegistering={setIsRegistering} events={appts} setCurEvents={setCurEvents}/>
                     */}
                </Box>
            </CustomAppbarDrawer>
}