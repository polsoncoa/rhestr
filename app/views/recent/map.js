function map(doc) {
    if (doc.updated && doc.name){
        emit(doc.name, doc.name, doc.inspector);
    }
}