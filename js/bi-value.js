var BI_Value = function (id, text) {
    this.id = id;
    this.text = text;
};

BI_Value.prototype.valueOf = function() {
    return this.id;
};