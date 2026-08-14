/**
 * Convert numbers into spelled-out Malay Ringgit & Sen text
 * Example: 150 -> "Satu Ratus Lima Puluh Ringgit Sahaja"
 * Example: 1250.50 -> "Satu Ribu Dua Ratus Lima Puluh Ringgit Dan Lima Puluh Sen Sahaja"
 */

const sa = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Lapan', 'Sembilan'];
const belas = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Lapan Belas', 'Sembilan Belas'];
const puluh = ['', 'Sepuluh', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Lapan Puluh', 'Sembilan Puluh'];

function convertUnderThousand(num: number): string {
  if (num === 0) return '';

  let result = '';

  const ratusDigit = Math.floor(num / 100);
  const bakiRatus = num % 100;

  if (ratusDigit > 0) {
    if (ratusDigit === 1) {
      result += 'Seratus ';
    } else {
      result += `${sa[ratusDigit]} Ratus `;
    }
  }

  if (bakiRatus > 0) {
    if (bakiRatus < 10) {
      result += `${sa[bakiRatus]} `;
    } else if (bakiRatus >= 10 && bakiRatus < 20) {
      result += `${belas[bakiRatus - 10]} `;
    } else {
      const puluhDigit = Math.floor(bakiRatus / 10);
      const saDigit = bakiRatus % 10;
      result += `${puluh[puluhDigit]} `;
      if (saDigit > 0) {
        result += `${sa[saDigit]} `;
      }
    }
  }

  return result.trim();
}

export function numberToWordsMalay(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'Kosong Ringgit Sahaja';
  }

  const rounded = Math.abs(amount).toFixed(2);
  const parts = rounded.split('.');
  const ringgitVal = parseInt(parts[0], 10);
  const senVal = parseInt(parts[1], 10);

  let ringgitText = '';

  if (ringgitVal === 0) {
    ringgitText = 'Kosong';
  } else {
    let temp = ringgitVal;

    // Juta
    const juta = Math.floor(temp / 1000000);
    temp = temp % 1000000;

    // Ribu
    const ribu = Math.floor(temp / 1000);
    temp = temp % 1000;

    // Ratus
    const ratus = temp;

    if (juta > 0) {
      ringgitText += `${convertUnderThousand(juta)} Juta `;
    }

    if (ribu > 0) {
      if (ribu === 1) {
        ringgitText += 'Seribu ';
      } else {
        ringgitText += `${convertUnderThousand(ribu)} Ribu `;
      }
    }

    if (ratus > 0) {
      ringgitText += `${convertUnderThousand(ratus)} `;
    }
  }

  ringgitText = ringgitText.trim();

  let senText = '';
  if (senVal > 0) {
    senText = `${convertUnderThousand(senVal)} Sen`;
  }

  if (senText) {
    return `${ringgitText} Ringgit Dan ${senText} Sahaja`;
  } else {
    return `${ringgitText} Ringgit Sahaja`;
  }
}
