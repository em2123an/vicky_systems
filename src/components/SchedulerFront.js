import { AppBar, Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography, Divider, ListItem, Box } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import React from "react"
import ScheduleCal from './ScheduleCal'

export default function SchedulerFront({isRegistering, setIsRegistering, events, setEvents}){
    const[openTempNavMenu, setopenTempNavMenu] = React.useState(false)
    const invlist = ['CT', 'MRI', 'X-RAY','ULTRASOUND','ECHO']
    const featurelist = ['Scheduler', 'Visit', 'Archive', 'Scan-Worklist','Reporting']

    function handleDrawerToggle (){
        setopenTempNavMenu((prevVal)=>!prevVal)
    }

    return <Box sx={{display:'flex'}}>
        <AppBar sx={{zIndex:(theme)=>theme.zIndex.drawer + 1}}>
            <Toolbar>
                <IconButton onClick={handleDrawerToggle}> <MenuIcon/> </IconButton>
                <Typography variant="h3" sx={{textAlign:'center'}}>Vicky Systems</Typography>
            </Toolbar>
        </AppBar>
        <Drawer variant="permanent" aria-label="permanent-nav-inv-list" 
                sx={{width:240, flexGrow:0}}>
            <Toolbar/>
            <List sx={{width:240}}>
                {invlist.map((item, index)=>(
                    <ListItem key={index} disablePadding>
                        <ListItemButton>
                            <ListItemText primary={item} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
        <Box sx={{flexGrow:2}} component={'main'}>
            <Toolbar/>
            <ScheduleCal isRegistering={isRegistering} setIsRegistering={setIsRegistering} events={events} setEvents={setEvents}/>
        </Box>
        <Drawer aria-label="temporary-nav-feature-menu" sx={{zIndex:(theme)=>theme.zIndex.drawer + 2}}
            variant="temporary" open={openTempNavMenu} onClose={handleDrawerToggle}>
            <Toolbar>
                <Typography variant="h6">Menu</Typography>
            </Toolbar>
            <Divider/>
            <List sx={{width:250}}>
                {featurelist.map((value, index)=>{
                    return <ListItem key={index} disablePadding>
                            <ListItemButton>
                                <ListItemText primary={value}/>
                            </ListItemButton>
                        </ListItem>
                })}
            </List>
        </Drawer>
    </Box>
}