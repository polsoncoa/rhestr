function map(doc) {
    if (doc.updated && doc.name){
        emit(doc._id, doc.name);
    }
}