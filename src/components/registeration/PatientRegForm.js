import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import PatientRegBooking from "./PatientRegBooking";
import { Box, Button, Container, FormControl, FormLabel, InputAdornment, Stack, TextField, Typography } from "@mui/material";


export default function PatientRegForm({formik, curEvents, setCurEvents, isRegistering, setIsRegistering, events, setEvents, listSelectedServices,setListSelectedServices}){

    return (
            <Container>
                <Box sx={{display:'flex', flexDirection:'row', justifyContent:'start'}}>
                    <Box component={'form'} onSubmit={formik.handleSubmit} sx={{marginRight:2}}>
                        <Box sx={{display:'flex', flexDirection:'column', alignItems:'flex-start', width:'fit-content', padding:'24px', border:1, borderRadius:'8px'}}>
                            <Typography variant="h5" textAlign={'start'}>Personal Information</Typography>
                            <Stack direction={'row'} spacing={2} sx={{marginTop:'16px'}}>
                                <TextField required onBlur={formik.handleBlur} error={formik.touched.firstname && formik.errors.firstname} value={formik.values.firstname} onChange={formik.handleChange} variant="outlined" name="firstname" label='First name' slotProps={{inputLabel:{shrink:true,},}} />
                                <TextField required onBlur={formik.handleBlur} error={formik.touched.lastname && formik.errors.lastname} value={formik.values.lastname} onChange={formik.handleChange} variant="outlined" name="lastname" label='Last name' slotProps={{inputLabel:{shrink:true,},}}/>
                            </Stack>
                            <Stack direction={'column'} spacing={0}component={'fieldset'} sx={{marginY:'8px', borderRadius:'5px'}}>
                                {/** <Typography variant="overline" component={'legend'}>Age</Typography>*/}
                                <FormControl>
                                    <FormLabel>
                                        <Typography variant="caption" >Age</Typography>
                                    </FormLabel> 
                                    <Stack direction={'row'} spacing={2}>
                                        <TextField variant="outlined" value={formik.values.age_yrs} onChange={(event)=>{
                                                var reg = new RegExp('^[0-9]*$')
                                                if(reg.test(event.target.value)){
                                                    return formik.handleChange(event)
                                                }}} 
                                            name="age_yrs" size="small" sx={{width:'150px'}} slotProps={{input:{endAdornment:<InputAdornment position="end">Year</InputAdornment>}}}/>
                                        <TextField variant="outlined" value={formik.values.age_mns} onChange={(event)=>{
                                                var reg = new RegExp('^[0-9]*$')
                                                if(reg.test(event.target.value)){
                                                    return formik.handleChange(event)
                                                }}} 
                                            name="age_mns" size="small" sx={{width:'150px'}} slotProps={{input:{endAdornment:<InputAdornment position="end">Month</InputAdornment>}}}/>
                                        <TextField variant="outlined" value={formik.values.age_dys} onChange={(event)=>{
                                                var reg = new RegExp('^[0-9]*$')
                                                if(reg.test(event.target.value)){
                                                    return formik.handleChange(event)
                                                }}} 
                                            name="age_dys" size="small" sx={{width:'150px'}} slotProps={{input:{endAdornment:<InputAdornment position="end">Day</InputAdornment>}}}/>
                                    </Stack>
                                </FormControl>
                            </Stack>
                            <Stack direction={'row'} spacing={1} sx={{marginY:'8px'}}>
                                <TextField required onBlur={formik.handleBlur} error={formik.touched.mobileno && formik.errors.mobileno} 
                                    value={formik.values.mobileno} onChange={(event)=>{
                                            var reg = new RegExp('^[0-9]*$')
                                            if(reg.test(event.target.value)){
                                                return formik.handleChange(event)
                                            }
                                        }} 
                                    variant="outlined" name="mobileno" label='Mobile Numbner' slotProps={{inputLabel:{shrink:true,}, input:{startAdornment:<InputAdornment position="start">+251</InputAdornment>}}}/>
                            </Stack>
                        </Box>
                        <PatientRegBooking listSelectedServices={listSelectedServices} setListSelectedServices={setListSelectedServices}/>
                    </Box>
                    <Box sx={{flexGrow:2, alignSelf:'stretch'}}>
                        <FullCalendar height={'100%'}
                            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, listPlugin]}
                            initialView='Day'
                            allDaySlot={false}
                            weekends = {true}
                            views={{
                                Day : {
                                    type : 'timeGrid',
                                    slotDuration : {
                                        minutes : 20
                                    }
                                },
                            }}
                            buttonText={{
                                'today':'Today',
                                'week' : 'Week',
                                'list': 'Show All'
                            }}
                            headerToolbar = {{
                                left : 'title',
                                //center : 'title',
                                right : 'Day,today,prev,next'
                            }}
                            events={[...events, curEvents]}
                            selectable = {true}
                            select={(info)=>{
                                setCurEvents((appEvent)=>({...appEvent,start:info.startStr,end:info.endStr}))
                            }}
                            eventChange={(changeInfo)=>{
                                setCurEvents((appEvent)=>({...appEvent,start:changeInfo.event.startStr, end:changeInfo.event.endStr}))
                            }}
                            />
                    </Box>
                </Box>
            </Container>
    )
}