/* Function: Enables the dropdown menu if user inputs more than 7 digits in the decimal value */
document.addEventListener('DOMContentLoaded', function() {
  const numberInput = document.getElementById('decimal-box');
  const dropdown = document.getElementById('dropdown');

  numberInput.addEventListener('input', function() {
      if (this.value.length > 7) {
          dropdown.disabled = false;
      } else {
          dropdown.disabled = true;
      }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Clear button for Decimal 32 tab
  const clearDecimalBtn = document.getElementById('clear-decimal-btn');
  clearDecimalBtn.addEventListener('click', function() {
      // Clear input fields
      document.getElementById('decimal-box').value = '';
      document.getElementById('exponent-box').value = '';

      // Clear output fields
      document.querySelector('#decimal32 .binary-box').innerText = '';
      document.querySelector('#decimal32 .hexadecimal-box').innerText = '';
  });

  // Clear button for Floating Point tab
  const clearFloatBtn = document.getElementById('clear-float-btn');
  clearFloatBtn.addEventListener('click', function() {
      // Clear input fields
      document.getElementById('binary-box').value = '';

      // Clear output fields
      document.querySelector('#floatingPoint .decimal-box').innerText = '';
  });

  // Add space after every 4 binary digits
  const binaryInput = document.getElementById('binary-box');
  binaryInput.addEventListener('input', function() {
      let binaryValue = this.value.replace(/\s/g, ''); // Remove existing spaces
      binaryValue = binaryValue.replace(/(.{4})/g, '$1 '); // Insert space after every 4 characters
      this.value = binaryValue.trim(); // Update input field value
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const binaryInput = document.getElementById('binary-box');
  const convertBtn = document.getElementById('convert-float-btn');
  const errorMessage = document.getElementById('binary-error-message');

  binaryInput.addEventListener('input', function() {
      let binaryValue = this.value.replace(/\s/g, ''); // Remove existing spaces
      binaryValue = binaryValue.replace(/(.{4})/g, '$1 '); // Insert space after every 4 characters

      // Check for invalid characters and display error message
      const invalidCharacters = binaryValue.replace(/[01\s]/g, '');
      if (invalidCharacters.length > 0) {
          errorMessage.innerText = 'You can only input 0 and 1 for binary';
          this.classList.add('invalid-input');
          convertBtn.disabled = true; // Disable the convert button
      } else {
          errorMessage.innerText = '';
          this.classList.remove('invalid-input');
          convertBtn.disabled = false; // Enable the convert button
      }

      this.value = binaryValue.trim(); // Update input field value
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const decimalInput = document.getElementById('decimal-box');
  const exponentInput = document.getElementById('exponent-box');
  const convertBtn = document.getElementById('convert-decimal-btn');

  decimalInput.addEventListener('input', validateDecimalInput);
  exponentInput.addEventListener('input', validateExponentInput);

  function validateDecimalInput() {
      const decimalValue = decimalInput.value.trim();

      // Check if decimal input is a valid number
      const isValidDecimal = /^\d+(\.\d*)?$/.test(decimalValue);
      if (!isValidDecimal) {
          decimalInput.classList.add('invalid-input');
      } else {
          decimalInput.classList.remove('invalid-input');
      }

      validateAllInputs(); // Validate all inputs
  }

  function validateExponentInput() {
      const exponentValue = exponentInput.value.trim();

      // Check if exponent input is a valid number
      const isValidExponent = /^\d+$/.test(exponentValue);
      if (!isValidExponent) {
          exponentInput.classList.add('invalid-input');
      } else {
          exponentInput.classList.remove('invalid-input');
      }

      validateAllInputs(); // Validate all inputs
  }

  function validateAllInputs() {
      // Check if both decimal and exponent inputs are valid
      const isDecimalValid = !decimalInput.classList.contains('invalid-input');
      const isExponentValid = !exponentInput.classList.contains('invalid-input');

      // Disable or enable the convert button based on input validity
      if (isDecimalValid && isExponentValid) {
          convertBtn.disabled = false; // Enable the convert button
      } else {
          convertBtn.disabled = true; // Disable the convert button
      }
  }
});