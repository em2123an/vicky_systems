import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import BookingPaymentCor from "./BookingPaymentCor";
import { useMemo } from "react";

export default function PatientRegBooking({selInv, serviceList, formik}){
    //const [selectedService, setSelectedService] = useState(null)    
    function optionGen(fullservices,selectedToBeNotIncluded){
        if(selectedToBeNotIncluded.length === 0){
            return fullservices.filter((service)=>{
                if(service.category!==selInv.code){
                    return false
                }
                return true
            })}
        else{
            return fullservices.filter((service)=>{
                if(service.category!==selInv.code){
                    return false
                }
                let filt = true
                selectedToBeNotIncluded.forEach(element => {
                    if(element.servicename === service.servicename){filt = false}
                });
                return filt
            })
        }
    }
    
    const optionGenMemo = useMemo(()=>{
        console.log(formik.values.selservices)
        return optionGen(serviceList,formik.values.selservices)
    },[serviceList,formik.values.selservices,selInv.code])
    console.log(formik.values.selservices)
    return (
        <Box sx={{display:'flex', flexDirection:'column', alignItems:'flex-start', width:'fit-content', padding:'24px', border:1, borderRadius:'8px'}}>
            <Typography variant="h5" textAlign={'start'} sx={{marginBottom:1}}>Booking Details</Typography>
                {formik.values.selservices.length !==0 && 
                    <BookingPaymentCor listSelectedServices={formik.values.selservices}/>}
            <Autocomplete multiple id="select_service" sx={{marginY:1}}
                options={optionGen(serviceList,formik.values.selservices)}
                getOptionLabel={(option)=>option.servicename}
                //value={listSelectedServices}
                value={formik.values.selservices}
                // onChange={(e,newValue,)=>{        
                //     setListSelectedServices(()=>([...newValue]))
                //         }}
                onChange={(e,newvalue)=>{
                    formik.setFieldValue("selservices",newvalue!==null?newvalue:[])
                    //setListSelectedServices(()=>([...newvalue]))
                }}
                renderInput={(params)=>(
                                <TextField {...params} sx={{width:'500px'}} label="Select Service" required
                                    name='selservices' 
                                    error={Boolean(formik.touched.selservices && formik.errors.selservices)}
                                />
                        )}
                />
        </Box>        
    )
}