function queryPartGeneration(object) {
    let query = '';
    let delimiter = !object.unique ? (!object.unique ? 'OR' : 'AND') : 'AND';
    delimiter = object.update ? ',' : delimiter;
    removeKeyFromObject(object, 'unique');
    removeKeyFromObject(object, 'update');

    const keys = Object.keys(object);
    let values = [];
    let i = 0;
    keys.forEach((key) => {
        i++;
        values.push(object[key]);
        query += key + ' = ?';
        if (i < keys.length) query += ` ${delimiter} `;
    });
    return {
        values,
        query,
    };
}

function removeKeyFromObject(obj, removeKey) {
    const keys = Object.keys(obj);
    keys.forEach((key) => {
        if (key.toLowerCase() == removeKey.toLowerCase()) {
            delete obj[key];
        }
    });
}

module.exports = {
    queryPartGeneration,
    removeKeyFromObject,
}