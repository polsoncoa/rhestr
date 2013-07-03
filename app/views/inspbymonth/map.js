function map(doc) {
    if (doc.type=="inspection") {
        emit(doc.inspector, doc.date);
    }
}