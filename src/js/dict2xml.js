// Port of dicttoxml.py file into Javascript.

// source - https://github.com/quandyfactory/dicttoxml/blob/master/dicttoxml.py

// =============================================
// |         Last Modified: '04/07/2023'        |
// |                 Ayush Kumar                |
// =============================================


const __version__ = '1.7.16'
const version = __version__

const randint = (start, end) => {
    if (start < 0)
        throw new Error('Start should minimum be 0')
    if (end <= 0)
        throw new Error('End number should minimum be 1')


    if (end < start) {
        let x = start
        start = end
        end = x;
    }

    const ratio = (end - start)
    return Math.floor(Math.random() * ratio + start)
}

const iterable = [Array, Object, Set]

const isinstance = (value, objClass) => {
    if (!objClass)
        return new Error(`cannot match class of ${objClass}`)

    if (objClass.constructor !== Array)
        objClass = [objClass]
    return objClass.includes(value.constructor)
}

const get_class_name = (value) => {
    try {
        return value.constructor.name
    }
    catch {
        return 'NoneType'
    }
}

const parseString = (tagName) => {
    const name = potentialName => {
        return /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/u.test(potentialName);
    };

    const qname = potentialQname => {
        return /(?:^[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}][A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}][A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$)|(?:^[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}][A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$)/u.test(potentialQname);
    };

    return name(tagName) && qname(tagName)
}

const unicode_me = (val) => {
    if (isinstance(val, Array))
        return JSON.stringify(val);

    return String(val)
}

const isDigit = (value) => {
    try {
        const intData = parseInt(String(value));
        const floatData = parseFloat(String(value));

        // value is floating point number.
        if (intData !== floatData)
            return false;

        return intData === Math.abs(intData)
    }
    catch {
        return false
    }
}


const ids_list = []

const make_id = (element, start = 100000, end = 999999) => {
    // Returns a random integer

    return `${element}_${randint(start, end)}`
}

const get_unique_id = (element) => {
    // Returns a unique id for a given element

    let this_id = make_id(element)
    let dup = true;

    while (dup) {
        if (!ids_list.includes(this_id)) {
            dup = false;
            ids_list.push(this_id)
        }
        else {
            this_id = make_id(element)
        }

    }
    return ids_list[ids_list.length - 1]
}

const get_xml_type = (val) => {
    // Returns the data type for the xml type attribute

    if (get_class_name(val) === 'NoneType')
        return 'null'

    else if (get_class_name(val) === Boolean.name)
        return 'bool'

    else if (get_class_name(val) === String.name)
        return 'str'

    else if (get_class_name(val) === Number.name && (val === parseInt(String(val))))
        return 'int'

    else if (get_class_name(val) === Number.name)
        return 'number'

    else if (get_class_name(val) === Object.name)
        return 'dict'

    else if (get_class_name(val) === Array.name)
        return 'list'
}

const escape_xml = (s) => {
    let objType = undefined
    try {
        objType = s.constructor;
    }
    catch { }

    if (objType === String) {
        s = s.replace('&', '&amp;')
        s = s.replace('"', '&quot;')
        s = s.replace('\'', '&apos;')
        s = s.replace('<', '&lt;')
        s = s.replace('>', '&gt;')
    }
    return s
}


const make_attrstring = (attr) => {
    // Returns an attribute string in the form key="val"

    let attrstring = Object.entries(attr).map((item) => { return `${item[0]}="${item[1]}"` }).join(" ")
    return `${((attrstring !== '') ? ' ' : '')}${attrstring}`
}

const key_is_valid_xml = (key) => {
    // Checks that a key is a valid XML name
    return parseString(key)
}


const make_valid_xml_name = (key, attr) => {
    key = escape_xml(key)
    attr = escape_xml(attr)

    // pass through if key is already valid
    if (key_is_valid_xml(key))
        return [key, attr]

    //  prepend a lowercase n if the key is numeric
    //  handle integers first


    if (isDigit(key))
        return [`n${key}`, attr]

    //  now handle floats
    try {
        return [`n${parseFloat(key)}`, attr]
    }
    catch { }

    //  replace spaces with underscores if that fixes the problem
    if (key_is_valid_xml(key.replace(' ', '_')))
        return [key.replace(' ', '_'), attr]

    //  key is still invalid - move it into a name attribute
    attr['name'] = key
    key = 'key'
    return [key, attr]
}



