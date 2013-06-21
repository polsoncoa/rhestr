function map(doc, username) {
    if (doc.name) {
        emit(doc.name, doc.inspector);
    }
}