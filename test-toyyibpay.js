const TOYYIBPAY_SECRET = 'pj15zsxo-4y87-pwky-i11o-jc9p47lx75j8';
const TOYYIBPAY_CATEGORY = 'e01m1sk5';

async function test() {
  const formData = new URLSearchParams();
  formData.append('userSecretKey', TOYYIBPAY_SECRET);
  formData.append('categoryCode', TOYYIBPAY_CATEGORY);
  formData.append('billName', 'Langganan Sistem');
  formData.append('billDescription', 'SaaS');
  formData.append('billPriceSetting', '1');
  formData.append('billPayorInfo', '1');
  formData.append('billAmount', '12000');
  formData.append('billReturnUrl', 'https://example.com');
  formData.append('billCallbackUrl', 'https://example.com');
  formData.append('billExternalReferenceNo', 'SUB-12345');
  formData.append('billTo', 'Admin');
  formData.append('billEmail', 'admin@example.com');
  formData.append('billPhone', '0123456789');

  const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });

  const text = await response.text();
  console.log('RESPONSE:', text);
}
test();
