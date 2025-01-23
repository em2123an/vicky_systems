import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Container, IconButton, List, ListItem, ListItemText, TextField, Toolbar, Typography } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from "react"
import PatientRegUploader from "./registeration/PatientRegUploader"
import PatientRegPayment from "./registeration/PatientRegPayment"
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, format} from 'date-fns'

export default function PatDetailView({patDetail, setIsDetailViewing}){
    const [expanded, setExpanded] = useState('documentAcc')

    const handleAccChange = (panel) =>(event, isExpanded) =>{
        setExpanded(isExpanded?panel:false);
    }

    function getAge(dob){
        const year = differenceInCalendarYears(Date.now(),Date.parse(dob))
        if (year >= 5) return `${year} Y`
        const month = differenceInCalendarMonths(Date.now(), Date.parse(dob))
        if (month >= 12){
            return `${Math.floor(month/12)} Y ${month%12} M`  
        } 
        if (month<12 && month>=1) return `${month} M`
        const day = differenceInCalendarDays(Date.now(), Date.parse(dob)) 
        if (month <1) return `${day} D`
    }

    function getAppointment(startDT, endDT){
        const start = format(Date.parse(startDT), 'hh:mm aa')
        const end = format(Date.parse(endDT), 'hh:mm aa @ ccc, do MMM yyyy')
        return `${start} - ${end}`
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
                value={getAge(patDetail.dob)} />
            <TextField label='Sex' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                value={`${patDetail.sex}`} />
            <TextField label='Appointment Date' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                sx={{flexGrow:2}}
                value={getAppointment(patDetail.start, patDetail.end)}/>
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
                                    <ListItemText primary={service.servicename}/>
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