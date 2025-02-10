import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
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
        //click on events - to - see detail views
        setIsDetailViewing(true)
        setIsRegistering(false)
        setCurEvents({...info.event.extendedProps})
    }

    return <FullCalendar height={'100vh'}
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