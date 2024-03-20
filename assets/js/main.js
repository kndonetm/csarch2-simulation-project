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
});