const wrap_cdata = (val) => {
    // Wraps a string into CDATA sections

    val = unicode_me(val).replace(']]>', ']]]]><![CDATA[>')
    return '<![CDATA[' + val + ']]>'
}

const default_item_func = (parent) => {
    return 'item'
}

const convert = (obj, ids, attr_type, item_func, cdata, parent = 'root', newLineChar) => {
    // Routes the elements of an object to the right function to convert them
    // based on their data type

    let item_name = item_func(parent)
    let objType = undefined;
    try {
        objType = obj.constructor;
    }
    catch { }

    if (objType === Boolean)
        return convert_bool(item_name, obj, attr_type, cdata, undefined, newLineChar)

    if (objType === undefined)
        return convert_none(item_name, obj, attr_type, cdata, undefined, newLineChar)

    if (objType === Number || objType === String)
        return convert_kv(item_name, obj, attr_type, cdata, undefined, newLineChar)

    if (obj.toISOString)
        return convert_kv(item_name, obj.toISOString(), attr_type, cdata, undefined, newLineChar)

    if (objType === Object)
        return convert_dict(obj, ids, parent, attr_type, item_func, cdata, newLineChar)

    if (objType === Array)
        return convert_list(obj, ids, parent, attr_type, item_func, cdata, newLineChar)

    throw new Error(`Unsupported data type: ${obj} (${objType})`)
}

const convert_dict = (obj, ids, parent, attr_type, item_func, cdata, newLineChar = '') => {
    // Converts a dict into an XML string.
    const output = []
    let item_name = item_func(parent);
    let objType = undefined;
    try {
        objType = obj.constructor;
    }
    catch { }

    Object.entries(obj).forEach(item => {
        let [key, val] = item;
        let attr = (!ids) ? {} : { id: String(get_unique_id(parent)) }
        const x = make_valid_xml_name(key, attr);
        key = x[0];
        attr = x[1];

        if (isinstance(val, Boolean))
            output.push(convert_bool(key, val, attr_type, cdata, attr, newLineChar))


        else if (isinstance(val, Number) || isinstance(val, String))
            output.push(convert_kv(key, val, attr_type, cdata, attr, newLineChar))

        else if (val.toISOString)
            output.push(convert_kv(key, val.toISOString(), attr_type, cdata, attr, newLineChar))

        else if (isinstance(val, Object)) {
            if (attr_type) {
                attr['type'] = get_xml_type(val)
            }
            output.push(`<${key}${make_attrstring(attr)}>${newLineChar}${convert_dict(val, ids, key, attr_type, item_func, cdata, newLineChar)}${newLineChar}</${key}>`)
        }

        else if (isinstance(val, Array)) {
            if (attr_type) {
                attr['type'] = get_xml_type(val);
            }
            output.push(`<${key}${make_attrstring(attr)}>${newLineChar}${convert_list(val, ids, key, attr_type, item_func, cdata, newLineChar)}${newLineChar}</${key}>`)
        }

        else if (objType === undefined)
            output.push(convert_none(key, val, attr_type, cdata, attr, newLineChar))

        else {
            throw new Error(`Unsupported data type: ${val} (${objType})`)
        }
    })

    return output.join(newLineChar)
}


