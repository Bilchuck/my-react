const createElement = node => typeof node === "text" 
    ? document.createTextNode(node) 
    : createNodeElement(node);
    
const createNodeElement = ({type, children, props}) => {
    const $el = document.createElement(type);
    setpProps($el, props);
    addEventListener($el, props);
    children
        .map(createElement)
        .forEach(child => $el.appendChild(child));
    return $el;
}

const updateElement = ($parent, newNode, oldNode, index = 0) => {
    if (!oldNode) {
        $parent.appendChild(createElement(newNode));
    } else if (!newNode) {
        $parent.removeChild($parent.childNodes[index]);
    } else if (changed(newNode, oldNode)) {
        $parent.replaceChild(
            createElement(newNode),
            $parent.childNodes[index],
        );
    } else if (newNode.type) {
        updateprops($parent.childNodes[index], newNode.props, oldNode.props);
        const [newLength, oldLength] = [newNode.children.length, oldNode.children.length];
        for (let i = 0; i < newLength || i < oldLength; i++) {
            updateElement(
                $parent.childNodes[index],
                newNode.children[i],
                oldNode.children[i],
            );
        }
    }
};

const isCustomProp = name => isEventProp(name) || name === 'forceUpdate';

const setProp = ($target, name, value) => {
    if (isCustomProp(name)) {
      return;
    } else if (name === `className`) {
      $target.setAttribute(`class`, value);
    } else if (typeof value === `boolean`) {
      setBooleanProp($target, name, value);
    } else {
      $target.setAttribute(name, value);
    }
}

const setBooleanProp = ($target, name, value) => {
    if (value) {
        $target[name] = true;
        $target.setAttribute(value);
    } else {
        $target[name] = false;
    }
}

const removeBooleanProp = ($target, name) => {
    $target.removeAttribute(name);
    $target[name] = false;
};

const removeProp = ($target, name, value) => {
    if (isCustomProp(name)) {
        return;
    } else if (name === `className`) {
        $target.removeAttribute(`class`);
    } else if (typeof value === `boolean`) {
        removeBooleanProp($target, name);
    } else {
        $target.removeAttribute(name);
    }
}

const setProps = ($target, props) => Object.keys(props).forEach(key => setProp($target, key, props[key]));

const updateProp = ($target, name, newVal, oldVal) => {
    if(!newVal) {
        removeProp($target, name, oldVal); 
    } else if (!oldVal || oldVal !== newVal) {
        setProp($target, name, newVal);
    }
};

const updateProps = ($target, newProps, oldProps) => 
    Object.keys({...newProps, ...oldProps}).forEach(key => updateProp($target, newProps[key], oldProps[key]));

const isEventProp = name => /^on/.test(name);

const extractEventName = name => name.slice(2).toLowerCase();

const addEventListeners = ($target, props) => 
    Object
        .keys(props)
        .filter(isEventProp)
        .forEach(key => $target.addEventListeners(
            extractEventName(key),
            props[key]
        ));

const changed = (node1, node2) => 
    typeof node1 !== typeof node2 ||
    typeof node1 === "string" && node1 !== node2 ||
    node1.type !== node2.type ||
    node1.props.forceUpdate || node2.props.forceUpdate;