/* Function: Enables the dropdown menu if user inputs more than 7 digits in the decimal value */
document.addEventListener("DOMContentLoaded", function () {
    const numberInput = document.getElementById("decimal-box");
    const dropdown = document.getElementById("dropdown");

    numberInput.addEventListener("input", function () {
        if (this.value.length > 7) {
            dropdown.disabled = false;
        } else {
            dropdown.disabled = true;
        }
    });
});

/* Function: Handles the clear button and adding of spaces every 4 binary digits */
document.addEventListener("DOMContentLoaded", function () {
    // Clear button for Decimal 32 tab
    const clearDecimalBtn = document.getElementById("clear-decimal-btn");
    clearDecimalBtn.addEventListener("click", function () {
        // Clear input fields
        document.getElementById("decimal-box").value = "";
        document.getElementById("exponent-box").value = "";

        // Clear output fields
        document.querySelector("#decimal32 .binary-box").innerText = "";
        document.querySelector("#decimal32 .hexadecimal-box").innerText = "";
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const decimalInput = document.getElementById("decimal-box");
    const exponentInput = document.getElementById("exponent-box");
    const convertBtn = document.getElementById("convert-decimal-btn");

    decimalInput.addEventListener("input", validateDecimalInput);
    exponentInput.addEventListener("input", validateExponentInput);

    function validateDecimalInput() {
        const decimalValue = decimalInput.value.trim();

        // Check if decimal input is a valid number
        const isValidDecimal = isValidFixedPoint(decimalValue);
        if (!isValidDecimal) {
            decimalInput.classList.add("invalid-input");
        } else {
            decimalInput.classList.remove("invalid-input");
        }

        validateAllInputs(); // Validate all inputs
    }

    function validateExponentInput() {
        const exponentValue = exponentInput.value.trim();

        // Check if exponent input is a valid number
        const isValidExponent = /^[+-]?\d+$/.test(exponentValue);
        if (!isValidExponent) {
            exponentInput.classList.add("invalid-input");
        } else {
            exponentInput.classList.remove("invalid-input");
        }

        validateAllInputs(); // Validate all inputs
    }

    function validateAllInputs() {
        // Check if both decimal and exponent inputs are valid
        const isDecimalValid = !decimalInput.classList.contains("invalid-input");
        const isExponentValid = !exponentInput.classList.contains("invalid-input");

        // Disable or enable the convert button based on input validity
        if (isDecimalValid && isExponentValid) {
            convertBtn.disabled = false; // Enable the convert button
        } else {
            convertBtn.disabled = true; // Disable the convert button
        }
    }
});

textFile = null;

document.getElementById("convert-decimal-btn").addEventListener("click", function () {
    const roundingMode = document.getElementById("dropdown").value;
    const fixedPointString = document.getElementById("decimal-box").value;
    const exponent = document.getElementById("exponent-box").value;

    const res = toDec32(fixedPointString, parseInt(exponent), roundingMode);
    if (res.error) {
        alert(res.message);
        return;
    }

    const fields = [
        res.result.signBit,
        res.result.combinationField,
        res.result.exponentContinuationField,
        res.result.coefficientContinuationField[0],
        res.result.coefficientContinuationField[1],
    ];

    const binOutput = fields.join(" ");
    document.getElementById("binary-output").innerHTML = binOutput;

    const hexOutput = parseInt(fields.join(""), 2).toString(16);
    document.getElementById("hexadecimal-output").innerHTML = hexOutput;

    textOutput = `Conversion results for ${fixedPointString} x 10^${exponent} to decimal32\nBinary output: ${binOutput}\nHexadecimal output: ${hexOutput}`;

    document.getElementById("export-decimal-btn").disabled = false;

    const data = new Blob([textOutput], { type: "text/plain" });

    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    const link = document.getElementById("export-download-link");
    link.setAttribute("download", "results.txt");
    link.href = textFile;
});

/*
Usage: 
toDec32("45.7675", 5);

Rounding mode can be "truncate", "round-down", "round-up", or "nearest"

Returns
{
    error: false,
    result: {
        signBit: '0',
        combinationField: '01000',
        exponentContinuationField: '100110',
        coefficientContinuationField: [ '1001010111', '1101110101' ]
    }
}
*/
function toDec32(fixedPointString, exponent, roundingMode = "nearest") {
    // Handle NaN case
    if (fixedPointString.toLowerCase() === "nan") {
        return {
            error: false,
            result: {
                signBit: "0",
                combinationField: "11111",
                exponentContinuationField: "000000",
                coefficientContinuationField: ["0000000000", "0000000000"],
            },
        };
    }

    // Handle invalid input
    if (!isValidFixedPoint(fixedPointString)) {
        return { error: true, message: "Error: Invalid input" };
    }

    // Clear whitespace
    fixedPointString = fixedPointString.trim();

    // Calculate sign bit
    signBit = "0";

    if (fixedPointString[0] === "-") {
        signBit = "1";
        fixedPointString = fixedPointString.slice(1);
    } else if (fixedPointString[0] === "+") {
        fixedPointString = fixedPointString.slice(1);
    }

    // Normalize
    // remove decimal point (i.e. move it to the end of the number)
    // then adjust the exponent accordingly
    decimalPointIndex = fixedPointString.indexOf(".");
    if (decimalPointIndex !== -1) {
        exponent -= fixedPointString.length - decimalPointIndex - 1;
    }
    fixedPointString = fixedPointString.replace(".", "");

    // remove leading 0s
    fixedPointString = fixedPointString.replace(/^0+/g, "");

    // remove trailing 0s, then adjust the exponent accordingly
    num_trailing_zeros = fixedPointString.length;
    fixedPointString = fixedPointString.replace(/0+$/g, "");
    num_trailing_zeros -= fixedPointString.length;
    exponent += num_trailing_zeros;

    // if floating point value is 0, exponent does not matter
    // always set it to 0 for consistency
    if (fixedPointString.length === 0) {
        exponent = 0;
    }

    if (fixedPointString.length < 7) {
        // not enough digits to make 7, pad the left side with 0s
        digits = zfill(fixedPointString, 7);
    } else {
        // round off extra digits
        whole = parseInt(fixedPointString.slice(0, 7));
        frac = parseFloat("0." + fixedPointString.slice(7));

        switch (roundingMode) {
            // case "truncate": do nothing
            case "round-down":
                if (signBit === "1") {
                    whole++;
                }
                break;
            case "round-up":
                if (signBit === "0") {
                    whole++;
                }
                break;
            case "nearest":
                // if tied, round up if `whole` is odd, i.e. it will become even after rounding up
                if (frac > 0.5 || (frac === 0.5 && whole % 2 == 1)) {
                    whole++;
                }
                break;
        }

        digits = whole.toString();
        // remove trailing zeros
        num_trailing_zeros = digits.length - digits.replace(/0+$/g, "").length;
        digits =
            "0".repeat(num_trailing_zeros) + digits.slice(0, digits.length - num_trailing_zeros);
        exponent += num_trailing_zeros;

        exponent += fixedPointString.length - 7;
    }

    console.log(signBit, digits, exponent);

    // handle inf
    if (exponent > 90) {
        num_leading_zeros = digits.length - digits.replace(/^0+/g, "").length;
        if (exponent - num_leading_zeros > 90) {
            return {
                error: false,
                result: {
                    signBit: signBit,
                    combinationField: "11110",
                    exponentContinuationField: "000000",
                    coefficientContinuationField: ["0000000000", "0000000000"],
                },
            };
        } else {
            // exponents between 91 and 96 can still be expressed if there are enough leading zeros
            // in the mantissa to move up
            digits = digits.slice(exponent - 90) + "0".repeat(exponent - 90);
            exponent = 90;
        }
    } else if (exponent < -101) {
        // no denormalized case, return 0.0 instead
        return toDec32("0.0", 0);
    }

    ePrime = exponent + 101;
    binaryEPrime = zfill(ePrime.toString(2), 8);
    firstDigit = parseInt(digits[0]);

    if (firstDigit & 0b1000) {
        combinationField = "11" + binaryEPrime.slice(0, 2) + (firstDigit & 0b0001).toString(2);
    } else {
        combinationField = binaryEPrime.slice(0, 2) + zfill((firstDigit & 0b0111).toString(2), 3);
    }

    exponentContinuationField = binaryEPrime.slice(2);
    coefficientContinuationField = [
        toDenselyPackedBCD(digits.slice(1, 4)),
        toDenselyPackedBCD(digits.slice(4, 7)),
    ];

    return {
        error: false,
        result: {
            signBit: signBit,
            combinationField: combinationField,
            exponentContinuationField: exponentContinuationField,
            coefficientContinuationField: coefficientContinuationField,
        },
    };
}

function isValidFixedPoint(fixedPointString) {
    return /^\s*[+-]?(\d*\.)?\d+\s*$/g.test(fixedPointString);
}

// Takes a 3 digit string, returns a string with its BCD equivalent (in bytes)
function toDenselyPackedBCD(block) {
    result = 0;

    first = parseInt(block[0]);
    second = parseInt(block[1]);
    third = parseInt(block[2]);

    // 3-bit value, where every 1 indicates a major digit and every 0 indicates a minor digit.
    // Ex. majors === 101 means the first and third digits are majors, and the second is minor.
    majors = ((first & 0b1000) >> 1) + ((second & 0b1000) >> 2) + ((third & 0b1000) >> 3);

    // bits 3, 6, 10
    result |= (first & 0b0001) << 7;
    result |= (second & 0b0001) << 4;
    result |= third & 0b0001;

    // bit 7
    result |= (majors != 0) << 3;

    // everything else
    bc = (first & 0b0110) >> 1;
    fg = (second & 0b0110) >> 1;
    jk = (third & 0b0110) >> 1;

    bitGroups = {
        0b000: [bc, fg, jk],
        0b001: [bc, fg, 0b00],
        0b010: [bc, jk, 0b01],
        0b011: [bc, 0b10, 0b11],
        0b100: [jk, fg, 0b10],
        0b101: [fg, 0b01, 0b11],
        0b110: [bc, 0b00, 0b11],
        0b111: [0b00, 0b11, 0b11],
    }[majors];

    result |= bitGroups[0] << 8;
    result |= bitGroups[1] << 5;
    result |= bitGroups[2] << 1;

    // pad the answer with zeros until length 10
    return zfill(result.toString(2), 10);
}

// append zeros to the start of the string until the desired length is reached
function zfill(string, length) {
    return ("0".repeat(length) + string).slice(-length);
}
