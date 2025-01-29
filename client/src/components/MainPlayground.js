import {useState, useRef} from "react"
import SchedulerFront from "./SchedulerFront"
import PatientRegForm from "./registeration/PatientRegForm"
import PatientRegUploader from "./registeration/PatientRegUploader"
import PatientRegPayment from "./registeration/PatientRegPayment"
import PatDetailView from "./PatDetailView"
import {Step, StepLabel, Stepper, Button, Stack, Box, CircularProgress, Snackbar, Backdrop} from "@mui/material"
import { blue } from '@mui/material/colors'
import {useFormik} from 'formik'
import { array, number, object, string } from 'yup'
import {format, sub} from 'date-fns'
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import axios from 'axios'

export default function MainPlayground(){
    //main state hub
    const [isRegistering, setIsRegistering] = useState(false)
    const [isDetailViewing, setIsDetailViewing] = useState(false)
    const [activeStep, setActiveStep] = useState(0)
    const [listSelectedServices, setListSelectedServices] = useState([])
    const [curEvents, setCurEvents] = useState()
    const [isSaving, setIsSaving] = useState(false)
    const [snackHandle, setSnackHandle] = useState({snackopen:false,snackmessage:''})
    const [fileUploaded, setFileUploaded] = useState([])
    const queryClient = useQueryClient()

    //get services; set infinity for stay time; load on page load
    const {isPending: isServiceListLoading, isError: isServiceListError, 
        isSuccess: isServiceListSuccess, data:serviceList} = useQuery(
        {queryKey:['get_services'], 
        queryFn: ()=>(axios.get('http://localhost:8080/getservicesdata')),
        gcTime : 'Infinity',
        select : (response)=>(response.data),
        })
    //get all the appointments
    const {isPending: isGetApptsLoading,isError: isGetApptsError, isSuccess: isGetApptsSuccess, data:getAppts} = useQuery({
        queryKey:['get_appointments','all'],
        queryFn: ()=>(axios.get('http://localhost:8080/getappointments')),
        enabled : !!serviceList,
        select: (response)=>{
            //console.log(response.data)
            return response.data.map((value)=>({
                    title : `${value.firstname} ${value.lastname}`,
                    start : value.scheduledatetime_start,
                    end: value.scheduledatetime_end,
                    backgroundColor: blue[800], 
                    borderColor:blue[800],
                    extendedProps : {...value}
                }))
        }
    })
    //mutation call to upload files
    const mutupload = useMutation({
        mutationKey:['documentuploads'],
        mutationFn: (newUpload)=>(
            axios.post('http://localhost:8080/postfileuploads',newUpload,
                {headers:{"Content-Type":"multipart/form-data"}})
            ),
        onSuccess: ()=>{
            
        }
    })

    const steps =['Booking Information', 'Necessary Documents', 'Payment Details']
    
    const isSaveExit = useRef(false)//used to saveExit or to go to next step
    
    function handleEventSaveExit(){
        isSaveExit.current = false //reset isSaveExit ref
        setIsSaving(true)
        //to get DOB
        const resultdate = sub(Date.now(),{
            years:formik.values.age_yrs,
            months:formik.values.age_mns,
            days:formik.values.age_dys
        })
        //for setting curEvent (registering values) into whole events
        axios.post('http://localhost:8080/makeappointment',{
            department : 'Radiology',
            firstname : formik.values.firstname,
            lastname : formik.values.lastname,
            sex: formik.values.sex,
            mobileno : formik.values.mobileno,
            dob : format(resultdate,'yyyy-MM-dd'),
            services : listSelectedServices.map((ser)=>(ser.serviceid)),
            sched_start : format(curEvents.start,'yyyy-MM-dd HH:mm:ss'),
            sched_end : format(curEvents.end,'yyyy-MM-dd HH:mm:ss')
        },{headers:{"Content-Type":"multipart/form-data"}}).then(async (res)=>{
            if(res.status===200){
                //file uploads are done after appointment is made
                //TODO: make file upload and apointment in one transaction
                if(fileUploaded.length!==0){
                    //if there are files to be uploaded
                    try {
                        const formData = new FormData()
                        formData.append('visitid', res.data.visitid)
                        fileUploaded.forEach((value)=>{
                            formData.append(value.documentUploadType, value.file)
                        })
                        await mutupload.mutateAsync(formData)
                        setSnackHandle((prev)=>({...prev, snackopen:true, snackmessage:'Saved Successfully'}))               
                    } catch (error) {
                        setSnackHandle((prev)=>({...prev, snackopen:true, snackmessage:'Appointment Made; Failed to Upload files'}))
                    } 
                }else{
                    //no files to be uploaded
                    setSnackHandle((prev)=>({...prev, snackopen:true, snackmessage:'Saved Successfully'}))
                }
                //it is saved 
                queryClient.invalidateQueries({queryKey:['get_appointments','all']})
                setIsSaving(false)
                setIsRegistering(false)
                setListSelectedServices([])
                setFileUploaded([])
                formik.handleReset()
                setActiveStep(0)
            }else if(res.status===505){
                setIsSaving(false)
                setSnackHandle((prev)=>({...prev, snackopen:true, snackmessage:'Connection Error! Failed to Save'}))
            }
            else{
                throw new Error()
            }
        }).catch((err)=>{
            setIsSaving(false)
            setSnackHandle((prev)=>({...prev, snackopen:true, snackmessage:'Failed to Save'}))
        })
    }
    //formik setup
    const formik = useFormik({
        initialValues :{
            firstname:'',
            lastname:'',
            sex:'',
            mobileno:'',
            age_yrs:'',
            age_mns:'',
            age_dys:'',
            selservices : []
        },
        validationSchema : object({
            firstname: string().required("Required"),
            lastname: string().required("Required"),
            sex: string().required("Required"),
            mobileno: string().matches(new RegExp('^[0-9]+$')).required("Required"),
            age_yrs: number().positive().integer().test((val, ctx)=>{
                var {age_dys, age_mns} = ctx.parent
                if(!(age_dys || age_mns)) return val!=null
                return true
            }),
            age_mns: number().positive().integer().test((val, ctx)=>{
                var {age_yrs, age_dys} = ctx.parent
                if(!(age_yrs || age_dys)) return val!=null
                return true
            }),
            age_dys: number().positive().integer().test((val, ctx)=>{
                var {age_yrs, age_mns} = ctx.parent
                if(!(age_yrs || age_mns)) return val!=null
                return true
            }),
            selservices : array().min(1)
        }),
        validateOnChange : true,
        onSubmit : (values)=>{
            if(isSaveExit.current){
                handleEventSaveExit()
            }else{
                setActiveStep((prev)=>(prev+1))
            }
        }
    })

    //handle upload click on patientRegUploader
    //TODO: to save it on state until a final save and Exit
    function handleUploadClick(documentUploadType, event){
        console.log(event.target.files[0])
        setFileUploaded((prev)=>[...prev,{
            documentUploadType,
            file : event.target.files[0],
            mimetype : event.target.files[0].type,
            filePath: '',
            uploadAt: ''
        }])
    }
    //handle file delete click on patientRegUploader
    //TODO: just remove it from state
    function handleFileDeleteClick(index){
        setFileUploaded((prev)=>{
            var newArr = prev
            newArr.splice(index,1)
            return [...newArr]
        })
    }

    if(isServiceListError || isGetApptsError){
        setSnackHandle((prev)=>({...prev,snackopen:true, snackmessage:"Network Error"}))
        return (<>
            {/* to show error message and empty schedule */}
                    <Snackbar
                        anchorOrigin={{vertical:'top', horizontal:'center'}}
                        open={snackHandle.snackopen}
                        autoHideDuration={5000}
                        onClose={()=>setSnackHandle((prev)=>({...prev,snackopen:false}))}
                        message={snackHandle.snackmessage}
                     />
                    <SchedulerFront events={isGetApptsError ? [] : getAppts} setIsRegistering={setIsRegistering} setIsDetailViewing={setIsDetailViewing} setCurEvents={setCurEvents}/>
        </>)}

    return (
        <>
            {isServiceListLoading ? <Box sx={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                    <CircularProgress/>
                </Box>:
            <>
            {(isRegistering && isServiceListSuccess) ? 
                <Box display={'flex'} flexDirection={'column'}>
                    <Backdrop
                        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                        open={isSaving}
                        onClick={()=>{}}
                    >
                        <CircularProgress/>
                    </Backdrop>
                    <Snackbar
                        anchorOrigin={{vertical:'top', horizontal:'center'}}
                        open={snackHandle.snackopen}
                        autoHideDuration={5000}
                        onClose={()=>setSnackHandle((prev)=>({...prev,snackopen:false}))}
                        message={snackHandle.snackmessage}
                     />
                    {/* View when registering patients as isRegistering = true */}
                    <Stepper activeStep={activeStep} sx={{m:1, p:1, marginBottom:2}}>
                        {steps.map((value, index)=>{
                            return (<Step key={value}>
                                        <StepLabel>{value}</StepLabel>
                                    </Step>)
                        })}
                    </Stepper>
                    {activeStep===0 ? 
                            <PatientRegForm serviceList={serviceList} curEvents={curEvents} setCurEvents={setCurEvents} 
                                formik={formik} isRegistering={isRegistering} setIsRegistering={setIsRegistering} 
                                events={getAppts} 
                                listSelectedServices={listSelectedServices} setListSelectedServices={setListSelectedServices}/>
                        : activeStep ===1 ?
                            <PatientRegUploader handleUploadClick={handleUploadClick} handleFileDeleteClick={handleFileDeleteClick}
                                fileUploaded={fileUploaded}/>
                        : <PatientRegPayment listSelectedServices={listSelectedServices} />
                    }
                    <Stack direction={'row-reverse'} spacing={3} p={2} sx={{justifyContent:'center', flexShrink:2}}>
                        <Button variant='contained' onClick={(event)=>{
                            if(activeStep===0){
                                formik.handleSubmit(event)
                            }else{
                                setActiveStep((prev)=>(prev+1))
                            }
                            if((activeStep+1)===steps.length){
                                handleEventSaveExit()
                            }
                        }}>{(activeStep+1)===steps.length ? "Finish" : "Next"}</Button>
                        
                        <Button variant="contained" onClick={(event)=>{
                            formik.handleSubmit(event)
                            isSaveExit.current = true
                            //figure out to save events
                            //also to keep information for the back button
                        }}>{"Save & Exit"}</Button>

                        <Button variant='contained' onClick={()=>{
                                if(activeStep===0){
                                    setFileUploaded([])
                                    setIsRegistering(false)
                                    setListSelectedServices([])
                                    formik.handleReset()
                                    return
                                }else{
                                    setActiveStep((prev)=>(prev-1))
                                }
                            }}>Back</Button>
                    </Stack>
                </Box> :
                isDetailViewing ?
                <>
                    {/* for Detail Viewing */}
                    <PatDetailView oldPatDetail={curEvents} setIsDetailViewing={setIsDetailViewing} serviceList={serviceList}/>
                </>:
                <>
                    {/* for schedule view */}
                    {/* for loading view */}
                    <Backdrop
                        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                        open={isGetApptsLoading}
                        onClick={()=>{}}
                    >
                        <CircularProgress/>
                    </Backdrop>
                    {/* for snack bar (info) view */}
                    <Snackbar
                        anchorOrigin={{vertical:'top', horizontal:'center'}}
                        open={snackHandle.snackopen}
                        autoHideDuration={5000}
                        onClose={()=>setSnackHandle((prev)=>({...prev,snackopen:false}))}
                        message={snackHandle.snackmessage}
                     />
                    <SchedulerFront events={getAppts} setIsRegistering={setIsRegistering} setIsDetailViewing={setIsDetailViewing} setCurEvents={setCurEvents}/>
                </>
            }
            </>}
        </>
    )
}