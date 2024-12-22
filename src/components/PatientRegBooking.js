import { Autocomplete, Box, IconButton, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import DeleteIcon  from '@mui/icons-material/Delete'
import {useState} from "react";

export default function PatientRegBooking(){
    const [selectedService, setSelectedService] = useState(null)
    const [listSelectedServices, setListSelectedServices] = useState([])

    var MRISERVICEOPTIONS = [
        {title:'Cervical MRI', price:'7800', side: false},
        {title:'Thorasic MRI', price:'7800', side: false},
        {title:'Lumbar MRI', price:'7800', side: false},
        {title:'Brain MRI', price:'7800', side: false},
        {title:'Neck MRI', price:'7400', side: false},
        {title:'Pelvic MRI', price:'8800', side: false},
        {title:'Abdomen MRI', price:'8800', side: false},
        {title:'Abdominopelvic MRI', price:'11800', side: false},
        {title:'Hip MRI', price:'7300', side: true},
        {title:'Knee MRI', price:'7300', side: true},
        {title:'Thigh MRI', price:'7300', side: true},
        {title:'Ankle MRI', price:'7300', side: true},
        {title:'Leg MRI', price:'7300', side: true},
        {title:'Shoulder MRI', price:'7300', side: true},
        {title:'Elbow MRI', price:'7300', side: true},
        {title:'Wrist MRI', price:'7300', side: true},
    ]

    return (
        <Box sx={{display:'flex', flexDirection:'column', alignItems:'flex-start', width:'fit-content', padding:'24px', border:1, borderRadius:'8px'}}>
            <Typography variant="h5" textAlign={'start'}>Booking Details</Typography>
            {listSelectedServices && <List>
                {listSelectedServices.map((value, index, oldArr)=>{
                    return (<ListItem secondaryAction={
                        <IconButton edge='end' aria-label="delete-icon" onClick={()=>{
                            oldArr.splice(index,1)
                            setListSelectedServices(oldArr)
                        }}>
                            <DeleteIcon/>
                        </IconButton>
                    }>
                                <ListItemText primary={`${value.title} - ${value.price}`}/>
                            </ListItem>)
                            })}
                    </List>}
            <Autocomplete id="select_service" value={selectedService} 
                options={MRISERVICEOPTIONS.flatMap((value)=>{
                    if(value.side){
                        return [{...value,title:`Right ${value.title}`},{...value,title:`Left ${value.title}`}]
                        }
                    return value
                    })}
                clearOnBlur
                getOptionLabel={(option)=>option.title}
                onChange={(e,newValue,)=>{        
                            if(newValue!==null){
                                setListSelectedServices((prevList)=>([...prevList,newValue]))
                            }
                        }}
                renderInput={(params)=>(
                                <TextField sx={{width:'500px'}} {...params} label="Select Service"/>
                        )}
                />
            </Box>        
    )
}