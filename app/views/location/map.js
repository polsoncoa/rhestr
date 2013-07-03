function map(doc) {
    if (doc.name) {
        emit(doc.name,{geometry:{type:"Point",coordinate:[doc.latitude,doc.longitude]},inspector:doc.inspector});
    }
}