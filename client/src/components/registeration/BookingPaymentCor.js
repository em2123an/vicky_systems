import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { useCallback} from "react";

export default function BookingPaymentCor({discountRecords = [], isMiniTable=true, listSelectedServices, checkedServiceList=[], setCheckedServiceList=()=>{}}){
    
    const servicePriceTotal = useCallback(()=>{
        return listSelectedServices.reduce((accumulater, curr)=>accumulater + parseFloat(curr.price),0)
    },[listSelectedServices])

    const calDiscount = useCallback((selService, starterPrice)=>{
        if(!(Boolean(discountRecords))) return 0
        var discountamount = 0
        discountRecords.forEach((discountRecord)=>{
            if(discountRecord.service.serviceid === selService.serviceid){
                discountamount = starterPrice * (discountRecord.discountPercent/100)
                return
            }
        })
        return discountamount
    },[discountRecords])

    const calTotalDiscount = useCallback(()=>{
        if(!(Boolean(discountRecords))) return 0
        var discountamount = 0
        listSelectedServices.forEach((selService)=>{
            discountamount= discountamount + calDiscount(selService, selService.price)
        })
        return discountamount
    },[discountRecords,listSelectedServices,calDiscount])


    if(isMiniTable){
        //only shows the list of services and their price total
        return <>
            {listSelectedServices.length !==0 && <TableContainer sx={{marginY:1}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2}>List of Services</TableCell>
                                    <TableCell>Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {listSelectedServices.map((value, index)=>{
                                    return <TableRow key={value.servicename}>
                                        <TableCell colSpan={2}>{value.servicename}</TableCell>
                                        <TableCell>{value.price}</TableCell>
                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell />
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell>{servicePriceTotal()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>}
        </>
    }

    const spt = servicePriceTotal()
    const tdp = calTotalDiscount()

    return <>
        {listSelectedServices.length !==0 && <TableContainer sx={{marginY:1}}>
                    <Table sx={{width:'90%'}} >
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox size="small" 
                                        indeterminate={checkedServiceList.length>0 && checkedServiceList.length<listSelectedServices.length}
                                        checked={checkedServiceList.length===listSelectedServices.length} 
                                        onChange={(event)=>{
                                            if(event.target.checked){
                                                //try to select all
                                                setCheckedServiceList([...listSelectedServices])
                                            }else{
                                                //try to deselect all
                                                setCheckedServiceList([])
                                            }
                                        }}/>
                                </TableCell>
                                <TableCell padding="none">List of Services</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Subtotal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listSelectedServices.map((value, index)=>{
                                const discountamount = calDiscount(value, value.price)
                                return <TableRow key={value.servicename}
                                    hover
                                    role='checkbox'
                                    selected={checkedServiceList.includes(value)}
                                    
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox size={'small'} checked={checkedServiceList.includes(value)}
                                            onChange={(event)=>{
                                                console.log(checkedServiceList)
                                                if(event.target.checked){
                                                    //selected
                                                    setCheckedServiceList((prev)=>([...prev,value]))
                                                }else{
                                                    //not selected
                                                    console.log('uncheck running')
                                                    setCheckedServiceList((prev)=>{
                                                        return prev.filter((selService)=>!(selService.serviceid===value.serviceid))
                                                    })
                                                }
                                            }}
                                            />
                                    </TableCell>
                                    <TableCell padding="none">{value.servicename}</TableCell>
                                    <TableCell>{value.price}</TableCell>
                                    <TableCell>{discountamount}</TableCell>
                                    <TableCell>{value.price - discountamount}</TableCell>
                                </TableRow>
                            })}
                            <TableRow>
                                <TableCell />
                                <TableCell align="right">Total</TableCell>
                                <TableCell>{spt}</TableCell>
                                <TableCell>{tdp}</TableCell>
                                <TableCell>{spt-tdp}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>}
    </>
    
    // const baseColumnOptions = {
    //     sortable: false,
    //     pinnable: false,
    //     hideable: false
    // }
    // const hiddenFields = [GRID_CHECKBOX_SELECTION_COL_DEF.field]
    // const getTogglableColumns = (columns)=>{
    //     console.log(GRID_CHECKBOX_SELECTION_COL_DEF.field)
    //     return columns
    //     .filter((column)=>!(hiddenFields.includes(column.field)))
    //     .map((column)=>column.field)
    // }
    // if(!(isTableMode)){
    //     return <>{listSelectedServices.length!==0 &&
    //         <DataGrid
    //             columns={[
    //                 {field:'servicename', 
    //                     headerName:'Service Lists', 
    //                     flex:2,
    //                     ...baseColumnOptions,
    //                     valueGetter : (value,row)=>{
    //                         if(row.serviceid==='subtotal' || row.serviceid==='discount' || row.serviceid==='total'){
    //                             return row.label
    //                         }
    //                         return value
    //                     },
    //                 },
    //                 {field:'price', 
    //                     headerName:'Price', 
    //                     flex:1,
    //                     ...baseColumnOptions,
    //                     valueGetter : (value,row)=>{
    //                         if(row.serviceid==='subtotal' || row.serviceid==='discount' || row.serviceid==='total'){
    //                             return row.value
    //                         }
    //                         return value
    //                     }
    //                 }
    //             ]}
    //             rows={[...listSelectedServices,
    //                 {serviceid:'subtotal', label:'Subtotal', value: invoiceSubTotal()},
    //                 {serviceid:'discount', label:'Discount', value: discounter(discountPercent)},
    //                 {serviceid:'total', label:'Total', value: invoiceTotal()}
    //             ]}
    //             getRowId={(service)=>(service.serviceid)}
    //             getCellClassName={(params)=>{
    //                 if(params.field==='servicename' && (params.value==='Subtotal'||params.value==='Discount'||params.value==='Total')){
    //                     return 'rightalign'
    //                 } return ''
    //             }}
    //             isRowSelectable={(params)=>!(params.row.serviceid==='subtotal'|| params.row.serviceid==='discount' || params.row.serviceid==='total')}
    //             checkboxSelection
    //             slotProps={{
    //                 columnsManagement:{getTogglableColumns,}
    //             }}
    //             hideFooter
    //             disableColumnFilter
    //             sx={isDiscounterOn ? 
    //                 {
    //                     width:'90%',
    //                     [`.${gridClasses.cell}.normalalign`]:{textAlign:'left'},
    //                     [`.${gridClasses.cell}.rightalign`]: {textAlign:'right'}
    //                 } :
    //                 {
    //                     [`.${gridClasses.cell}.normalalign`]:{textAlign:'left'},
    //                     [`.${gridClasses.cell}.rightalign`]: {textAlign:'right'}
    //                 }}
    //             autosizeOptions={{
    //                 columns:['servicename','price'],
    //                 includeHeaders: false,
    //                 includeOutliers: true
    //             }}
    //         />
    //     }
    //     </>
    // }
}