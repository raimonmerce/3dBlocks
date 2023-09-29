import Observable from '../Observable.js';

export default class ObjectBody extends Observable {
    constructor(properties = {}, className) {
        super();
        this.properties = properties;
        this.className = className;
    }
}