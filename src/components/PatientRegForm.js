import PatientRegBooking from "./PatientRegBooking";
import { Box, Button, Container, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import {useState} from "react";
import {useFormik} from 'formik'

export default function PatientRegForm({setIsRegistering}){
    
    const formik = useFormik({
        initialValues :{
            firstname:'',
            lastname:'',
            mobileno:'9',
            age_yrs:'',
            age_mns:'',
            age_dys:'',
        },
        validate : (values)=>{
            const errors = {}
            if(!values.firstname){
                errors.firstname = "Required"
            }
            if(!values.lastname){
                errors.lastname = "Required"
            }
            if(!values.mobileno){
                errors.mobileno = "Required"
            }
            return errors
        },
        onSubmit : (values)=>{
            alert(JSON.stringify(values,null,2))
        }
    })

    return (
        <>
            <Container>
                <Box component={'form'} onSubmit={formik.handleSubmit} >
                    <Box sx={{display:'flex', flexDirection:'column', alignItems:'flex-start', width:'fit-content', padding:'24px', border:1, borderRadius:'8px'}}>
                        <Typography variant="h5" textAlign={'start'}>Personal Information</Typography>
                        <Stack direction={'row'} spacing={2} sx={{marginTop:'16px'}}>
                            <TextField required onBlur={formik.handleBlur} error={formik.touched.firstname && formik.errors.firstname} value={formik.values.firstname} onChange={formik.handleChange} variant="outlined" name="firstname" label='First name' slotProps={{inputLabel:{shrink:true,},}} />
                            <TextField required onBlur={formik.handleBlur} error={formik.touched.lastname && formik.errors.lastname} value={formik.values.lastname} onChange={formik.handleChange} variant="outlined" name="lastname" label='Last name' slotProps={{inputLabel:{shrink:true,},}}/>
                        </Stack>
                        <Stack direction={'column'} spacing={0}component={'fieldset'} sx={{marginY:'8px'}}>
                            <Typography variant="h6" component={'legend'}>Age</Typography>
                            <Stack direction={'row'} spacing={2}>
                                <TextField variant="outlined" value={formik.values.age_yrs} onChange={formik.handleChange} name="age_yrs" size="small" sx={{width:'150px'}} slotProps={{input:{endAdornment:<InputAdornment position="end">Year</InputAdornment>}}}/>
                                <TextField variant="outlined" value={formik.values.age_mns} onChange={formik.handleChange} name="age_mns" size="small" sx={{width:'150px'}} slotProps={{input:{endAdornment:<InputAdornment position="end">Month</InputAdornment>}}}/>
                                <TextField variant="outlined" value={formik.values.age_dys} onChange={formik.handleChange} name="age_dys" size="small" sx={{width:'150px'}} slotProps={{input:{endAdornment:<InputAdornment position="end">Day</InputAdornment>}}}/>
                            </Stack>
                        </Stack>
                        <Stack direction={'row'} spacing={1} sx={{marginY:'8px'}}>
                            <TextField required onBlur={formik.handleBlur} error={formik.touched.mobileno && formik.errors.mobileno} value={formik.values.mobileno} onChange={formik.handleChange} variant="outlined" name="mobileno" label='Mobile Numbner' slotProps={{inputLabel:{shrink:true,}, input:{startAdornment:<InputAdornment position="start">+251</InputAdornment>}}}/>
                        </Stack>
                    </Box>
                    <PatientRegBooking/>
                    <Stack direction={'row'} spacing={3}>
                        <Button variant="contained" onClick={formik.handleSubmit}>Done</Button>
                        <Button variant='contained' onClick={()=>{
                            setIsRegistering(false)
                        }}>Back</Button>
                    </Stack>
                </Box>
            </Container>
        </>
    )
}