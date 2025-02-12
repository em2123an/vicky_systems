import { AppBar, Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography, Divider, ListItem, Box } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import {useState} from 'react'

export default function CustomAppbarDrawer({children}) {
    const[openTempNavMenu, setopenTempNavMenu] = useState(false)
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
                {children}
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
