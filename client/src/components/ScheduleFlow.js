import { Typography, Paper, Card, Button, IconButton, CardContent, CardActions, Drawer, List, ListItemButton, ListItemText, Toolbar, ListItem, Box, ToggleButton, Accordion, AccordionSummary, AccordionDetails, Link, Modal } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Grid from "@mui/material/Grid2";
import { styled } from '@mui/material/styles';
import { useState, useCallback, useRef } from "react";
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, format} from 'date-fns'
import ImageViewerModal from "./editor/ImageViewerModal";


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const header = ['Patient info', 'Visit info', 'Prescription','Report status']
const rows = [
    {p:'xy', v:'1234',pr:'332dskfnei'},
    {p:'xy', v:'1234',pr:'332dskfnei'},
    {p:'xy', v:'1234',pr:'332dskfnei'},
    {p:'xy', v:'1234',pr:'332dskfnei'},
]

function BasicGridAsTable({columnHeaderList, children}) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container >
        {/* Table headers */}
        <Grid container size={12}>
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

function BasicGridBodyRow({children}){
    return <Grid container size={12}>
        {children}
    </Grid>
}

function BasicGridRowItem({children}){
    return <Grid size={'grow'}>
        {children}
    </Grid>
}


export default function ScheduleFlow({setCurEvents=()=>{}, setIsRegistering=()=>{}, setIsDetailViewing=()=>{}, appts_unfiltered=[]}) {
    const [expanded, setExpanded] = useState('scan_pending')
    const handleOpenImageRefer = useRef()

    const appts = appts_unfiltered.map((appts_unf)=>(appts_unf.extendedProps))


    const handleAccChange = (panel) =>(event, isExpanded) =>{
        setExpanded(isExpanded?panel:false);
    }

    //check for files or null
    function checkForFile(fileuploads){
        if(Boolean(fileuploads) && Boolean(fileuploads.files)){
            return fileuploads.files.map((file)=>({
                ...file,
                orgFilePath: file.filePath,
                filePath : `http://localhost:8080${file.filePath}`, 
                isLocalLoad:false}))
        }else{return []}
    }
    //get age out of dob
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
    function openNewPDFTab(isLocalLoad, filePath, file){
        try {
            if(!isLocalLoad){
                //filePath is base64encoded
                if(!window.open(filePath,'_blank','noopener noreferrer')){throw new Error()}
            }
            else{
                //using file
                const urlForFile = window.URL.createObjectURL(file)
                if(!window.open(urlForFile,'_blank','noopener noreferrer')){throw new Error()}
                window.URL.revokeObjectURL(urlForFile)
            }
        } catch (error) {
            console.log(error)
            return
        }
    }
    //for detail viewing if needed
    function handleDetailClick(info){
        //click on events - to - see detail views
        setIsDetailViewing(true)
        setIsRegistering(false)
        setCurEvents({...info.event.extendedProps})
    }

    const GridShowAppts = () =>{
        return 
    }

    return <Box>
        {/* accordions for scan pending, scan complete, scan cancelled; possilbly emergency */}
        <Accordion expanded={expanded === 'scan_pending'} onChange={handleAccChange('scan_pending')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="scan_pending">
                    <Typography component='span'>Scan Pending</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts!==0
                        ?<>
                            <BasicGridAsTable columnHeaderList={header}>
                                {appts.map((apptDetail)=>{
                                    return <BasicGridBodyRow>
                                        <BasicGridRowItem><Card elevation={0} >
                                                <CardContent>
                                                    <Typography variant="h6" component={'div'}>{apptDetail.firstname} {apptDetail.lastname}</Typography>
                                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Age: {getAge(apptDetail.dob)}</Typography>
                                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Sex: {apptDetail.sex}</Typography>
                                                </CardContent>
                                            </Card></BasicGridRowItem>
                                        <BasicGridRowItem><Card elevation={0}>
                                                <CardContent>
                                                        {apptDetail.servicenames&&apptDetail.servicenames.map((servicename)=>{
                                                            return <Typography variant='body1'>{servicename}</Typography>
                                                        })}
                                                </CardContent>
                                            </Card></BasicGridRowItem>
                                        <BasicGridRowItem>{checkForFile(apptDetail.fileuploads).length!==0 && 
                                            <List>
                                            {checkForFile(apptDetail.fileuploads).map((value,index)=>{
                                                var imagePDFSrc = value.filePath?value.filePath:''
                                                return <ListItem key={index}>
                                                    {value.mimetype.includes('application/pdf')?
                                                        <Link component={'button'} onClick={()=>{openNewPDFTab(false,value.filePath, value.file)}} rel='noopener noreferrer' target='_blank'>
                                                            View {value.documentUploadType}
                                                        </Link>
                                                        : value.mimetype.includes('image')?
                                                        <>
                                                            <Button variant="text" 
                                                                onClick={()=>{
                                                                    const handle =handleOpenImageRefer.current
                                                                    handle(imagePDFSrc)
                                                                }}>
                                                                View {value.documentUploadType}</Button>
                                                        </>:
                                                        <Link rel='noopener noreferrer' target='_blank' href={''}>
                                                        </Link>
                                                    }
                                                </ListItem>
                                            })}</List>}
                                        </BasicGridRowItem>
                                        <BasicGridRowItem></BasicGridRowItem>
                                    </BasicGridBodyRow>
                                })}
                            </BasicGridAsTable>
                        </>
                        :<Typography component={'span'}>No Scan Pending</Typography>}
                </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'scan_complete'} onChange={handleAccChange('scan_complete')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="scan_complete">
                    <Typography component='span'>Scan Completed</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts!==0
                        ? <>
                            <BasicGridAsTable columnHeaderList={header}>
                                
                            </BasicGridAsTable>
                        </>
                        :<Typography component={'span'}>No Complete Scans</Typography>}
                </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'scan_cancelled'} onChange={handleAccChange('scan_cancelled')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="scan_cancelled">
                    <Typography component='span'>Scan Cancelled</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts!==0
                        ?<></>
                        :<Typography component={'span'}>No Cancelled Scans</Typography>}
                </AccordionDetails>
        </Accordion>
        {/* Image viewing modal */}
        {/*<ImageViewerModal/>*/}
        <ImageViewerModal handleOpenImageRef={handleOpenImageRefer} />
  </Box>
}
