import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
//import bootstrap5Plugin from '@fullcalendar/bootstrap5'
//import bootstrapPlugin from '@fullcalendar/bootstrap'
//import 'bootstrap/dist/css/bootstrap.css';
//import 'bootstrap-icons/font/bootstrap-icons.css';
//import 'bootstrap/dist/css/bootstrap.css';
//import '@fortawesome/fontawesome-free/css/all.css';
import React from 'react'
import { purple } from '@mui/material/colors'

export default function ScheduleCal({setCurEvents, setIsRegistering, setIsDetailViewing, events}){
    
    
    function handleClick(info){
        //click on empty - to - make appointment
        setIsRegistering(true)
        setIsDetailViewing(false)
        setCurEvents({
            start: info.startStr,
            end : info.endStr,
            editable : true,
            backgroundColor: purple[800],
            borderColor: purple[800]
        })
    }

    function handleEventClick(info){
        setIsDetailViewing(true)
        setIsRegistering(false)
        setCurEvents({
            start: info.event.startStr,
            end: info.event.endStr,
            department : info.event.extendedProps.department,
            firstname : info.event.extendedProps.firstname,
            lastname : info.event.extendedProps.lastname,
            sex : info.event.extendedProps.sex,
            age_y : info.event.extendedProps.age_y,
            age_m : info.event.extendedProps.age_m,
            age_d : info.event.extendedProps.age_d,
            services : [...info.event.extendedProps.services],
            editable : false,
        })
    }

    return <FullCalendar height={'100vh'}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, listPlugin]}
        initialView='Day'
        //themeSystem='bootstrap'
        //themeSystem='bootstrap5'
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
            left : 'list',
            //center : 'title',
            right : 'Day,timeGridWeek,today,prev,next'
        }}
        events = {events}
        selectable = {true}
        select={(info)=>{
            handleClick(info)
        }}
        eventClick={handleEventClick}
    />
}