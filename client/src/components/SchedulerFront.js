import { Drawer, List, ListItemButton, ListItemText, Toolbar, ListItem, Box } from "@mui/material"
import ScheduleCal from './ScheduleCal'
import CustomAppbarDrawer from "./CustomAppbarDrawer"

export default function SchedulerFront({setSelCurOnView, setIsRegistering, setIsDetailViewing, appts, setCurEvents}){
    const invlist = ['CT', 'MRI', 'X-RAY','ULTRASOUND','ECHO']

    return <CustomAppbarDrawer setSelCurOnView={setSelCurOnView}>
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
                    <ScheduleCal setIsDetailViewing={setIsDetailViewing} setIsRegistering={setIsRegistering} events={appts} setCurEvents={setCurEvents}/>
                </Box>
            </CustomAppbarDrawer>
}