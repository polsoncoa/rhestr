function map(doc) {
    if (doc.type){
        emit(doc._id, doc.projectname);
    }
}