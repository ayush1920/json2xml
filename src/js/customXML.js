// Custom convertion for Implementation Team (Company). 


import dicttoxml from "./dict2xml";

const isPositiveNumeric = (key) => {
    const intData = parseInt(key);
    const floatData = parseFloat(key);
    if (intData !== floatData)
        return false;

    return intData === Math.abs(intData);
}


const isinstance = (value, objClass) => {
    if (!objClass)
        return new Error(`cannot match class of ${objClass}`)

    if (value === null)
        return false;

    if (objClass.constructor !== Array)
        objClass = [objClass]
    return objClass.includes(value.constructor)
}

const my_item_func = (x) => {
    return `child_${x}`
}

const nested_update = (obj) => {
    if (isinstance(obj, Array))
        return obj.map(value => nested_update(value))

    if(!isinstance(obj, Object))
        return obj

    let temp_count = 0;
    let keys = Object.keys(obj);

    keys.forEach((key) => {
        if (isPositiveNumeric(key)) {
            let value = obj[key]
                ;
            if (isinstance(value, Object)) {
                value = { 'value': key, ...value }
            }

            else if (isinstance(value, String) || isinstance(value, Number)) {
                value = { 'value': key, 'element_value': value }
            }

            else if (isinstance(value, Array)) {
                let x = value.map((item, index) => [`__child_type__${index}`, item]).reduce((a, v) => ({ ...a, [v[0]]: v[1] }), {})
                value = { 'value': key, ...x }
            }
            else {
                throw new Error('Internal Error. Type not found')
            }

            const temp_key = `__type__${temp_count}`
            obj[temp_key] = value
            delete obj[key]
            key = temp_key
            temp_count += 1
        }
        if (isinstance(obj[key], Object)) {
            obj[key] = nested_update(obj[key])
        }

        else if(isinstance(obj[key], Array)) {
            obj[key] = obj[key].map(value => nested_update(value))
        }
    })

    return obj
}

const customdict2xml = (jsonObject, conversionProps) => {
    conversionProps = {...conversionProps, item_func: my_item_func}
    
    jsonObject = nested_update(jsonObject);
    
    let xmlString = dicttoxml(jsonObject, conversionProps);
    xmlString = xmlString.replace(/__type__\d+/gm, 'type')
    xmlString = xmlString.replace(/__child_type__\d+/gm,'child_type')
    xmlString = xmlString.replace('<root>', '').replace('</root>', '')
    return xmlString
}

export default customdict2xml