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

/**
 * Formata uma data no formato ISO (AAAA-MM-DD) para o formato brasileiro (DD/MM/AAAA)
 * @param value Data no formato ISO ou objeto Date
 * @returns Data formatada em DD/MM/AAAA
 */
const formatDateToBR = (value: string | Date | null): string => {
  if (!value) return '';
  
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Converte uma data do formato brasileiro (DD/MM/AAAA) para o formato ISO (AAAA-MM-DD)
 * @param value Data no formato brasileiro DD/MM/AAAA
 * @returns Data no formato ISO AAAA-MM-DD
 */
const parseDateFromBR = (value: string | null): string => {
  if (!value) return '';
  
  try {
    const [day, month, year] = value.split('/').map(Number);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Erro ao converter data:', error);
    return '';
  }
};

/**
 * Aplica uma máscara de data no formato brasileiro (DD/MM/AAAA) enquanto o usuário digita
 * @param value Valor digitado pelo usuário
 * @returns Valor formatado com a máscara DD/MM/AAAA
 */
const maskDate = (value: string | null): string => {
  if (!value) return '';
  
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara DD/MM/AAAA
  let result = '';
  
  if (numbers.length > 0) {
    result += numbers.substring(0, Math.min(2, numbers.length));
  }
  
  if (numbers.length > 2) {
    result += '/' + numbers.substring(2, Math.min(4, numbers.length));
  }
  
  if (numbers.length > 4) {
    result += '/' + numbers.substring(4, Math.min(8, numbers.length));
  }
  
  return result;
};

const maskNRP = (value: string | null) => {
  if (typeof value !== 'string' || value === '') {
    return value;
  }
  const maskedValue = value.replace(/^(\d{8})(\d{1})$/, '$1-$2');
  return maskedValue;
};

// Função antiga removida e substituida pela implementação mais robusta acima

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
  formatDateToBR,
  parseDateFromBR,
};
