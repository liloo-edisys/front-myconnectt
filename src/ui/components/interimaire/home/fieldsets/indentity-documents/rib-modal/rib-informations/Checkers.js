export const checkValidIban = str => {
  var CODE_LENGTHS = {
    AD: 24,
    AE: 23,
    AT: 20,
    AZ: 28,
    BA: 20,
    BE: 16,
    BG: 22,
    BH: 22,
    BR: 29,
    CH: 21,
    CR: 21,
    CY: 28,
    CZ: 24,
    DE: 22,
    DK: 18,
    DO: 28,
    EE: 20,
    ES: 24,
    FI: 18,
    FO: 18,
    FR: 27,
    GB: 22,
    GI: 23,
    GL: 18,
    GR: 27,
    GT: 28,
    HR: 21,
    HU: 28,
    IE: 22,
    IL: 23,
    IS: 26,
    IT: 27,
    JO: 30,
    KW: 30,
    KZ: 20,
    LB: 28,
    LI: 21,
    LT: 20,
    LU: 20,
    LV: 21,
    MC: 27,
    MD: 24,
    ME: 22,
    MK: 19,
    MR: 27,
    MT: 31,
    MU: 30,
    NL: 18,
    NO: 15,
    PK: 24,
    PL: 28,
    PS: 29,
    PT: 25,
    QA: 29,
    RO: 24,
    RS: 22,
    SA: 24,
    SE: 24,
    SI: 19,
    SK: 24,
    SM: 27,
    TN: 24,
    TR: 26,
    AL: 28,
    BY: 28,
    CR: 22,
    EG: 29,
    GE: 22,
    IQ: 23,
    LC: 32,
    SC: 31,
    ST: 25,
    SV: 28,
    TL: 23,
    UA: 29,
    VA: 22,
    VG: 24,
    XK: 20
  };
  var iban = String(str)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ""),
    code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/),
    digits;
  if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
    return false;
  }
  digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function(letter) {
    return letter.charCodeAt(0) - 55;
  });

  var checksum = digits.slice(0, 2),
    fragment;
  for (var offset = 2; offset < digits.length; offset += 7) {
    fragment = String(checksum) + digits.substring(offset, offset + 7);
    checksum = parseInt(fragment, 10) % 97;
  }
  return checksum;
};

export const smellsLikeIban = str => {
  if (
    /^([A-Z]{2}[ \-]?[0-9]{2})(?=(?:[ \-]?[A-Z0-9]){9,30}$)((?:[ \-]?[A-Z0-9]{3,5}){2,7})([ \-]?[A-Z0-9]{1,3})?$/.test(
      str
    )
  ) {
    const ibanStripped = str
      .replace(/[^A-Z0-9]+/gi, "") //keep numbers and letters only
      .toUpperCase(); //calculation expects upper-case
    const m = ibanStripped.match(/^([A-Z]{2})([0-9]{2})([A-Z0-9]{9,30})$/);
    if (!m) return false;

    const numbericed = (m[3] + m[1] + m[2]).replace(/[A-Z]/g, function(ch) {
      //replace upper-case characters by numbers 10 to 35
      return ch.charCodeAt(0) - 55;
    });
    //The resulting number would be to long for javascript to handle without loosing precision.
    //So the trick is to chop the string up in smaller parts.
    const mod97 = numbericed.match(/\d{1,7}/g).reduce(function(total, curr) {
      return Number(total + curr) % 97;
    }, "");

    return mod97 === 1;
  } else {
    return false;
  }
};

function validateIbanChecksum(iban) {}
