# Getting Started with backend
    Here are the requirements
## Download and install mariadb
    Setup username and password
    use the [db_str_sql.sql] to fast setup
## Orthanc as PACS and Modality Worklist Manager
    Download Orthanc
    Use Basic Setup as given documentation
    Enable dicomweb (if not already enable)
    Enable worklist manager by setting up 
### "Worklists" : {
###    "Enable": true,
###    "Database": "./WorklistsDatabase",
    in the database key, it is a location (prefferable in absolute like C:\\orthanc\\worklistdatabase)
    Make sure the service is running or run it with script
    If you change anything in .json of orthanc, restart the service
##  To run the backend js
### node index 