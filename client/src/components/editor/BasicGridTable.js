import { Typography, Paper, Card, Button, IconButton, CardContent, CardActions, Drawer, List, ListItemButton, ListItemText, Toolbar, ListItem, Box, Accordion, AccordionSummary, AccordionDetails, Link, Modal, Dialog, DialogTitle, DialogActions, CircularProgress } from "@mui/material"
import Grid from "@mui/material/Grid2";

export function BasicGridAsTable({columnHeaderList, children}) {
    //for table with columns
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container >
          {/* Table headers */}
          <Grid container size={12} 
              sx={{ '--Grid-borderWidth': '1px',
                  borderBottom: 'var(--Grid-borderWidth) solid',
                  borderColor: 'divider'}}
          >
              {columnHeaderList.map((column)=>{
                  return <Grid size='grow'>
                      <Typography sx={{width:'1',textAlign:'center'}} variant="body1">{column}</Typography>
                  </Grid>
              })}
          </Grid>
          {/* Table body */}
          <Grid container size={12}>
              {/* Each Table Row */}
              {children}
          </Grid>
        </Grid>
      </Box>
    );
  }
  
export function BasicGridBodyRow({children}){
    //for creating rows
      return <Grid container size={12} justifyContent={'center'} 
              alignItems={'center'}
              sx={{ '--Grid-borderWidth': '1px',
                  borderBottom: 'var(--Grid-borderWidth) solid',
                  borderColor: 'divider'}}>
          {children}
      </Grid>
  }
  
export function BasicGridRowItem({children}){
    //for row items
      return <Grid size={'grow'}>
          {children}
      </Grid>
  }
  
  