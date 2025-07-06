const maskCPF = (value: string | null) => {
  if (typeof value !== 'string' || value === '') {
    return value;
  }
  const maskedValue = value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
  return maskedValue;
};

const maskPhone = (value: string | null): string => {
  if (value === null || value === '') {
    return '';
  }

  const digitsOnly = value.replace(/\D/g, '');

  let maskedValue: string;
  if (digitsOnly.length === 11) {
    maskedValue = digitsOnly.replace(
      /(\d{2})(\d{1})(\d{4})(\d{4})/,
      '($1) $2 $3-$4'
    );
  } else {
    maskedValue = digitsOnly.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return maskedValue;
};

const maskOnlyNum = (value: string | null) => {
  if (typeof value !== 'string' || value === '') {
    return value;
  }
  const maskedValue = value.replace(/\D/g, '');
  return maskedValue;
};

const maskCNS = (value: string | null) => {
  if (typeof value !== 'string' || value === '') {
    return value;
  }
  const maskedValue = value.replace(
    /^(\d{3})(\d{4})(\d{4})(\d{4})$/,
    '$1 $2 $3 $4'
  );
  return maskedValue;
};

const maskNRP = (value: string | null) => {
  if (typeof value !== 'string' || value === '') {
    return value;
  }
  const maskedValue = value.replace(/^(\d{8})(\d{1})$/, '$1-$2');
  return maskedValue;
};

const maskDate = (value: string | null): string => {
  if (value === null) {
    return '';
  }

  const dateRegex = /^(\d{2})(\d{2})(\d{4})$/;

  if (dateRegex.test(value)) {
    return value.replace(dateRegex, '$1/$2/$3');
  }

  return value;
};

const checkAlpha = (char: string) => {
  if (/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]/.test(char)) {
    return true;
  } else {
    return false;
  }
};

export {
  maskCPF,
  maskPhone,
  maskOnlyNum,
  maskCNS,
  maskNRP,
  maskDate,
  checkAlpha,
};
