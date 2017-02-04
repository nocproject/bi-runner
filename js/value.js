function BI_Value(id, text) {
    this.number = id;
    this.text = text;
}

BI_Value.prototype.valueOf = function() {
    return this.number;
};
