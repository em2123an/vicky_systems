import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import PatientRegBooking from "./PatientRegBooking";
import {Box, Container} from "@mui/material";
import PatientRegPersonal from './PatientRegPersonal'


export default function PatientRegForm({selInv, serviceList, formik, curEvents, setCurEvents, events}){
    if(selInv && selInv.type === 'flow'){
        //no calendar view
        return <>
            <Box component={'form'} autoComplete={false} onSubmit={formik.handleSubmit} 
             sx={{marginRight:2, display:'flex', flexDirection:'row', justifyContent:'space-evenly'}}>
                <PatientRegPersonal formik={formik}/>
                <PatientRegBooking selInv={selInv} serviceList={serviceList} 
                 formik={formik}/>
            </Box>
        </>
    }else if (selInv && selInv.type ==='cal'){
        //calander view
        return (
            <Container sx={{}}>
                <Box sx={{display:'flex', flexDirection:'row', justifyContent:'start'}}>
                    <Box component={'form'} autoComplete={false} onSubmit={formik.handleSubmit} sx={{marginRight:2}}>
                        <PatientRegPersonal formik={formik}/>
                        <PatientRegBooking selInv={selInv} serviceList={serviceList} formik={formik}/>
                    </Box>
                    {(curEvents.extendedProps && curEvents.extendedProps.calView) &&
                        <Box sx={{flexGrow:2, alignContent:'stretch', alignSelf:'stretch', minHeight:'80vh'}}>
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
                                titleFormat={{year:'numeric',month:'short',day:'numeric'}} 
                                headerToolbar = {{
                                    left : 'title',
                                    //center : 'title',
                                    right : 'Day,today,prev,next'
                                }}
                                initialDate={curEvents.startStr?curEvents.startStr:curEvents.start&&curEvents.start}
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
                    }
                </Box>
            </Container>
        )
    }
}