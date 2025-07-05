import { Drawer, List, ListItemText, Toolbar, ListItem, Box, ToggleButton } from "@mui/material"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CustomAppbarDrawer from "./CustomAppbarDrawer"
import { useEffect} from "react"
import ReportingFlow from "./ReportingFlow";
import ReportingSpace from "./ReportingSpace";

export default function ReportingFront({selInv, setSelInv, setSelCurOnView, setIsRegistering,
     setIsDetailViewing, appts, setCurEvents,invSchedTypeList}){

    useEffect(()=>{
        if(!selInv || (selInv && !(selInv.title)))setSelInv(invSchedTypeList[1])
    },[selInv, selInv.title, invSchedTypeList, setSelInv])

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
                    {selInv.scannerIsReporter?
                        <ReportingFlow appts_unfiltered={appts} selInv={selInv} 
                            setIsDetailViewing={setIsDetailViewing} setIsRegistering={setIsRegistering} 
                            setCurEvents={setCurEvents} />
                        : <ReportingSpace selInv={selInv}/>}
                </Box>
            </CustomAppbarDrawer>
}