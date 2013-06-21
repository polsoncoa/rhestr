function map(doc) {
    if (doc.projecttype == "Miscellaneous") {
        emit(doc._id, prjectnumber, name, latitude, longitude);
    }
}