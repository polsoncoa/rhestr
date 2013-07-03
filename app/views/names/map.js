function map(doc) {
    if (doc.name) {
        emit(doc.name, doc.name);
    }
}