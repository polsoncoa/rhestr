function map(doc) {
    if (doc.projecttype =="Work Order") {
        emit(doc.inspector, {inspector:doc.inspector, COA:doc.projectnumber, Project:doc.projectname, Latitude:doc.latitude, Longitude:doc.longitude});
    }
}