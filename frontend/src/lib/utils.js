class Util {
  static isEmptyString(str) {
    return (typeof str === "string" || str instanceof String) && str.trim() === "";
  }
}

export default Util;