const convert_list = (items, ids, parent, attr_type, item_func, cdata, newLineChar) => {
    const output = [];
    let item_name = item_func(parent);

    let objType = undefined;
    try {
        objType = items.constructor;
    }
    catch { }
    let this_id = undefined;


    if (ids)
        this_id = get_unique_id(parent);

    items.forEach((item, i) => {
        let attr = (!ids) ? {} : { 'id': `${this_id}_${i + 1}` }
        if (isinstance(item, Boolean))
            output.push(convert_bool(item_name, item, attr_type, cdata, attr, newLineChar))

        else if (isinstance(item, Number) || isinstance(item, String))
            output.push(convert_kv(item_name, item, attr_type, cdata, attr, newLineChar))

        else if (item.toISOString)
            output.push(convert_kv(item_name, item.toISOString(), attr_type, cdata, attr, newLineChar))

        else if (isinstance(item, Object)) {
            if (Object.keys(attr_type).length === 0) {
                output.push(`<${item_name}>${convert_dict(item, ids, parent, attr_type, item_func, cdata, newLineChar)}</${item_name}>`)
            }
            else
                output.push(`<${item_name} type="dict">${convert_dict(item, ids, parent, attr_type, item_func, cdata, newLineChar)}</${item_name}>`)

        }

        else if (isinstance(item, Array)) {
            if (Object.keys(attr_type).length === 0) {
                output.push(`<${item_name} ${make_attrstring(attr)}>${convert_list(item, ids, item_name, attr_type, item_func, cdata, newLineChar)}</${item_name}>`)
            }
            else
                output.push(`<${item_name} type="list"${make_attrstring(attr)}>${convert_list(item, ids, item_name, attr_type, item_func, cdata, newLineChar)}</${item_name}>`)
        }

        else if (objType === undefined)
            output.push(convert_none(item, undefined, attr_type, cdata, attr, newLineChar))

        else {
            throw new Error(`Unsupported data type: ${item} (${objType})`)
        }
    })
    return output.join(newLineChar);
}

const convert_kv = (key, val, attr_type, cdata = false, attr = undefined, newLineChar = '') => {
    // Converts a number or string into an XML element
    if (attr === undefined)
        attr = {}

    const x = make_valid_xml_name(key, attr)
    key = x[0]
    attr = x[1]

    if (attr_type) {
        attr['type'] = get_xml_type(val)
    }

    const attrstring = make_attrstring(attr)
    return `<${key}${attrstring}>${(cdata === true) ? wrap_cdata(val) : escape_xml(val)}</${key}>`
}


const convert_bool = (key, val, attr_type, cdata = false, attr = undefined, newLineChar = '') => {
    // Converts a boolean into an XML element

    if (attr === undefined)
        attr = {}
    const x = make_valid_xml_name(key, attr)
    key = x[0];
    attr = x[1];

    if (attr_type) {
        attr['type'] = get_xml_type(val)
    }

    const attrstring = make_attrstring(attr)
    return `<${key}${attrstring}>${unicode_me(val).toLowerCase()}</${key}>`
}


const convert_none = (key, val, attr_type, cdata = false, attr = undefined, newLineChar = '') => {
    // Converts a null value into an XML element

    if (attr === undefined)
        attr = {}
    const x = make_valid_xml_name(key, attr)
    key = x[0];
    attr = x[1];

    if (attr_type) {
        attr['type'] = get_xml_type(val)
    }
    const attrstring = make_attrstring(attr)
    return `<${key}${attrstring}></${key}>`
}


const dicttoxml = (
    obj,
    props
) => {
    //      Converts a python object into XML.
    //      Arguments:
    //      - root specifies whether the output is wrapped in an XML root element
    //       Default is True
    //     - custom_root allows you to specify a custom root element.
    //       Default is 'root'
    //     - ids specifies whether elements get unique ids.
    //       Default is False
    //     - attr_type specifies whether elements get a data type attribute.
    //       Default is True
    //     - item_func specifies what function should generate the element name for
    //       items in a list.
    //       Default is 'item'
    //     - cdata specifies whether string values should be wrapped in CDATA sec   tions.
    //     Default is False

    const defaultProps = {
        root: true,
        custom_root: 'root',
        xml_declaration: true,
        ids: false,
        attr_type: true,
        item_func: default_item_func,
        cdata: false,
        include_encoding: true,
        encoding: 'UTF-8',
        enable_new_line: true,
    }

    const { root, custom_root, xml_declaration, ids, attr_type, item_func, cdata, include_encoding, encoding, enable_new_line } = { ...defaultProps, ...props }

    const newLineChar = (enable_new_line) ? '\n' : '';
    const output = [];

    if (root === true) {
        if (xml_declaration === true) {
            if (include_encoding === false)
                output.push('<?xml version="1.0" ?>')
            else
                output.push(`<?xml version="1.0" encoding="${encoding}" ?>`)
        }

        output.push(`<${custom_root}>${newLineChar}${convert(obj, ids, attr_type, item_func, cdata, custom_root, newLineChar)}${newLineChar}</${custom_root}>`)
    }
    else {
        output.push(convert(obj, ids, attr_type, item_func, cdata, '', newLineChar))
    }
    return output.join(newLineChar)
}

export default dicttoxml