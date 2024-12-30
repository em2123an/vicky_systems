import { useState } from "react";
import BookingPaymentCor from "./BookingPaymentCor";
import { Autocomplete, Stack, TextField, Typography, InputAdornment, Button } from "@mui/material";

export default function PatientRegPayment({listSelectedServices}){
    const [discountPercent, setDiscountPercent] = useState(0)
    const [discounter, setDiscounter] = useState(null)
    
    const DISCOUNTERS = ['Dr. 111', 'Owner']

    return <>
        <Stack direction={'column'}  p={2}>
            <Typography variant="h6" textAlign={'start'}>Payment</Typography>
            <BookingPaymentCor isDiscounterOn={true} discountPercent={discountPercent} listSelectedServices={listSelectedServices}/>
        </Stack>
        <Stack direction={'column'} p={2}>
            <Typography variant="h6" textAlign={'start'}>Discounts</Typography>
            <Stack direction={'row'} spacing={2} p={2}>
                <Autocomplete
                    value={discounter}
                    onChange={(event,newvalue)=>{
                            setDiscounter(newvalue)
                        }}
                    id="discounters_choice"
                    options={DISCOUNTERS}
                    renderInput={(params)=><TextField {...params} label={'Discounted by:'} sx={{minWidth:'200px'}} slotProps={{inputLabel:{shrink:true},}}/>}
                />
                <TextField variant="outlined" label="Discount Percentage" name="discountpercent" sx={{width:'150px'}}
                    slotProps={{inputLabel:{shrink:true}, input:{endAdornment:<InputAdornment position="end">%</InputAdornment>}}}
                    disabled = {discounter === null}
                    value={discountPercent} onChange={(event)=>{setDiscountPercent(event.target.value)}} />
            </Stack>
        </Stack>
        <Button variant="contained">Create Payment</Button>
    </>
}