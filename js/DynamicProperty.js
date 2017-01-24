/**
 * A {@link Property} whose value does not change with respect to simulation time.
 *
 * @alias DynamicProperty
 * @constructor
 *
 * @param {Object} [value] The property value.
 *
 * @see DynamicProperty
 *
 * @exception {DeveloperError} value.clone is a required function.
 * @exception {DeveloperError} value.equals is a required function.
 */
function DynamicProperty(value) {
    this._value = undefined;
    this._hasClone = false;
    this._hasEquals = false;
    this._definitionChanged = new Cesium.Event();
    this._constant = false;
    this.setValue(value);
}

Cesium.defineProperties(DynamicProperty.prototype, {
    /**
     * Gets a value indicating if this property is constant.
     * This property always returns <code>true</code>.
     * @memberof DynamicProperty.prototype
     *
     * @type {Boolean}
     * @readonly
     */
    isConstant : {
        get: function() {
            return this._constant;
        },
        set: function(value) {
            if (this._constant !== value) {
                this._constant = value;
                this._definitionChanged.raiseEvent(this);
            }
        }
    },
    /**
     * Gets the event that is raised whenever the definition of this property changes.
     * The definition is changed whenever setValue is called with data different
     * than the current value.
     * @memberof DynamicProperty.prototype
     *
     * @type {Event}
     * @readonly
     */
    definitionChanged : {
        get : function() {
            return this._definitionChanged;
        }
    }
});

/**
 * Gets the value of the property.
 *
 * @param {JulianDate} [time] The time for which to retrieve the value.  This parameter is unused since the value does not change with respect to time.
 * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
 * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
 */
DynamicProperty.prototype.getValue = function(time, result) {
    return this._hasClone ? this._value.clone(result) : this._value;
};

/**
 * Sets the value of the property.
 *
 * @param {Object} value The property value.
 *
 * @exception {DeveloperError} value.clone is a required function.
 * @exception {DeveloperError} value.equals is a required function.
 */
DynamicProperty.prototype.setValue = function(value) {
    var oldValue = this._value;
    if (oldValue !== value) {
        var isDefined = Cesium.defined(value);
        var hasClone = isDefined && typeof value.clone === 'function';
        var hasEquals = isDefined && typeof value.equals === 'function';

        this._hasClone = hasClone;
        this._hasEquals = hasEquals;

        var changed = !hasEquals || !value.equals(oldValue);
        if (changed) {
            this._value = !hasClone ? value : value.clone();
            this._definitionChanged.raiseEvent(this);
        }
    }
};

/**
 * Compares this property to the provided property and returns
 * <code>true</code> if they are equal, <code>false</code> otherwise.
 *
 * @param {Property} [other] The other property.
 * @returns {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
 */
DynamicProperty.prototype.equals = function(other) {
    return this === other || //
           (other instanceof DynamicProperty && //
            ((!this._hasEquals && (this._value === other._value)) || //
            (this._hasEquals && this._value.equals(other._value))));
};
