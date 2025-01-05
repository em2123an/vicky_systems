import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Container, IconButton, List, ListItem, ListItemText, TextField, Toolbar, Typography } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from "react"
import PatientRegUploader from "./registeration/PatientRegUploader"
import PatientRegPayment from "./registeration/PatientRegPayment"

export default function PatDetailView({patDetail, setIsDetailViewing}){
    const [expanded, setExpanded] = useState('documentAcc')

    const handleAccChange = (panel) =>(event, isExpanded) =>{
        setExpanded(isExpanded?panel:false);
    }

    return <Box sx={{paddingX:5, paddingY:2}}>
        <Toolbar>
            <Button sx={{justifyContent:'start'}} variant="contained" onClick={()=>(setIsDetailViewing(false))}>Back</Button>
        </Toolbar>
        <Box m={3}  display={'flex'} flexWrap={'wrap'} justifyContent={'space-between'}>
            <TextField label='Patient Name' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                value={`${patDetail.firstname} ${patDetail.lastname}`} />
            <TextField label='Age' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                value={`${patDetail.age_y}Y ${(patDetail.age_m!==null && patDetail.age_m!=="")?`${patDetail.age_m}M`:""} ${(patDetail.age_d!==null && patDetail.age_d!=="")?`${patDetail.age_d}D`:""}`} />
            <TextField label='Sex' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                value={`${patDetail.sex}`} />
            <TextField label='Appointment Date' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                value={`${patDetail.start} - ${patDetail.end}`} />
        </Box>
        <Box>
            <Accordion expanded={expanded === 'serviceList'} onChange={handleAccChange('serviceList')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="serviceList">
                    <Typography component='span'>Service Status</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {patDetail.services.length!==0
                        ?<List>
                            {patDetail.services.map((service,index)=>(
                                <ListItem key={index} secondaryAction={
                                        <IconButton edge='end'><DeleteIcon/></IconButton>
                                    }>
                                    <ListItemText primary={service.title}/>
                                    <Typography component={'span'} sx={{marginRight:8}}>Price : {service.price}</Typography>
                                </ListItem>
                            ))}
                        </List>
                        :<Typography component={'span'}>No Services Selected</Typography>}
                </AccordionDetails>
            </Accordion>
            <Accordion sx={{m:2}} expanded={expanded === 'documentAcc'} onChange={handleAccChange('documentAcc')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="documents">
                    <Typography component='span'>Documents</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{marginRight:2}}>
                    {/* to see documents */}
                    <PatientRegUploader fullwidth={true} />
                </AccordionDetails>
            </Accordion>
            <Accordion sx={{m:2}} expanded={expanded === 'paymentAcc'} onChange={handleAccChange('paymentAcc')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="paymentAcc">
                    <Typography component='span'>Payment Details</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{marginRight:2}}>
                    {/* to handle payment from detail view */}
                    <PatientRegPayment listSelectedServices={patDetail.services}/>
                </AccordionDetails>
            </Accordion>
        </Box>
    </Box>
}