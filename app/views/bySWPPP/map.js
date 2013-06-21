function map(doc) {
    if (doc.projecttype == "SWPPP Only") {
        emit(doc._id, projectnumber, name, latitude, longitude);
    }
}